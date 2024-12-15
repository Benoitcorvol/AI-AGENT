import { Agent, Workflow } from '../types/agent';

const AGENTS_KEY = 'ai_agents';
const WORKFLOWS_KEY = 'ai_workflows';

export const storage = {
  saveAgents: (agents: Agent[]) => {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  },

  loadAgents: (): Agent[] => {
    const stored = localStorage.getItem(AGENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveWorkflows: (workflows: Workflow[]) => {
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  },

  loadWorkflows: (): Workflow[] => {
    const stored = localStorage.getItem(WORKFLOWS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
};