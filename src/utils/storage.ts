import { Agent } from '../types/agent';

const AGENTS_KEY = 'ai_agents';

export const storage = {
  saveAgents: (agents: Agent[]) => {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  },

  loadAgents: (): Agent[] => {
    const stored = localStorage.getItem(AGENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
};
