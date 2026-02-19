import { NextRequest, NextResponse } from 'next/server';
import { PLAYBOOK } from '@/lib/coaching/playbook';
import { getRuleBasedSuggestion, detectTriggerType } from '@/lib/coaching/fallback';

// ── Cooldown: prevent duplicate coaching for same trigger type ──
const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 30_000; // 30 seconds between same trigger type per session

function isCoolingDown(sessionId: string | undefined, triggerType: string): boolean {
  if (!sessionId) return false;
  const key = `${sessionId}:${triggerType}`;
  const lastFired = cooldownMap.get(key);
  if (lastFired && Date.now() - lastFired < COOLDOWN_MS) {
    return true;
  }
  cooldownMap.set(key, Date.now());
  // Cleanup old entries periodically
  if (cooldownMap.size > 200) {
    const cutoff = Date.now() - COOLDOWN_MS * 2;
    for (const [k, v] of cooldownMap) {
      if (v < cutoff) cooldownMap.delete(k);
    }
  }
  return false;
}

// ── Build dynamic system prompt ──
function buildSystemPrompt(
  template: { technique: string; prompt_type: string; text: string },
  prospectContext: any | null,
  recentTranscript: string | undefined,
  coachingTone: string | undefined,
): string {
  let prompt = `You are a real-time sales coach. Generate a brief, natural coaching suggestion (1-2 sentences max) using the ${template.technique} technique (${template.prompt_type}).

Sound like a helpful colleague whispering advice, not a textbook.

Base your response on this template, but customize it to fit the specific conversation:
"${template.text}"`;

  // Rep persona / coaching tone
  if (coachingTone) {
    const toneInstructions: Record<string, string> = {
      direct: 'Be blunt and action-oriented. No fluff. Tell them exactly what to say and do.',
      supportive: 'Be encouraging and gentle. Frame suggestions as options, not commands. Build their confidence.',
      methodical: 'Be structured and analytical. Reference the methodology. Explain the why behind the suggestion.',
    };
    const instruction = toneInstructions[coachingTone];
    if (instruction) {
      prompt += `\n\nCOACHING STYLE: ${instruction}`;
    }
  }

  // Prospect context
  if (prospectContext) {
    const parts: string[] = [];
    if (prospectContext.name) parts.push(`Prospect: ${prospectContext.name}`);
    if (prospectContext.company) parts.push(`Company: ${prospectContext.company}`);
    if (prospectContext.title) parts.push(`Role: ${prospectContext.title}`);
    if (prospectContext.notes) parts.push(`Notes: ${prospectContext.notes}`);
    if (parts.length > 0) {
      prompt += `\n\nPROSPECT CONTEXT:\n${parts.join('\n')}
Tailor your suggestion to this person's role and company. If they're a CFO, reference ROI. If they're a user, reference daily workflow.`;
    }
  }

  // Conversation tone matching
  if (recentTranscript && recentTranscript.length > 100) {
    prompt += `\n\nIMPORTANT: Match the energy and formality level of the conversation. If the prospect is casual, keep it casual. If they're formal and data-driven, be precise and structured. Don't be stiff when they're relaxed, and don't be chatty when they're all business.`;
  }

  return prompt;
}

// ── Main handler ──
export async function POST(request: NextRequest) {
  try {
    const {
      trigger_text,
      speaker,
      session_id,
      recent_transcript,
      recent_prospect_lines,
      prospect_context,
      coaching_tone,
    } = await request.json();

    if (!trigger_text) {
      return NextResponse.json({ suggestion: null, error: 'Missing trigger_text' }, { status: 400 });
    }

    // ── Speaker filter: only coach on prospect speech ──
    if (speaker === 'rep') {
      return NextResponse.json({ suggestion: 'NONE' });
    }

    // 1. Detect trigger type — single line + multi-line pattern
    const triggerType = detectTriggerType(trigger_text, recent_prospect_lines);

    // 2. No coaching moment detected
    if (!triggerType) {
      return NextResponse.json({ suggestion: 'NONE' });
    }

    // 3. Cooldown — don't spam same trigger type within 30s
    if (isCoolingDown(session_id, triggerType)) {
      return NextResponse.json({ suggestion: 'NONE', reason: 'cooldown' });
    }

    // 4. Get playbook template
    const playbookEntry = PLAYBOOK[triggerType];
    if (!playbookEntry || !playbookEntry.prompts.length) {
      return NextResponse.json({
        suggestion: getRuleBasedSuggestion(triggerType, trigger_text),
        event_type: triggerType,
        confidence: 0.6,
        source: 'fallback',
      });
    }

    // Select random prompt for variety
    const template = playbookEntry.prompts[
      Math.floor(Math.random() * playbookEntry.prompts.length)
    ];

    // 5. Try AI enhancement if context is rich enough
    let finalSuggestion = template.text;
    let source = 'playbook';

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && recent_transcript && recent_transcript.length > 50) {
      try {
        const systemPrompt = buildSystemPrompt(
          template,
          prospect_context,
          recent_transcript,
          coaching_tone,
        );

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Recent conversation:\n${recent_transcript}\n\nThe prospect just said: "${trigger_text}"\n\nGenerate a customized coaching suggestion. Just the suggestion text, nothing else.`,
              },
            ],
            max_tokens: 100,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data.choices?.[0]?.message?.content?.trim();
          if (aiText && aiText.length > 10 && aiText.length < 300) {
            finalSuggestion = aiText;
            source = 'ai_enhanced';
          }
        }
      } catch (error) {
        console.log('[coach] AI enhancement failed, using template:', error);
      }
    }

    // 6. Return coaching suggestion
    return NextResponse.json({
      suggestion: finalSuggestion,
      event_type: triggerType,
      confidence: source === 'ai_enhanced' ? 0.85 : 0.7,
      source,
      technique: template.technique,
      prompt_type: template.prompt_type,
      rationale: template.rationale,
    });
  } catch (error: any) {
    console.error('[coach] Error:', error);
    return NextResponse.json(
      { suggestion: null, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
