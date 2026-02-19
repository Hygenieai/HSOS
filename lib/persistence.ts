// HYGENIE COPILOT — CALL PERSISTENCE
// Saves transcript lines and coaching events to Supabase when call ends

import { TranscriptLine } from '@/store/transcriptStore';
import { CoachingEvent } from '@/store/coachingStore';

interface PersistCallParams {
  supabase: any;
  sessionId: string;
  userId: string;
  lines: TranscriptLine[];
  coachingEvents: CoachingEvent[];
  duration: number;
}

export async function persistCallData({
  supabase,
  sessionId,
  userId,
  lines,
  coachingEvents,
  duration,
}: PersistCallParams): Promise<{ success: boolean; error?: string }> {
  try {
    const finalLines = lines.filter((l) => l.isFinal);

    // 1. Save transcript lines
    if (finalLines.length > 0) {
      const transcriptRows = finalLines.map((line, index) => ({
        session_id: sessionId,
        user_id: userId,
        line_number: index + 1,
        speaker: line.speaker,
        text: line.text,
        timestamp: line.timestamp,
      }));

      const { error: transcriptError } = await supabase
        .from('call_transcripts')
        .insert(transcriptRows);

      if (transcriptError) {
        console.error('[persist] Transcript save error:', transcriptError);
        // Don't fail — table might not exist yet, continue with other saves
      }
    }

    // 2. Save coaching events
    if (coachingEvents.length > 0) {
      const coachingRows = coachingEvents.map((event) => ({
        session_id: sessionId,
        user_id: userId,
        event_type: event.event_type,
        suggestion: event.suggestion,
        trigger_text: event.trigger_text,
        confidence: event.confidence,
        source: event.source,
        technique: event.technique,
        urgency: event.urgency,
        created_at: event.created_at,
      }));

      const { error: coachingError } = await supabase
        .from('coaching_events')
        .insert(coachingRows);

      if (coachingError) {
        console.error('[persist] Coaching save error:', coachingError);
      }
    }

    // 3. Update call session with final stats
    const { error: sessionError } = await supabase
      .from('call_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        transcript_line_count: finalLines.length,
        coaching_event_count: coachingEvents.length,
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('[persist] Session update error:', sessionError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[persist] Error:', error);
    return { success: false, error: error.message };
  }
}
