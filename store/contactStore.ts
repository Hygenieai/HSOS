"use client";

import { create } from 'zustand';

export interface Contact {
  id: string;
  user_id: string;
  org_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  title?: string;
  priority?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  loadContacts: (supabase: any) => Promise<void>;
  selectContact: (contact: Contact | null) => void;
  setSearchQuery: (query: string) => void;
  addContact: (supabase: any, contact: Partial<Contact>) => Promise<Contact | null>;
  updateContact: (supabase: any, id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (supabase: any, id: string) => Promise<void>;

  // Selectors
  getFilteredContacts: () => Contact[];
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  selectedContact: null,
  searchQuery: '',
  isLoading: false,

  loadContacts: async (supabase) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contacts: data || [] });
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectContact: (contact) => set({ selectedContact: contact }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  addContact: async (supabase, contact) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contact,
          user_id: user.id,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ contacts: [data, ...state.contacts] }));
      return data;
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  },

  updateContact: async (supabase, id, updates) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.map((c) => c.id === id ? { ...c, ...updates } : c),
      }));
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  },

  deleteContact: async (supabase, id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
      }));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  },

  getFilteredContacts: () => {
    const { contacts, searchQuery } = get();
    if (!searchQuery.trim()) return contacts;
    const lower = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.company?.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower)
    );
  },
}));
