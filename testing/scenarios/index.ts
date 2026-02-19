import { quickTestScenario } from './quick-test';
import { discoveryCallScenario } from './discovery-call';
import { demoCallScenario } from './demo-call';
import { followUpCallScenario } from './follow-up-call';
import { closingCallScenario } from './closing-call';

export { quickTestScenario, discoveryCallScenario, demoCallScenario, followUpCallScenario, closingCallScenario };

export type ConversationScenario = {
  name: string;
  description: string;
  type: 'discovery' | 'demo' | 'follow-up' | 'closing';
  conversation: Array<{
    speaker: 'rep' | 'prospect';
    text: string;
  }>;
};

export const allScenarios = [
  quickTestScenario,
  discoveryCallScenario,
  demoCallScenario,
  followUpCallScenario,
  closingCallScenario,
] as ConversationScenario[];
