import { 
  Workflow, 
  WorkflowExecution, 
  WorkflowStep,
  WorkflowStepExecution 
} from '../types/workflow';
import { Agent } from '../types/agent';
import { validateStep } from '../utils/workflowValidation';
import { executeAgentAction } from '../utils/agentExecution';

export class WorkflowEngine {
  private agents: Map<string, Agent>;
  private currentExecution: WorkflowExecution | null = null;

  constructor(agents: Agent[]) {
    this.agents = new Map(agents.map(agent => [agent.id, agent]));
  }

  async executeWorkflow(workflow: Workflow): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      status: 'running',
      currentStepId: workflow.steps[0]?.id || '',
      startedAt: new Date().toISOString(),
      steps: [],
      metrics: {
        totalDuration: 0,
        stepDurations: {},
        retryCount: 0,
        successRate: 0
      }
    };

    this.currentExecution = execution;

    try {
      if (workflow.type === 'sequential') {
        await this.executeSequential(workflow, execution);
      } else if (workflow.type === 'parallel') {
        await this.executeParallel(workflow, execution);
      } else {
        await this.executeHierarchical(workflow, execution);
      }

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      this.updateMetrics(execution);
    } catch (error) {
      execution.status = 'failed';
      execution.error = {
        stepId: execution.currentStepId,
        message: error.message,
        details: error
      };
    }

    return execution;
  }

  private async executeSequential(workflow: Workflow, execution: WorkflowExecution) {
    for (const step of workflow.steps) {
      const result = await this.executeStep(step, execution);
      if (!result.success) {
        if (step.fallbackStepId) {
          const fallbackStep = workflow.steps.find(s => s.id === step.fallbackStepId);
          if (fallbackStep) {
            await this.executeStep(fallbackStep, execution);
          }
        } else {
          throw new Error(`Step ${step.id} failed: ${result.error}`);
        }
      }
    }
  }

  private async executeParallel(workflow: Workflow, execution: WorkflowExecution) {
    const maxConcurrent = workflow.config.maxConcurrentSteps || workflow.steps.length;
    const chunks = this.chunkArray(workflow.steps, maxConcurrent);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(step => this.executeStep(step, execution)));
    }
  }

  private async executeHierarchical(workflow: Workflow, execution: WorkflowExecution) {
    const managerAgent = workflow.steps[0];
    if (!managerAgent) throw new Error('No manager agent defined for hierarchical workflow');

    const result = await this.executeStep(managerAgent, execution);
    if (!result.success) {
      throw new Error(`Manager agent failed: ${result.error}`);
    }
  }

  private async executeStep(
    step: WorkflowStep, 
    execution: WorkflowExecution
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();
    const agent = this.agents.get(step.agentId);
    
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    const stepExecution: WorkflowStepExecution = {
      id: crypto.randomUUID(),
      stepId: step.id,
      status: 'running',
      input: step.parameters,
      startedAt: new Date().toISOString()
    };

    execution.steps.push(stepExecution);
    execution.currentStepId = step.id;

    try {
      // Validate step parameters
      if (step.validation?.required) {
        const validationResult = validateStep(step, stepExecution.input);
        if (!validationResult.valid) {
          throw new Error(`Validation failed: ${validationResult.error}`);
        }
      }

      // Execute the step with retry logic if configured
      const maxAttempts = step.retryStrategy?.maxAttempts || 1;
      const delayMs = step.retryStrategy?.delayMs || 0;

      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await executeAgentAction(agent, step);
          
          stepExecution.status = 'completed';
          stepExecution.output = result;
          stepExecution.completedAt = new Date().toISOString();
          
          execution.metrics.stepDurations[step.id] = Date.now() - startTime;
          
          return { success: true };
        } catch (error) {
          lastError = error;
          if (attempt < maxAttempts) {
            execution.metrics.retryCount++;
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }

      throw lastError;
    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.error = error.message;
      stepExecution.completedAt = new Date().toISOString();
      
      execution.metrics.stepDurations[step.id] = Date.now() - startTime;
      
      return { success: false, error: error.message };
    }
  }

  private updateMetrics(execution: WorkflowExecution) {
    const totalDuration = Date.now() - new Date(execution.startedAt).getTime();
    const successfulSteps = execution.steps.filter(s => s.status === 'completed').length;
    
    execution.metrics = {
      ...execution.metrics,
      totalDuration,
      successRate: (successfulSteps / execution.steps.length) * 100
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}