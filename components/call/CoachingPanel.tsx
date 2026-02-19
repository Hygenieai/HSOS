"use client";

import { useEffect, useRef } from 'react';
import { useCoachingStore } from '@/store/coachingStore';
import { CoachingCard } from './CoachingCard';
import { Sparkles } from 'lucide-react';

export function CoachingPanel() {
  const { getVisibleEvents, dismissEvent, saveEvent, savedIds } = useCoachingStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const events = getVisibleEvents();

  // Auto-scroll to newest coaching card
  useEffect(() => {
    if (scrollRef.current && events.length > 0) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [events.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#00989E]" />
        <h2 className="text-sm font-semibold">Live Coaching</h2>
        {events.length > 0 && (
          <span className="text-xs bg-[#00989E]/20 text-[#00989E] px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          events.map((event) => (
            <CoachingCard
              key={event.id}
              event={event}
              onDismiss={dismissEvent}
              onSave={saveEvent}
              isSaved={savedIds.has(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-12 h-12 rounded-full bg-[#00989E]/10 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-[#00989E]" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">
        Coaching suggestions will appear here
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Start talking and I'll provide real-time coaching when I detect a coaching moment.
      </p>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="italic">&quot;That&apos;s too expensive&quot;</p>
        <p className="italic">&quot;We&apos;re looking at Gong too&quot;</p>
        <p className="italic">&quot;I need to think about it&quot;</p>
      </div>
    </div>
  );
}
