export const quickTestScenario = {
  name: "Quick Test (All Features)",
  description: "Covers all trigger types - best for testing coaching detection",
  type: "discovery" as const,
  conversation: [
    { speaker: 'rep' as const, text: "Tell me about your current sales challenges" },
    { speaker: 'prospect' as const, text: "We're pretty busy and not sure this is the right time" },
    { speaker: 'rep' as const, text: "Do you have a budget for this?" },
    { speaker: 'prospect' as const, text: "Wow, that's way more expensive than I expected" },
    { speaker: 'rep' as const, text: "What specific outcomes would make this worthwhile for you?" },
    { speaker: 'prospect' as const, text: "We're also looking at Gong and Chorus" },
    { speaker: 'prospect' as const, text: "We're happy with our current solution" },
    { speaker: 'prospect' as const, text: "Just send me some information and I'll review it" },
  ],
};
