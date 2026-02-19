export interface Scenario {
  id: number;
  label: string;
  description: string;
  why: string;
  nextMove: string;
}

export const scenarios: Scenario[] = [
  {
    id: 1,
    label: "I don't know where to start.",
    description:
      "I have a product but no sales process. No ICP. No outreach. Nothing.",
    why: "There is no foundational sales architecture in place. Without a defined ICP, a structured outreach strategy, or a repeatable process for converting prospects, there is no system to execute against. The issue is structural rather than tactical \u2014 before adjusting any messaging or outreach, the underlying architecture needs to be defined.",
    nextMove:
      "Define a single, narrow ICP built around a specific recurring pain your product solves. Write it in one sentence. This becomes the foundation for every sales decision that follows.",
  },
  {
    id: 2,
    label: "We're not getting enough qualified leads.",
    description:
      "We're reaching people but they're not the right people.",
    why: "The current ICP is likely defined by demographics rather than by a specific pain point. When targeting is broad, messaging defaults to generic language that fails to resonate with any particular segment. The result is high activity with low conversion \u2014 outreach volume without signal.",
    nextMove:
      "Redefine your ICP around a specific, recurring problem rather than a company profile. Outreach should be anchored to a pain that your product directly addresses. If the same message could apply to ten different industries, the positioning needs to be narrowed.",
  },
  {
    id: 3,
    label: "I have leads but I don't know what to say.",
    description:
      "I stare at the screen and don't know how to start the conversation.",
    why: "The messaging framework is either absent or product-led rather than problem-led. When outreach begins with what you offer instead of what the prospect is experiencing, the message does not create relevance. Prospects engage when they feel understood \u2014 not when they feel pitched.",
    nextMove:
      "Draft your next outreach message without referencing your product. Lead with a specific observation about the prospect\u2019s situation. The goal is to demonstrate understanding of their environment before requesting a conversation.",
  },
  {
    id: 4,
    label: "Outbound isn't converting to meetings.",
    description:
      "We're doing outreach but nobody's booking.",
    why: "The outreach sequence is requesting a commitment before establishing credibility. When the first touch focuses on features or a meeting request without context, the prospect has no basis for trust. There is no pre-frame \u2014 nothing that positions the conversation as valuable before the ask is made.",
    nextMove:
      "Restructure outreach around a problem-led framework. The first touch should diagnose or surface a relevant issue for the prospect. Credibility and relevance need to be established before any meeting request is introduced.",
  },
  {
    id: 5,
    label: "We book demos but people don't show up.",
    description:
      "The calendar looks full but show rates are terrible.",
    why: "There is a credibility gap between the moment of booking and the scheduled meeting. Without a structured pre-meeting sequence \u2014 a confirmation email that reframes the meeting around the prospect\u2019s problem and delivers proof of relevance \u2014 the meeting feels low-priority. The prospect\u2019s decision to book was not reinforced.",
    nextMove:
      "Implement a pre-meeting email sent within one hour of booking. It should reframe the conversation around the prospect\u2019s specific challenge and include one relevant proof point \u2014 a case study, a data point, or a specific insight. This reinforces the decision to attend.",
  },
  {
    id: 6,
    label: "Prospects love the demo but won't sign.",
    description:
      "Great conversations. Lots of 'this is cool.' Then nothing.",
    why: "The demo generated interest but did not establish urgency. Without a clearly defined cost of inaction \u2014 what happens to the prospect\u2019s business if this problem remains unsolved over the next 30 to 60 days \u2014 there is no compelling reason to move forward. Interest without urgency results in stalled deals.",
    nextMove:
      "Before the next demo, identify the specific consequence of inaction for this prospect. What measurably worsens if they do not solve this problem this quarter? If that consequence is unclear, the discovery process needs to surface it before the demo is delivered.",
  },
  {
    id: 7,
    label: "Deals go silent after calls.",
    description:
      "Good first meeting. Then ghosted. Follow-ups get ignored.",
    why: "The discovery process did not surface information specific enough to sustain the conversation. When follow-up lacks concrete references to the prospect\u2019s stated problems, it defaults to generic check-in language. The prospect disengages because there is nothing substantive to respond to.",
    nextMove:
      "After each call, document the specific business problem the prospect described and the stated or implied consequence of not addressing it. These two data points should anchor every subsequent follow-up message. If they are absent, revisit the discovery process.",
  },
  {
    id: 8,
    label: "We keep hearing 'we need to think about it.'",
    description:
      "Prospects don't say no. They don't say yes. Deals just stall.",
    why: "There is no decision framework installed in the sales process. The prospect has not been presented with a clear cost of inaction or a structured reason to commit within a defined timeframe. This response typically indicates that urgency was not established during discovery \u2014 not that the prospect is evaluating alternatives.",
    nextMove:
      "During discovery, establish the cost of inaction explicitly: what happens if this problem is not addressed in the next 60 days? That answer becomes the urgency mechanism for the remainder of the deal. Address timing before the prospect raises it.",
  },
  {
    id: 9,
    label: "I can't build a process that works without me.",
    description:
      "I'm the only one who can close. Every hire underperforms.",
    why: "The current sales process relies on founder intuition rather than documented structure. Closing ability is driven by pattern recognition and relationship instinct that has not been formalized. Without documented frameworks, repeatable talk tracks, and structured coaching, new hires have no system to execute against \u2014 only observation.",
    nextMove:
      "Record the next three sales calls. After each, document every question asked, every decision point, and the reasoning behind it. This raw documentation becomes the basis for a transferable playbook. Delegation requires documentation.",
  },
];

export function getPattern(selectedIds: number[]): string | null {
  if (selectedIds.length < 2) return null;

  const allEarly = selectedIds.every((id) => id >= 1 && id <= 3);
  const allMid = selectedIds.every((id) => id >= 4 && id <= 6);
  const allLate = selectedIds.every((id) => id >= 7 && id <= 9);

  if (allEarly) {
    return "The primary constraint is foundational. Before optimizing outreach, demos, or closing mechanics, the core sales architecture \u2014 ICP definition, messaging framework, and positioning \u2014 needs to be established. Downstream processes cannot function without upstream clarity.";
  }
  if (allMid) {
    return "Activity is being generated but not converted. The gap exists between effort and structure \u2014 outreach, pre-meeting, and demo processes require frameworks that build credibility and urgency systematically rather than relying on volume alone.";
  }
  if (allLate) {
    return "There is motion but not a system. Deals are occurring but they are not predictable, scalable, or transferable. The process needs to be extracted from intuition and installed as repeatable, documented structure.";
  }
  return "These symptoms appear at different stages but share a structural root: the sales process lacks a connected system. Addressing one stage in isolation moves the constraint rather than resolving it. The architecture needs to be addressed end-to-end.";
}
