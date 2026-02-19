"use client";

import { useTranscriptStore } from '@/store/transcriptStore';
import { cn } from '@/lib/utils';

// DEV ONLY - remove for production
// Manually toggle speaker for testing when using a single microphone

export function SpeakerToggle() {
  const { activeSpeaker, setActiveSpeaker } = useTranscriptStore();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
      <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-medium">Dev</span>
      <button
        onClick={() => setActiveSpeaker('rep')}
        className={cn(
          "px-2 py-0.5 text-xs rounded transition-colors",
          activeSpeaker === 'rep'
            ? "bg-blue-500/20 text-blue-400"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Rep
      </button>
      <button
        onClick={() => setActiveSpeaker('prospect')}
        className={cn(
          "px-2 py-0.5 text-xs rounded transition-colors",
          activeSpeaker === 'prospect'
            ? "bg-amber-500/20 text-amber-400"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Prospect
      </button>
    </div>
  );
}
