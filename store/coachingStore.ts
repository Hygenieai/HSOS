"use client";

import { create } from 'zustand';

export type CoachingUrgency = 'critical' | 'warning' | 'opportunity' | 'info';

export interface CoachingEvent {
  id: string;
  event_type: string;
  suggestion: string;
  trigger_text?: string;
  confidence?: number;
  source?: string;
  technique?: string;
  prompt_type?: string;
  rationale?: string;
  urgency: CoachingUrgency;
  created_at: string;
}

interface CoachingState {
  events: CoachingEvent[];
  dismissedIds: Set<string>;
  savedIds: Set<string>;

  // Actions
  addEvent: (event: Omit<CoachingEvent, 'id' | 'created_at' | 'urgency'>) => void;
  dismissEvent: (id: string) => void;
  saveEvent: (id: string) => void;
  clearEvents: () => void;

  // Selectors
  getVisibleEvents: () => CoachingEvent[];
}

// Map event types to urgency levels
function getUrgency(eventType: string): CoachingUrgency {
  switch (eventType) {
    case 'price_pressure':
    case 'trust_risk':
      return 'critical';
    case 'decision_stall':
    case 'competitor_mention':
    case 'timeline_concern':
      return 'warning';
    case 'buying_signal':
      return 'opportunity';
    case 'authority_question':
    case 'feature_request':
    case 'implementation_concern':
    case 'needs_analysis':
    default:
      return 'info';
  }
}

let eventCounter = 0;

export const useCoachingStore = create<CoachingState>((set, get) => ({
  events: [],
  dismissedIds: new Set<string>(),
  savedIds: new Set<string>(),

  addEvent: (event) => {
    const id = `coaching-${Date.now()}-${++eventCounter}`;
    const newEvent: CoachingEvent = {
      ...event,
      id,
      urgency: getUrgency(event.event_type),
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      events: [newEvent, ...state.events],
    }));
  },

  dismissEvent: (id) => set((state) => {
    const next = new Set(state.dismissedIds);
    next.add(id);
    return { dismissedIds: next };
  }),

  saveEvent: (id) => set((state) => {
    const next = new Set(state.savedIds);
    next.add(id);
    return { savedIds: next };
  }),

  clearEvents: () => set({
    events: [],
    dismissedIds: new Set(),
    savedIds: new Set(),
  }),

  getVisibleEvents: () => {
    const { events, dismissedIds } = get();
    return events
      .filter((e) => !dismissedIds.has(e.id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
}));

// Browser console helpers for testing
if (typeof window !== 'undefined') {
  (window as any).__coachingStore = () => useCoachingStore.getState();
  (window as any).__addTestCoaching = (text?: string) => {
    useCoachingStore.getState().addEvent({
      event_type: 'price_pressure',
      suggestion: text || "Acknowledge the price concern, then refocus on ROI.",
      trigger_text: "That's too expensive",
      confidence: 0.85,
      source: 'test',
    });
  };
}
