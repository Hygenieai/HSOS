"use client";

import { useMemo, useState } from 'react';
import { useCallStore } from '@/store/callStore';
import { useTranscriptStore } from '@/store/transcriptStore';
import { useCoachingStore, CoachingUrgency } from '@/store/coachingStore';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Clock,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Info,
  Bookmark,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PostCallSummaryProps {
  onNewCall: () => void;
}

export function PostCallSummary({ onNewCall }: PostCallSummaryProps) {
  const { activeCall, duration } = useCallStore();
  const { lines } = useTranscriptStore();
  const { events, savedIds } = useCoachingStore();
  const [showTranscript, setShowTranscript] = useState(false);

  const finalLines = lines.filter((l) => l.isFinal);
  const savedEvents = events.filter((e) => savedIds.has(e.id));

  // Count coaching events by urgency
  const urgencyCounts = useMemo(() => {
    const counts: Record<CoachingUrgency, number> = {
      critical: 0,
      warning: 0,
      opportunity: 0,
      info: 0,
    };
    events.forEach((e) => { counts[e.urgency]++; });
    return counts;
  }, [events]);

  // Count coaching events by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.event_type] = (counts[e.event_type] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [events]);

  // Talk ratio
  const talkRatio = useMemo(() => {
    const repWords = finalLines
      .filter((l) => l.speaker === 'rep')
      .reduce((sum, l) => sum + l.text.split(/\s+/).length, 0);
    const prospectWords = finalLines
      .filter((l) => l.speaker === 'prospect')
      .reduce((sum, l) => sum + l.text.split(/\s+/).length, 0);
    const total = repWords + prospectWords;
    if (total === 0) return { rep: 50, prospect: 50 };
    return {
      rep: Math.round((repWords / total) * 100),
      prospect: Math.round((prospectWords / total) * 100),
    };
  }, [finalLines]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-1">Call Complete</h2>
          {activeCall?.contact_name && (
            <p className="text-sm text-muted-foreground">
              with {activeCall.contact_name}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Clock}
            label="Duration"
            value={formatDuration(duration)}
          />
          <StatCard
            icon={MessageSquare}
            label="Transcript Lines"
            value={String(finalLines.length)}
          />
          <StatCard
            icon={Sparkles}
            label="Coaching Moments"
            value={String(events.length)}
          />
        </div>

        {/* Talk ratio */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Talk Ratio</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-400 w-16 text-right">Rep {talkRatio.rep}%</span>
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500/60 h-full transition-all"
                style={{ width: `${talkRatio.rep}%` }}
              />
              <div
                className="bg-amber-500/60 h-full transition-all"
                style={{ width: `${talkRatio.prospect}%` }}
              />
            </div>
            <span className="text-xs text-amber-400 w-20">Prospect {talkRatio.prospect}%</span>
          </div>
          {talkRatio.rep > 65 && (
            <p className="text-xs text-amber-400 mt-2">
              You talked more than the prospect. Aim for 40/60 — let them talk more.
            </p>
          )}
        </div>

        {/* Coaching breakdown */}
        {events.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Coaching Breakdown</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <UrgencyBadge urgency="critical" count={urgencyCounts.critical} />
              <UrgencyBadge urgency="warning" count={urgencyCounts.warning} />
              <UrgencyBadge urgency="opportunity" count={urgencyCounts.opportunity} />
              <UrgencyBadge urgency="info" count={urgencyCounts.info} />
            </div>
            {typeCounts.length > 0 && (
              <div className="space-y-1.5">
                {typeCounts.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-foreground font-medium">{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved suggestions */}
        {savedEvents.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-amber-400" />
              Saved Suggestions ({savedEvents.length})
            </h3>
            <div className="space-y-2">
              {savedEvents.map((event) => (
                <div key={event.id} className="text-sm text-foreground bg-white/5 rounded p-2.5">
                  <p>{event.suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {event.event_type.replace(/_/g, ' ')} • {event.technique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript toggle */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Full Transcript ({finalLines.length} lines)
            </span>
            {showTranscript ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showTranscript && (
            <div className="px-4 pb-4 max-h-96 overflow-y-auto space-y-2">
              {finalLines.map((line) => (
                <div key={line.id} className="flex gap-3 text-sm">
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded shrink-0",
                    line.speaker === 'rep'
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-amber-500/10 text-amber-400"
                  )}>
                    {line.speaker === 'rep' ? 'Rep' : 'Prospect'}
                  </span>
                  <span className="text-foreground/80">{line.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New call button */}
        <div className="text-center pt-2">
          <button
            onClick={onNewCall}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-[#F4845F] text-white rounded-lg hover:bg-[#e6734e] transition-colors text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            Start New Call
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center">
      <Icon className="h-4 w-4 text-[#00989E] mx-auto mb-1.5" />
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

const urgencyMeta: Record<CoachingUrgency, { icon: React.ElementType; color: string; label: string }> = {
  critical: { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10', label: 'Critical' },
  warning: { icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10', label: 'Warning' },
  opportunity: { icon: Lightbulb, color: 'text-emerald-400 bg-emerald-500/10', label: 'Opportunity' },
  info: { icon: Info, color: 'text-blue-400 bg-blue-500/10', label: 'Info' },
};

function UrgencyBadge({ urgency, count }: { urgency: CoachingUrgency; count: number }) {
  const meta = urgencyMeta[urgency];
  const Icon = meta.icon;
  return (
    <div className={cn("rounded-lg p-2 text-center", meta.color)}>
      <Icon className="h-3.5 w-3.5 mx-auto mb-1" />
      <div className="text-sm font-bold">{count}</div>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{meta.label}</div>
    </div>
  );
}
