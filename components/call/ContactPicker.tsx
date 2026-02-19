"use client";

import { useState, useEffect } from 'react';
import { useContactStore, Contact } from '@/store/contactStore';
import { cn, getInitials } from '@/lib/utils';
import { Search, Building2, Phone, Plus, X } from 'lucide-react';

interface ContactPickerProps {
  supabase: any;
  onSelect: (contact: Contact | null) => void;
  selected: Contact | null;
}

export function ContactPicker({ supabase, onSelect, selected }: ContactPickerProps) {
  const { contacts, isLoading, loadContacts, getFilteredContacts, searchQuery, setSearchQuery } = useContactStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const filtered = getFilteredContacts();

  useEffect(() => {
    if (contacts.length === 0 && !isLoading) {
      loadContacts(supabase);
    }
  }, [contacts.length, isLoading, loadContacts, supabase]);

  // If a contact is already selected, show compact view
  if (selected && !isOpen) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#00989E]/20 text-[#00989E] flex items-center justify-center text-xs font-bold">
            {getInitials(selected.name)}
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground">{selected.name}</span>
            {selected.company && (
              <span className="text-muted-foreground ml-1.5">at {selected.company}</span>
            )}
          </div>
          <button
            onClick={() => { onSelect(null); setIsOpen(true); }}
            className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search contacts or start without one..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-20 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00989E] text-foreground placeholder:text-muted-foreground"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isOpen && (
            <button
              onClick={() => { setIsOpen(false); setSearchQuery(''); }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {/* Skip option */}
          <button
            onClick={() => { onSelect(null); setIsOpen(false); setSearchQuery(''); }}
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-border"
          >
            <Phone className="h-3.5 w-3.5" />
            Start call without a contact
          </button>

          {isLoading ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Loading contacts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? 'No matching contacts' : 'No contacts yet'}
            </div>
          ) : (
            filtered.slice(0, 20).map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  onSelect(contact);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3",
                  selected?.id === contact.id && "bg-[#00989E]/10"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[#00989E]/15 text-[#00989E] flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {contact.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {contact.company && (
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        {contact.company}
                      </span>
                    )}
                    {contact.title && (
                      <span className="truncate">{contact.title}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}

          {/* Add new contact */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full px-3 py-2.5 text-left text-sm text-[#00989E] hover:bg-[#00989E]/5 transition-colors flex items-center gap-2 border-t border-border"
            >
              <Plus className="h-3.5 w-3.5" />
              Add new contact
            </button>
          ) : (
            <QuickAddForm
              supabase={supabase}
              onAdded={(contact) => {
                onSelect(contact);
                setShowAddForm(false);
                setIsOpen(false);
                setSearchQuery('');
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Inline quick-add form ──
function QuickAddForm({
  supabase,
  onAdded,
  onCancel,
}: {
  supabase: any;
  onAdded: (contact: Contact) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addContact } = useContactStore();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    const contact = await addContact(supabase, {
      name: name.trim(),
      company: company.trim() || undefined,
    });
    setIsSubmitting(false);
    if (contact) {
      onAdded(contact);
    }
  };

  return (
    <div className="p-3 border-t border-border space-y-2">
      <input
        type="text"
        placeholder="Contact name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#00989E] text-foreground placeholder:text-muted-foreground"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <input
        type="text"
        placeholder="Company (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#00989E] text-foreground placeholder:text-muted-foreground"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-[#00989E] text-white rounded hover:bg-[#00989E]/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add & Select'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
