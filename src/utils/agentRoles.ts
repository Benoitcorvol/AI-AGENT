import { AgentRole, AgentCapabilities } from '../types/agent';

export const roleCapabilities: Record<AgentRole, AgentCapabilities> = {
  worker: {
    canCreateSubAgents: false,
    canDelegateWork: false,
    canAccessOtherAgents: false
  },
  coordinator: {
    canCreateSubAgents: false,
    canDelegateWork: true,
    canAccessOtherAgents: true
  },
  manager: {
    canCreateSubAgents: true,
    canDelegateWork: true,
    canAccessOtherAgents: true
  }
};

export const roleDescriptions: Record<AgentRole, string> = {
  worker: 'Executes specific tasks independently',
  coordinator: 'Coordinates work between multiple agents',
  manager: 'Creates and manages sub-agents and workflows'
};