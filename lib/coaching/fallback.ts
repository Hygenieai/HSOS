// HYGENIE COPILOT — RULE-BASED FALLBACK SUGGESTIONS
// Source: coach-fast edge function
// Used when: AI API unavailable, budget exceeded, or API call fails

export function getRuleBasedSuggestion(triggerType: string, triggerText: string): string {
  const lower = triggerText.toLowerCase();

  switch (triggerType) {
    case 'price_pressure':
      if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive')) {
        return "Acknowledge the price concern, then refocus on ROI. Ask: 'What would it cost your company if this problem continues?'";
      }
      if (lower.includes('think') || lower.includes('consider')) {
        return "They need time to process. Offer to send specific information and schedule a follow-up call this week.";
      }
      return "Listen to their concern fully, then ask: 'What would need to change for this to work for you?'";

    case 'trust_risk':
      return "Acknowledge their skepticism directly. Ask: 'What would we need to do differently to earn your trust?'";

    case 'decision_stall':
      return "Create urgency by asking: 'What happens if you wait 3 months to solve this? What's the cost of inaction?'";

    case 'timeline_concern':
      return "Understand their deadline first. Ask: 'What's driving the urgency on your end?'";

    case 'competitor_mention':
      return "Don't badmouth the competitor. Focus on your unique value: 'What specific features are most important to you?'";

    case 'buying_signal':
      if (lower.includes('when') || lower.includes('start') || lower.includes('next step')) {
        return "Great momentum! Propose a specific next step: 'Let's schedule a demo/implementation call this week. What day works?'";
      }
      return "They're interested! Ask: 'What would need to happen for you to move forward with this?'";

    case 'authority_question':
      return "Answer with concrete social proof. Share a specific example of a similar client you've helped.";

    case 'feature_request':
      return "Understand the underlying need first. Ask: 'Help me understand - what are you trying to accomplish with that?'";

    case 'implementation_concern':
      return "Address with specifics. Walk them through exactly what implementation looks like and the support they'll get.";

    case 'needs_analysis':
      return "Continue the conversation by asking an open-ended question to understand their needs better.";

    default:
      return "Continue the conversation by asking an open-ended question to understand their needs better.";
  }
}

// Trigger detection — keyword matching against transcript text
export function detectTriggerType(text: string, recentProspectLines?: string[]): string | null {
  const lower = text.toLowerCase();

  // ── Multi-line pattern detection ──
  // Check the last 3 prospect lines together for patterns that
  // individual lines might miss
  if (recentProspectLines && recentProspectLines.length >= 2) {
    const combined = recentProspectLines.map((l) => l.toLowerCase()).join(' ');

    // Escalating hesitation → decision_stall
    const hesitationWords = (combined.match(/hmm|uh|maybe|not sure|i don't know|i guess|well|um/g) || []).length;
    if (hesitationWords >= 3) {
      return 'decision_stall';
    }

    // Repeated price/cost mentions across lines → price_pressure
    const priceWords = (combined.match(/price|cost|expensive|budget|afford|money/g) || []).length;
    if (priceWords >= 2) {
      return 'price_pressure';
    }

    // Multiple trust signals across lines → trust_risk
    const trustWords = (combined.match(/worried|concerned|risk|trust|skeptic|guarantee|scared/g) || []).length;
    if (trustWords >= 2) {
      return 'trust_risk';
    }
  }

  // ── Single-line detection (existing logic) ──

  // Price / budget objections
  if (/price|cost|expensive|budget|afford|cheap|too much|investment/.test(lower)) {
    return 'price_pressure';
  }

  // Trust / skepticism
  if (/burned|trust|skeptic|scam|too good|guarantee|risk|worried/.test(lower)) {
    return 'trust_risk';
  }

  // Decision stall / status quo
  if (/think about|get back|need to discuss|run it by|not sure|hold off|later|happy with|current solution|working fine|don't need|not broken/.test(lower)) {
    return 'decision_stall';
  }

  // Timeline concern
  if (/how long|timeline|too slow|when can|deadline|urgent|hurry/.test(lower)) {
    return 'timeline_concern';
  }

  // Competitor mention
  if (/competitor|alternative|also looking|compared to|gong|chorus|salesloft|outreach/.test(lower)) {
    return 'competitor_mention';
  }

  // Buying signal
  if (/how do we start|next step|sign up|get started|move forward|contract|pricing|proposal/.test(lower)) {
    return 'buying_signal';
  }

  // Authority question
  if (/experience|qualified|how many|track record|reference|case study|proof/.test(lower)) {
    return 'authority_question';
  }

  // Feature request
  if (/does it|can it|do you have|feature|capability|integrate|support/.test(lower)) {
    return 'feature_request';
  }

  // Implementation concern
  if (/setup|implementation|onboard|migrate|disrupt|training|learning curve/.test(lower)) {
    return 'implementation_concern';
  }

  // No coaching moment detected
  return null;
}
