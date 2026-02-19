"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CoachingEvent, CoachingUrgency } from '@/store/coachingStore';
import {
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Bookmark,
} from 'lucide-react';

interface CoachingCardProps {
  event: CoachingEvent;
  onDismiss: (id: string) => void;
  onSave: (id: string) => void;
  isSaved?: boolean;
}

const urgencyConfig: Record<CoachingUrgency, {
  gradient: string;
  border: string;
  icon: React.ElementType;
  label: string;
}> = {
  critical: {
    gradient: 'from-red-500/10 to-red-900/5',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    label: 'Critical',
  },
  warning: {
    gradient: 'from-amber-500/10 to-amber-900/5',
    border: 'border-amber-500/30',
    icon: TrendingUp,
    label: 'Warning',
  },
  opportunity: {
    gradient: 'from-emerald-500/10 to-emerald-900/5',
    border: 'border-emerald-500/30',
    icon: Lightbulb,
    label: 'Opportunity',
  },
  info: {
    gradient: 'from-blue-500/10 to-blue-900/5',
    border: 'border-blue-500/30',
    icon: Info,
    label: 'Info',
  },
};

export function CoachingCard({ event, onDismiss, onSave, isSaved }: CoachingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = urgencyConfig[event.urgency] || urgencyConfig.info;
  const Icon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(event.suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 bg-gradient-to-br transition-all duration-200',
        config.gradient,
        config.border,
        'hover:shadow-lg hover:shadow-black/20'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-current opacity-70" />
          <span className="text-xs font-medium uppercase tracking-wider opacity-60">
            {config.label}
          </span>
          {event.technique && (
            <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
              {event.technique}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Copy suggestion"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
            )}
          </button>
          <button
            onClick={() => onSave(event.id)}
            className={cn(
              "p-1 rounded hover:bg-white/10 transition-colors",
              isSaved && "text-amber-400"
            )}
            title="Save suggestion"
          >
            <Bookmark className={cn("h-3.5 w-3.5", isSaved ? "fill-current" : "opacity-50 hover:opacity-100")} />
          </button>
          <button
            onClick={() => onDismiss(event.id)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Suggestion text */}
      <p className="text-sm font-medium leading-relaxed text-foreground">
        {event.suggestion}
      </p>

      {/* Expandable details */}
      {(event.trigger_text || event.rationale || event.confidence) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Less' : 'Why this?'}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 text-xs text-muted-foreground border-t border-white/5 pt-2">
              {event.trigger_text && (
                <div>
                  <span className="font-medium">Triggered by:</span>{' '}
                  <span className="italic">"{event.trigger_text}"</span>
                </div>
              )}
              {event.rationale && (
                <div>
                  <span className="font-medium">Why:</span> {event.rationale}
                </div>
              )}
              {event.confidence && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Confidence:</span>
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 max-w-[100px]">
                    <div
                      className="bg-current rounded-full h-1.5 transition-all"
                      style={{ width: `${event.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(event.confidence * 100)}%</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
