"use client";

import { useCallStore, CallType } from '@/store/callStore';
import { useContactStore } from '@/store/contactStore';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
} from 'lucide-react';

interface CallControlProps {
  onStartCall: () => void;
  onEndCall: () => void;
  isTranscribing: boolean;
}

const callTypeLabels: Record<CallType, string> = {
  discovery: 'Discovery',
  demo: 'Demo',
  'follow-up': 'Follow-up',
  closing: 'Closing',
};

export function CallControl({ onStartCall, onEndCall, isTranscribing }: CallControlProps) {
  const {
    activeCall,
    callStatus,
    duration,
    isMuted,
    isOnHold,
    toggleMute,
    toggleHold,
    setCallType,
    pauseCall,
    resumeCall,
  } = useCallStore();

  const { selectedContact } = useContactStore();

  const isActive = callStatus === 'active' || callStatus === 'paused';

  return (
    <div className="px-4 py-3 border-b border-border bg-card/50">
      <div className="flex items-center justify-between">
        {/* Left: Contact & call info */}
        <div className="flex items-center gap-4">
          {isActive && (
            <>
              {/* Timer */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  callStatus === 'active' ? "bg-red-500 animate-pulse" : "bg-amber-500"
                )} />
                <span className="text-sm font-mono font-medium tabular-nums">
                  {formatDuration(duration)}
                </span>
              </div>

              {/* Contact name */}
              {(selectedContact || activeCall?.contact_name) && (
                <div className="text-sm text-muted-foreground">
                  with <span className="text-foreground font-medium">
                    {selectedContact?.name || activeCall?.contact_name}
                  </span>
                  {selectedContact?.company && (
                    <span className="text-muted-foreground"> at {selectedContact.company}</span>
                  )}
                </div>
              )}
            </>
          )}

          {!isActive && (
            <div className="text-sm text-muted-foreground">
              {selectedContact
                ? `Ready to call ${selectedContact.name}`
                : 'Select a contact or start a call'}
            </div>
          )}
        </div>

        {/* Center: Call type selector (when active) */}
        {isActive && (
          <div className="flex items-center gap-1">
            {(Object.keys(callTypeLabels) as CallType[]).map((type) => (
              <button
                key={type}
                onClick={() => setCallType(type)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md transition-colors",
                  activeCall?.call_type === type
                    ? "bg-[#00989E]/20 text-[#00989E] font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {callTypeLabels[type]}
              </button>
            ))}
          </div>
        )}

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          {isActive && (
            <>
              {/* Mute */}
              <button
                onClick={toggleMute}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isMuted
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Pause/Resume */}
              <button
                onClick={callStatus === 'paused' ? resumeCall : pauseCall}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isOnHold
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
                title={callStatus === 'paused' ? 'Resume' : 'Pause'}
              >
                {callStatus === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>

              {/* End call */}
              <button
                onClick={onEndCall}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <PhoneOff className="h-4 w-4" />
                End
              </button>
            </>
          )}

          {!isActive && callStatus !== 'ended' && (
            <button
              onClick={onStartCall}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F4845F] text-white hover:bg-[#e6734e] transition-colors text-sm font-medium"
            >
              <Phone className="h-4 w-4" />
              Start Call
            </button>
          )}

          {callStatus === 'ended' && (
            <button
              onClick={onStartCall}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F4845F] text-white hover:bg-[#e6734e] transition-colors text-sm font-medium"
            >
              <Phone className="h-4 w-4" />
              New Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
