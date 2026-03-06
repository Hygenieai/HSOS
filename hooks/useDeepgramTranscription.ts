"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { DeepgramService, DeepgramStatus, DeepgramTranscript } from '@/lib/deepgram/DeepgramService';
import { useTranscriptStore } from '@/store/transcriptStore';
import { useCallStore } from '@/store/callStore';

interface UseDeepgramOptions {
  onFinalTranscript?: (text: string, speaker: 'rep' | 'prospect') => void;
}

export function useDeepgramTranscription(options?: UseDeepgramOptions) {
  const [status, setStatus] = useState<DeepgramStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<DeepgramService | null>(null);
  const lineCounterRef = useRef(0);
  const interimLineIdRef = useRef<string | null>(null);

  const { addLine, updateLine, setCallStartTime, clearTranscript, setActiveSpeaker } = useTranscriptStore();

  const handleTranscript = useCallback((transcript: DeepgramTranscript) => {
    const speaker: 'rep' | 'prospect' = transcript.speaker === 0 ? 'rep' : 'prospect';
    setActiveSpeaker(speaker);

    if (transcript.isFinal) {
      // Final transcript — create permanent line
      const lineId = `line-${++lineCounterRef.current}`;

      // If there was an interim line, remove it by updating to final
      if (interimLineIdRef.current) {
        updateLine(interimLineIdRef.current, {
          text: transcript.text,
          isFinal: true,
          id: lineId,
        });
        interimLineIdRef.current = null;
      } else {
        addLine({
          id: lineId,
          line_number: lineCounterRef.current,
          speaker,
          text: transcript.text,
          timestamp: new Date().toISOString(),
          isFinal: true,
        });
      }

      // Notify callback for coaching pipeline
      options?.onFinalTranscript?.(transcript.text, speaker);
    } else {
      // Interim transcript — show in progress
      if (interimLineIdRef.current) {
        updateLine(interimLineIdRef.current, { text: transcript.text });
      } else {
        const interimId = `interim-${Date.now()}`;
        interimLineIdRef.current = interimId;
        addLine({
          id: interimId,
          line_number: lineCounterRef.current + 1,
          speaker,
          text: transcript.text,
          timestamp: new Date().toISOString(),
          isFinal: false,
        });
      }
    }
  }, [addLine, updateLine, setActiveSpeaker, options]);

  const handleStatus = useCallback((newStatus: DeepgramStatus) => {
    setStatus(newStatus);
    if (newStatus === 'error') {
      setError('Deepgram connection error');
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      clearTranscript();
      lineCounterRef.current = 0;
      interimLineIdRef.current = null;

      // Fetch token from server
      const tokenResponse = await fetch('/api/deepgram-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await getSupabaseToken())}`,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Deepgram token');
      }

      const { key } = await tokenResponse.json();

      // Create and start service
      const service = new DeepgramService(handleTranscript, handleStatus);
      serviceRef.current = service;

      setCallStartTime(Date.now());
      await service.start(key);
    } catch (err: any) {
      console.error('[useDeepgram] Start error:', err);
      // Detect mic permission denial specifically
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Microphone is in use by another application. Please close other apps using the mic.');
      } else {
        setError(err.message || 'Failed to start transcription');
      }
      setStatus('error');
    }
  }, [handleTranscript, handleStatus, clearTranscript, setCallStartTime]);

  const stopListening = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      serviceRef.current = null;
    }
    setActiveSpeaker(null);
  }, [setActiveSpeaker]);

  // Cleanup on unmount — only stop if call is actually active
  useEffect(() => {
    return () => {
      const callStatus = useCallStore.getState().callStatus;
      if (serviceRef.current && callStatus === 'active') {
        serviceRef.current.stop();
        serviceRef.current = null;
      }
    };
  }, []);

  return {
    status,
    error,
    startListening,
    stopListening,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
}

// Helper to get current Supabase auth token
async function getSupabaseToken(): Promise<string> {
  const { getSupabase } = await import('@/lib/supabase/client');
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}
