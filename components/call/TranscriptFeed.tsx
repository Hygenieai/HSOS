"use client";

import { useEffect, useRef } from 'react';
import { useTranscriptStore } from '@/store/transcriptStore';
import { useCallStore } from '@/store/callStore';
import { cn } from '@/lib/utils';
import { Search, MessageSquare } from 'lucide-react';
import { SpeakingIndicator } from './SpeakingIndicator';

export function TranscriptFeed() {
  const {
    getFilteredLines,
    searchQuery,
    setSearchQuery,
    autoScroll,
    setAutoScroll,
    activeSpeaker,
    getRelativeTime,
    flipSpeaker,
  } = useTranscriptStore();

  const { activeCall } = useCallStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = getFilteredLines();

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (autoScroll !== isNearBottom) {
      setAutoScroll(isNearBottom);
    }
  };

  const repName = activeCall?.contact_name ? 'You' : 'Rep';
  const prospectName = activeCall?.contact_name || 'Prospect';

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Transcript</h2>
          </div>
          {activeSpeaker && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SpeakingIndicator />
              <span>{activeSpeaker === 'rep' ? repName : prospectName} speaking</span>
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#00989E] text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Transcript lines */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Transcript will appear here when you start talking
            </p>
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                'flex gap-3 text-sm',
                !line.isFinal && 'opacity-50'
              )}
            >
              {/* Speaker label — click to fix wrong label */}
              <div className="flex-shrink-0 w-20 text-right">
                <button
                  onClick={() => line.isFinal && flipSpeaker(line.id)}
                  title={line.isFinal ? "Click to switch speaker" : undefined}
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded transition-colors',
                    line.speaker === 'rep'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-amber-500/10 text-amber-400',
                    line.isFinal && 'hover:ring-1 hover:ring-white/20 cursor-pointer'
                  )}
                >
                  {line.speaker === 'rep' ? repName : prospectName}
                </button>
                {line.isFinal && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {getRelativeTime(line.timestamp)}
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 text-foreground leading-relaxed">
                {line.text}
                {!line.isFinal && (
                  <span className="inline-block ml-1 animate-pulse text-muted-foreground">...</span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Auto-scroll indicator */}
        {!autoScroll && lines.length > 0 && (
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
              });
            }}
            className="sticky bottom-0 mx-auto block text-xs bg-[#00989E]/20 text-[#00989E] px-3 py-1 rounded-full hover:bg-[#00989E]/30 transition-colors"
          >
            Scroll to latest
          </button>
        )}
      </div>
    </div>
  );
}
