"use client";

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { useDeepgramTranscription } from '@/hooks/useDeepgramTranscription';
import { useTranscriptStore } from '@/store/transcriptStore';
import { useCoachingStore } from '@/store/coachingStore';
import { useCallStore } from '@/store/callStore';
import { useContactStore, Contact } from '@/store/contactStore';
import { persistCallData } from '@/lib/persistence';
import { Navigation } from '@/components/Navigation';
import { CallControl } from '@/components/call/CallControl';
import { TranscriptFeed } from '@/components/call/TranscriptFeed';
import { CoachingPanel } from '@/components/call/CoachingPanel';
import { ContactPicker } from '@/components/call/ContactPicker';
import { MicPermissionPrompt } from '@/components/call/MicPermissionPrompt';
import { PostCallSummary } from '@/components/call/PostCallSummary';
import { SpeakerToggle } from '@/components/call/SpeakerToggle';

export default function CallPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const { startCall, endCall, callStatus, activeCall, duration } = useCallStore();
  const { clearEvents, addEvent, events } = useCoachingStore();
  const { lines, clearTranscript } = useTranscriptStore();
  const { selectedContact, selectContact, loadContacts } = useContactStore();

  // ── Coaching callback: fires on every final prospect utterance ──
  const handleFinalTranscript = useCallback(async (text: string, speaker: 'rep' | 'prospect') => {
    // Read fresh from stores — no stale closures
    const currentLines = useTranscriptStore.getState().lines;
    const currentCallId = useCallStore.getState().activeCall?.id;
    const currentContact = useContactStore.getState().selectedContact;

    // Build recent transcript context (last 5 final lines)
    const finalLines = currentLines.filter((l) => l.isFinal);
    const recentLines = finalLines
      .slice(-5)
      .map((l) => `${l.speaker}: ${l.text}`)
      .join('\n');

    // Build recent prospect lines for multi-line pattern detection
    const recentProspectLines = finalLines
      .filter((l) => l.speaker === 'prospect')
      .slice(-3)
      .map((l) => l.text);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_text: text,
          speaker,
          session_id: currentCallId,
          recent_transcript: recentLines,
          recent_prospect_lines: recentProspectLines,
          prospect_context: currentContact ? {
            name: currentContact.name,
            company: currentContact.company,
            title: currentContact.title,
            notes: currentContact.notes,
          } : null,
        }),
      });

      const data = await response.json();

      if (data.suggestion && data.suggestion !== 'NONE') {
        addEvent({
          event_type: data.event_type || 'coaching',
          suggestion: data.suggestion,
          trigger_text: text,
          confidence: data.confidence,
          source: data.source,
          technique: data.technique,
          prompt_type: data.prompt_type,
          rationale: data.rationale,
        });
      }
    } catch (error) {
      console.error('[CallPage] Coach API error:', error);
    }
  }, [addEvent]);

  const { startListening, stopListening, isConnected, error: dgError, status: dgStatus } =
    useDeepgramTranscription({ onFinalTranscript: handleFinalTranscript });

  // ── Auth check ──
  useEffect(() => {
    const checkAuth = async () => {
      const client = await getSupabase();
      setSupabase(client);
      
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setIsAuthenticated(true);
      setIsLoading(false);
      loadContacts(client);
    };
    checkAuth();
  }, [router, loadContacts]);

  // ── Start call ──
  const handleStartCall = useCallback(async () => {
    if (!userId || !supabase) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', userId)
      .single();

    const { data: session, error } = await supabase
      .from('call_sessions')
      .insert({
        user_id: userId,
        org_id: profile?.org_id,
        contact_id: selectedContact?.id,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[CallPage] Failed to create session:', error);
      return;
    }

    clearEvents();
    startCall({
      id: session.id,
      contact_id: selectedContact?.id,
      contact_name: selectedContact?.name,
      call_type: 'discovery',
    });

    // Verify Zustand store has updated before opening WebSocket
    const confirmed = useCallStore.getState().callStatus;
    if (confirmed !== 'active') {
      console.error('[CallPage] callStatus not active after startCall:', confirmed);
      return;
    }

    await startListening();
  }, [userId, supabase, selectedContact, startCall, startListening, clearEvents]);

  // ── End call + persist ──
  const handleEndCall = useCallback(async () => {
    stopListening();
    endCall();

    // Persist transcript + coaching events to Supabase
    const currentCallId = useCallStore.getState().activeCall?.id;
    const currentDuration = useCallStore.getState().duration;
    const currentLines = useTranscriptStore.getState().lines;
    const currentEvents = useCoachingStore.getState().events;

    if (currentCallId && userId && supabase) {
      await persistCallData({
        supabase,
        sessionId: currentCallId,
        userId,
        lines: currentLines,
        coachingEvents: currentEvents,
        duration: currentDuration,
      });
    }
  }, [stopListening, endCall, userId, supabase]);

  // ── New call (reset everything) ──
  const handleNewCall = useCallback(() => {
    clearTranscript();
    clearEvents();
    useCallStore.setState({
      activeCall: null,
      callStatus: 'idle',
      duration: 0,
      isMuted: false,
      isOnHold: false,
    });
  }, [clearTranscript, clearEvents]);

  // ── Contact selection ──
  const handleSelectContact = useCallback((contact: Contact | null) => {
    selectContact(contact);
  }, [selectContact]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ── Mic error state ──
  if (dgError && callStatus !== 'ended') {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <CallControl
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          isTranscribing={false}
        />
        <MicPermissionPrompt
          error={dgError}
          onRetry={handleStartCall}
        />
      </div>
    );
  }

  // ── Post-call summary ──
  if (callStatus === 'ended') {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <PostCallSummary onNewCall={handleNewCall} />
      </div>
    );
  }

  // ── Pre-call state (idle) ──
  if (callStatus === 'idle') {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        {/* Pre-call header */}
        <div className="px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              {supabase && (
                <ContactPicker
                  supabase={supabase}
                  onSelect={handleSelectContact}
                  selected={selectedContact}
                />
              )}
            </div>
            <button
              onClick={handleStartCall}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F4845F] text-white hover:bg-[#e6734e] transition-colors text-sm font-medium ml-4"
            >
              Start Call
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Ready to coach</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Select a contact and start your call.
            </p>
            <p className="text-xs text-muted-foreground">
              Copilot will listen, detect coaching moments, and provide real-time suggestions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Active call state ──
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      {/* Top bar */}
      <CallControl
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        isTranscribing={isConnected}
      />

      {/* Dev tools */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="px-4 py-1 border-b border-border flex items-center gap-3 bg-card/30">
          <SpeakerToggle />
          <span className="text-[10px] text-muted-foreground">
            Deepgram: {dgStatus} | Lines: {lines.length} | Events: {events.length}
          </span>
        </div>
      )}

      {/* Main content: Transcript + Coaching */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Transcript (60%) */}
        <div className="w-3/5 border-r border-border">
          <TranscriptFeed />
        </div>

        {/* Right panel: Coaching (40%) */}
        <div className="w-2/5">
          <CoachingPanel />
        </div>
      </div>
    </div>
  );
}
