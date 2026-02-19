"use client";

import { create } from 'zustand';

export interface TranscriptLine {
  id: string;
  line_number: number;
  speaker: 'rep' | 'prospect';
  text: string;
  timestamp: string;
  isFinal: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  events?: string[];
}

interface TranscriptState {
  lines: TranscriptLine[];
  searchQuery: string;
  autoScroll: boolean;
  activeSpeaker: 'rep' | 'prospect' | null;
  callStartTime: number | null;

  // Actions
  addLine: (line: TranscriptLine) => void;
  updateLine: (id: string, updates: Partial<TranscriptLine>) => void;
  flipSpeaker: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setAutoScroll: (enabled: boolean) => void;
  setActiveSpeaker: (speaker: 'rep' | 'prospect' | null) => void;
  setCallStartTime: (time: number) => void;
  clearTranscript: () => void;

  // Selectors
  getFilteredLines: () => TranscriptLine[];
  getRelativeTime: (timestamp: string) => string;
}

export const useTranscriptStore = create<TranscriptState>((set, get) => ({
  lines: [],
  searchQuery: '',
  autoScroll: true,
  activeSpeaker: null,
  callStartTime: null,

  addLine: (line) => set((state) => ({
    lines: [...state.lines].sort((a, b) => a.line_number - b.line_number).concat(line)
      .sort((a, b) => a.line_number - b.line_number),
  })),

  updateLine: (id, updates) => set((state) => ({
    lines: state.lines.map((l) => l.id === id ? { ...l, ...updates } : l),
  })),

  flipSpeaker: (id) => set((state) => ({
    lines: state.lines.map((l) =>
      l.id === id ? { ...l, speaker: l.speaker === 'rep' ? 'prospect' : 'rep' } : l
    ),
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setAutoScroll: (enabled) => set({ autoScroll: enabled }),
  setActiveSpeaker: (speaker) => set({ activeSpeaker: speaker }),
  setCallStartTime: (time) => set({ callStartTime: time }),

  clearTranscript: () => set({
    lines: [],
    searchQuery: '',
    activeSpeaker: null,
    callStartTime: null,
  }),

  getFilteredLines: () => {
    const { lines, searchQuery } = get();
    if (!searchQuery.trim()) return lines;
    const lower = searchQuery.toLowerCase();
    return lines.filter((l) => l.text.toLowerCase().includes(lower));
  },

  getRelativeTime: (timestamp: string) => {
    const { callStartTime } = get();
    if (!callStartTime) return '';
    const elapsed = Math.floor((new Date(timestamp).getTime() - callStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
}));
