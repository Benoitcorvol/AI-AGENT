import { Agent, Tool, AgentRole } from './agent';

export interface AgentTemplate {
  role: AgentRole;
  basePrompt: string;
  suggestedTools: string[];
  capabilities: {
    canCreateSubAgents: boolean;
    canDelegateWork: boolean;
    canAccessOtherAgents: boolean;
  };
}

export interface AgentCreationRequest {
  userPrompt: string;
  preferredModel?: string;
  requiredCapabilities?: string[];
  maxAgents?: number;
}

export interface AgentCreationResult {
  mainAgent: Agent;
  subAgents: Agent[];
  suggestedWorkflow: WorkflowDefinition;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  expectedOutcome: string;
  estimatedCompletion: string;
}

export interface WorkflowStep {
  agentId: string;
  toolId: string;
  description: string;
  expectedDuration: string;
  requiredInput: Record<string, any>;
  expectedOutput: Record<string, any>;
}