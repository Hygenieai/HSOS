// HYGENIE COPILOT — SALES COACHING PLAYBOOK
// Based on: Chris Voss, Stephen Covey, Trusted Advisor, SPIN, Challenger
// Source: coach-fast edge function (proven in production)

export interface PlaybookPrompt {
  technique: string;
  prompt_type: string;
  text: string;
  rationale: string;
  alternatives?: string[];
}

export interface PlaybookEntry {
  prompts: PlaybookPrompt[];
}

export const PLAYBOOK: Record<string, PlaybookEntry> = {

  // PRICE PRESSURE — When prospect objects to cost/budget
  price_pressure: {
    prompts: [
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like budget is a real concern for you right now.",
        rationale: "Labels acknowledge emotion without being defensive. This creates space for the prospect to elaborate on their real concerns - which often aren't actually about price.",
        alternatives: [
          "It seems like the investment feels significant.",
          "It sounds like you're weighing this against other priorities."
        ]
      },
      {
        technique: 'voss',
        prompt_type: 'calibrated_question',
        text: "What would need to be true for this investment to make sense for you?",
        rationale: "Calibrated questions shift the conversation from price to value. You're making them solve the problem WITH you instead of against you.",
        alternatives: [
          "How would you measure whether this was worth the investment?",
          "What would success look like that would justify this cost?"
        ]
      },
      {
        technique: 'covey',
        prompt_type: 'question',
        text: "Help me understand - what's driving the budget constraint right now?",
        rationale: "Seek first to understand. Understanding their real situation lets you address the actual objection, which is often not price itself.",
      },
      {
        technique: 'voss',
        prompt_type: 'accusation_audit',
        text: "You're probably thinking I'm just going to try to justify the price...",
        rationale: "Accusation audit defuses defensiveness by calling out what they might be thinking. It disarms them and builds trust.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'reframe',
        text: "Let me share how other clients in similar situations have thought about the ROI...",
        rationale: "Social proof combined with reframing the conversation from cost to return on investment.",
      },
    ],
  },

  // TRUST RISK — When prospect is skeptical or mentions past bad experiences
  trust_risk: {
    prompts: [
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like you've been burned before.",
        rationale: "Acknowledging past pain builds trust. It shows you're listening and not dismissing their concerns. Let them vent.",
        alternatives: [
          "It seems like past experiences have made you cautious.",
          "It sounds like trust has to be earned, not assumed."
        ]
      },
      {
        technique: 'voss',
        prompt_type: 'mirror',
        text: "Burned before?",
        rationale: "Mirrors encourage elaboration with minimal words. Let them tell you exactly what went wrong so you can address it specifically.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'question',
        text: "What would we need to do differently to earn your trust?",
        rationale: "Directly addressing trust shows confidence and lets them set the terms for building credibility. You're giving them control.",
        alternatives: [
          "What would give you confidence that this time would be different?",
          "What proof would you need to see?"
        ]
      },
      {
        technique: 'covey',
        prompt_type: 'empathy',
        text: "I completely understand that skepticism. If I were in your position, I'd feel the same way.",
        rationale: "Validate their feelings before trying to address the objection. Empathy first, logic second.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'proof',
        text: "Would it help if I connected you with a client who had similar concerns?",
        rationale: "Offering third-party validation. Let someone else do the convincing for you.",
      },
    ],
  },

  // DECISION STALL — When prospect delays or defers to others
  decision_stall: {
    prompts: [
      {
        technique: 'voss',
        prompt_type: 'calibrated_question',
        text: "What would need to be true for you to move forward today?",
        rationale: "Calibrated questions reveal the real blocker without applying pressure. You're not pushing - you're uncovering.",
        alternatives: [
          "What's the one thing that would make this a clear yes?",
          "What would you need to see to feel confident about this decision?"
        ]
      },
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like there's something holding you back.",
        rationale: "Creates space for them to share the real objection they might be avoiding. Often the stated reason isn't the real reason.",
      },
      {
        technique: 'covey',
        prompt_type: 'question',
        text: "Who else should be part of this conversation?",
        rationale: "Identifying all stakeholders early prevents future stalls and surprises. Get to the decision maker.",
      },
      {
        technique: 'challenger',
        prompt_type: 'insight',
        text: "What's the cost of waiting another month on this decision?",
        rationale: "Gentle challenge to consider the opportunity cost of delay. Make inaction feel like a choice with consequences.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'action',
        text: "Would it help if I put together a summary you could share with your team?",
        rationale: "Make their job easier. Give them ammunition for internal conversations.",
      },
      {
        technique: 'voss',
        prompt_type: 'no_oriented',
        text: "Is there any reason you wouldn't want to at least try this?",
        rationale: "No-oriented questions feel safer to answer. Getting a 'no' here actually means 'yes, I would try it.'",
      },
    ],
  },

  // TIMELINE CONCERN — When prospect worried about timing/speed
  timeline_concern: {
    prompts: [
      {
        technique: 'voss',
        prompt_type: 'mirror',
        text: "Too long?",
        rationale: "Mirrors invite elaboration with minimal words. Let them explain exactly what their timeline constraints are.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'question',
        text: "What deadline are you working toward?",
        rationale: "Understanding their timeline helps you adapt your pitch or manage expectations realistically.",
        alternatives: [
          "What's driving the urgency?",
          "When do you need to have this in place?"
        ]
      },
      {
        technique: 'voss',
        prompt_type: 'calibrated_question',
        text: "How can we work together to meet your timeline?",
        rationale: "Makes it a collaborative problem-solving conversation instead of you defending your timeline.",
      },
      {
        technique: 'spin',
        prompt_type: 'implication',
        text: "What happens if this isn't in place by your deadline?",
        rationale: "Implication question - helps them articulate the consequences of delay. Makes the urgency real.",
      },
    ],
  },

  // COMPETITOR MENTION — When prospect compares or mentions alternatives
  competitor_mention: {
    prompts: [
      {
        technique: 'trusted_advisor',
        prompt_type: 'question',
        text: "What criteria are most important as you compare options?",
        rationale: "Understanding their evaluation criteria lets you position against what actually matters to them, not generic differentiators.",
        alternatives: [
          "What would make one solution clearly better than another for you?",
          "What are the must-haves vs nice-to-haves?"
        ]
      },
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like you want to make sure you're making the right choice.",
        rationale: "Labels their underlying motivation rather than defending against competition. You're on their side.",
      },
      {
        technique: 'challenger',
        prompt_type: 'reframe',
        text: "Most companies focus on [X], but what we've found is that [Y] actually drives results.",
        rationale: "Teach them something new that reframes how they should evaluate options. Change the game.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'transparency',
        text: "Would it be helpful if I walked you through honestly how we compare on those specific points?",
        rationale: "Offer to address the comparison directly and transparently. Confidence builds trust.",
      },
    ],
  },

  // BUYING SIGNAL — When prospect shows positive interest
  buying_signal: {
    prompts: [
      {
        technique: 'trusted_advisor',
        prompt_type: 'action',
        text: "Great question. Let me walk you through exactly how we'd get started.",
        rationale: "When they show interest, respond with clear, confident next steps. Don't oversell - just make it easy.",
        alternatives: [
          "I'd love to show you how this would work for your specific situation.",
          "Let me share what the onboarding process looks like."
        ]
      },
      {
        technique: 'covey',
        prompt_type: 'summary',
        text: "So to summarize what we've discussed - you mentioned [X, Y, Z] as priorities. Here's how we address each...",
        rationale: "Summarizing before next steps ensures alignment and shows you were actually listening.",
      },
      {
        technique: 'spin',
        prompt_type: 'need_payoff',
        text: "Based on what you've shared, it sounds like [specific benefit] would be most valuable. Is that right?",
        rationale: "Confirm the value proposition before moving to close. Make sure you're solving the right problem.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'next_step',
        text: "The best next step would be [specific action]. Does that work for you?",
        rationale: "Propose a clear, low-friction next step. Make it easy to say yes.",
      },
    ],
  },

  // AUTHORITY QUESTION — When prospect questions expertise
  authority_question: {
    prompts: [
      {
        technique: 'trusted_advisor',
        prompt_type: 'proof',
        text: "Great question. We've worked with [X similar companies] on exactly this challenge. Let me share a specific example...",
        rationale: "Answer with concrete social proof and specific examples. Vague claims don't build credibility.",
      },
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like you want to make sure you're working with someone who really understands your situation.",
        rationale: "Acknowledge the underlying concern before providing proof. They're not being difficult - they're being smart.",
      },
      {
        technique: 'challenger',
        prompt_type: 'insight',
        text: "That's actually one of our specializations. In fact, we've discovered that most companies approach this wrong by...",
        rationale: "Turn the question into an opportunity to teach them something new. Demonstrate expertise through insight.",
      },
    ],
  },

  // FEATURE REQUEST — When prospect asks about specific capabilities
  feature_request: {
    prompts: [
      {
        technique: 'trusted_advisor',
        prompt_type: 'question',
        text: "Help me understand - what are you trying to accomplish with that?",
        rationale: "Understand the underlying need before confirming or denying the feature. Often there's a better way to solve their real problem.",
      },
      {
        technique: 'spin',
        prompt_type: 'situation',
        text: "How important is that capability compared to [other thing they mentioned]?",
        rationale: "Understand priority to gauge if it's a deal-breaker or nice-to-have. Helps you know where to focus.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'alternative',
        text: "We approach that differently - let me explain why, and you can tell me if it would work for your situation.",
        rationale: "If you don't have it exactly, reframe to your approach. Be honest but show confidence in your solution.",
      },
    ],
  },

  // IMPLEMENTATION CONCERN — Worried about setup/disruption
  implementation_concern: {
    prompts: [
      {
        technique: 'trusted_advisor',
        prompt_type: 'action',
        text: "Let me walk you through exactly what the implementation process looks like. Most clients are up and running in [timeframe].",
        rationale: "Address the concern directly with specific, concrete details. Vague reassurance doesn't help.",
      },
      {
        technique: 'voss',
        prompt_type: 'label',
        text: "It sounds like minimizing disruption to your team is really important.",
        rationale: "Acknowledge the underlying concern about change management. They're protecting their team.",
      },
      {
        technique: 'covey',
        prompt_type: 'question',
        text: "What would make you feel confident about the transition?",
        rationale: "Let them tell you what they need to feel comfortable. Then address those specific concerns.",
      },
      {
        technique: 'trusted_advisor',
        prompt_type: 'support',
        text: "We assign a dedicated onboarding specialist who handles [specific tasks]. You won't be doing this alone.",
        rationale: "Show the support structure that makes implementation smooth. Remove the burden from them.",
      },
    ],
  },

  // NEEDS ANALYSIS — General discovery/qualification
  needs_analysis: {
    prompts: [
      {
        technique: 'spin',
        prompt_type: 'situation',
        text: "Walk me through how you're currently handling this today.",
        rationale: "Understand their current state before proposing solutions. You can't solve a problem you don't understand.",
      },
      {
        technique: 'spin',
        prompt_type: 'problem',
        text: "What's the biggest challenge with that approach?",
        rationale: "Uncover pain points. Let them tell you what's broken.",
      },
      {
        technique: 'covey',
        prompt_type: 'question',
        text: "If you could wave a magic wand and fix one thing about this, what would it be?",
        rationale: "Gets to their ideal state without constraints. Reveals what they really want.",
      },
    ],
  },
};
