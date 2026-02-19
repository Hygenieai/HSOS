"use client";

import { create } from 'zustand';

export type CallStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';
export type CallType = 'discovery' | 'demo' | 'follow-up' | 'closing';

export interface CallSession {
  id: string;
  contact_id?: string;
  contact_name?: string;
  call_type: CallType;
  status: CallStatus;
  started_at?: string;
  ended_at?: string;
  duration: number;
}

interface CallState {
  activeCall: CallSession | null;
  callStatus: CallStatus;
  duration: number;
  isMuted: boolean;
  isOnHold: boolean;
  durationInterval: NodeJS.Timeout | null;

  // Actions
  startCall: (params: { id: string; contact_id?: string; contact_name?: string; call_type: CallType }) => void;
  endCall: () => void;
  pauseCall: () => void;
  resumeCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  setCallType: (type: CallType) => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  callStatus: 'idle',
  duration: 0,
  isMuted: false,
  isOnHold: false,
  durationInterval: null,

  startCall: (params) => {
    // Clear any existing interval
    const existing = get().durationInterval;
    if (existing) clearInterval(existing);

    const session: CallSession = {
      ...params,
      status: 'active',
      started_at: new Date().toISOString(),
      duration: 0,
    };

    // Start duration timer
    const interval = setInterval(() => {
      set((state) => ({ duration: state.duration + 1 }));
    }, 1000);

    set({
      activeCall: session,
      callStatus: 'active',
      duration: 0,
      isMuted: false,
      isOnHold: false,
      durationInterval: interval,
    });
  },

  endCall: () => {
    const { durationInterval, activeCall, duration } = get();
    if (durationInterval) clearInterval(durationInterval);

    if (activeCall) {
      set({
        activeCall: {
          ...activeCall,
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration,
        },
        callStatus: 'ended',
        durationInterval: null,
      });
    }
  },

  pauseCall: () => {
    const { durationInterval } = get();
    if (durationInterval) clearInterval(durationInterval);
    set({ callStatus: 'paused', durationInterval: null });
  },

  resumeCall: () => {
    const interval = setInterval(() => {
      set((state) => ({ duration: state.duration + 1 }));
    }, 1000);
    set({ callStatus: 'active', durationInterval: interval });
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleHold: () => set((state) => ({ isOnHold: !state.isOnHold })),

  setCallType: (type) => set((state) => ({
    activeCall: state.activeCall ? { ...state.activeCall, call_type: type } : null,
  })),
}));
