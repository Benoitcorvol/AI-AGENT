export type ModelType = string;

export type AgentRole = 'worker' | 'manager' | 'coordinator';

export interface AgentCapabilities {
  canCreateSubAgents: boolean;
  canDelegateWork: boolean;
  canAccessOtherAgents: boolean;
  canUseMemory: boolean; // New capability for memory system
}

export interface Connection {
  id: string;
  type: 'database' | 'file' | 'api';
  name: string;
  config: Record<string, unknown>;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
  connection?: Connection;
}

export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
}

export interface MemoryConfig {
  enabled: boolean;
  retentionPeriod?: number; // Time in milliseconds to keep memories
  minConfidence?: number; // Minimum confidence threshold for keeping memories
  maxMemories?: number; // Maximum number of memories to retain
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  model: ModelType;
  systemPrompt: string;
  context: string;
  temperature: number;
  maxTokens: number;
  connections: Connection[];
  parentId?: string;
  role: AgentRole;
  capabilities: AgentCapabilities;
  subAgents: string[]; // IDs of worker agents managed by this agent
  apiKey?: string;
  baseUrl?: string;
  memoryConfig?: MemoryConfig; // New memory configuration
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'hierarchical' | 'parallel';
  steps: WorkflowStep[];
  config: WorkflowConfig;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId: string;
  toolId: string;
  parameters: Record<string, unknown>;
  validation?: {
    required: boolean;
    rules: ValidationRule[];
  };
  retryStrategy?: {
    maxAttempts: number;
    delayMs: number;
  };
  fallbackStepId?: string;
}

export interface WorkflowConfig {
  maxConcurrentSteps?: number;
  requireApproval?: boolean;
  autoRetry?: {
    maxAttempts: number;
    delayMs: number;
  };
  timeout?: number;
}

export type ValidationRuleValue = string | number | ((value: unknown) => boolean);

export interface ValidationRule {
  type: 'regex' | 'range' | 'custom';
  value: ValidationRuleValue;
  message?: string;
}
