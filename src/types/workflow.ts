export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'hierarchical' | 'parallel';
  managerId?: string; // For hierarchical workflows
  workerIds?: string[];
  steps: WorkflowStep[];
  config: WorkflowConfig;
  createdAt: string;
  updatedAt: string;
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

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId: string;
  toolId: string;
  parameters: Record<string, any>;
  subAgents?: string[]; // IDs of sub-agents for manager/coordinator agents
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

export interface ValidationRule {
  type: 'regex' | 'range' | 'custom';
  value: string | number | ((input: any) => boolean);
  message?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStepId: string;
  startedAt: string;
  completedAt?: string;
  steps: WorkflowStepExecution[];
  metrics?: {
    totalDuration: number;
    stepDurations: Record<string, number>;
    retryCount: number;
    successRate: number;
  };
  error?: {
    stepId: string;
    message: string;
    details: any;
  };
}

export interface WorkflowStepExecution {
  id: string;
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}