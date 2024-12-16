import { SubTask, TaskResult } from '../types/taskManagement';
import { Agent, Tool } from '../types/agent';
import EventEmitter from 'eventemitter3';

interface ExecutionContext {
  subtask: SubTask;
  agent: Agent;
  tools: Tool[];
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  timestamp: number;
}

export class ExecutionMonitor extends EventEmitter {
  private executions: Map<string, {
    context: ExecutionContext;
    startTime: number;
    status: 'running' | 'completed' | 'failed';
    progress: number;
    logs: string[];
    resourceMetrics: ResourceMetrics[];
  }>;

  private metricsInterval: number = 1000; // 1 second

  constructor() {
    super();
    this.executions = new Map();
  }

  startExecution(
    subtask: SubTask,
    resources: { agent: Agent; tools: Tool[] }
  ): { promise: Promise<TaskResult> } {
    const context = {
      subtask,
      agent: resources.agent,
      tools: resources.tools
    };

    this.executions.set(subtask.id, {
      context,
      startTime: Date.now(),
      status: 'running',
      progress: 0,
      logs: [],
      resourceMetrics: []
    });

    const promise = this.monitorExecution(subtask.id);
    return { promise };
  }

  async trackResourceUsage(executionId: string): Promise<{ cpu: number; memory: number }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`No execution found with id ${executionId}`);
    }

    return new Promise((resolve) => {
      const metricsCollector = setInterval(() => {
        if (execution.status !== 'running') {
          clearInterval(metricsCollector);
          
          // Calculate average resource usage
          const metrics = execution.resourceMetrics;
          const avgCpu = metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length;
          const avgMemory = metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length;
          
          resolve({ cpu: avgCpu, memory: avgMemory });
        } else {
          // Collect current metrics
          const currentMetrics: ResourceMetrics = {
            cpu: this.measureCpuUsage(execution.context),
            memory: this.measureMemoryUsage(execution.context),
            timestamp: Date.now()
          };
          
          execution.resourceMetrics.push(currentMetrics);
          
          // Emit metrics event
          this.emit('metrics', {
            executionId,
            metrics: currentMetrics
          });
        }
      }, this.metricsInterval);
    });
  }

  private measureCpuUsage(context: ExecutionContext): number {
    // In a real implementation, this would measure actual CPU usage based on the agent and tools
    const baseUsage = 0.1; // 10% base usage
    const toolOverhead = context.tools.length * 0.05; // 5% per tool
    const agentComplexity = context.agent.capabilities.canDelegateWork ? 0.1 : 0.05; // More CPU for complex agents
    
    return Math.min(baseUsage + toolOverhead + agentComplexity, 1.0);
  }

  private measureMemoryUsage(context: ExecutionContext): number {
    // In a real implementation, this would measure actual memory usage based on the agent and tools
    const baseMemory = 50; // 50MB base memory
    const toolMemory = context.tools.length * 20; // 20MB per tool
    const agentMemory = context.agent.capabilities.canDelegateWork ? 50 : 25; // More memory for complex agents
    
    return baseMemory + toolMemory + agentMemory;
  }

  private async monitorExecution(executionId: string): Promise<TaskResult> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`No execution found with id ${executionId}`);
    }

    try {
      // Start resource tracking
      const resourceTracking = this.trackResourceUsage(executionId);

      // Monitor execution progress and emit events
      this.emit('progress', {
        executionId,
        progress: execution.progress,
        status: execution.status
      });

      // Simulate execution for now
      const result = await this.simulateExecution(execution.context);
      
      // Update execution status
      execution.status = 'completed';
      execution.progress = 100;
      
      // Get final resource metrics
      const resourceUsage = await resourceTracking;

      // Combine result with resource metrics
      const finalResult: TaskResult = {
        ...result,
        metrics: {
          ...result.metrics,
          resourceUsage
        }
      };

      this.emit('completed', {
        executionId,
        result: finalResult
      });

      return finalResult;
    } catch (error) {
      execution.status = 'failed';
      
      this.emit('failed', {
        executionId,
        error
      });
      
      throw error;
    }
  }

  private async simulateExecution(context: ExecutionContext): Promise<TaskResult> {
    // Simulate task execution with context-aware behavior
    const executionTime = this.estimateExecutionTime(context);
    await new Promise(resolve => setTimeout(resolve, executionTime));

    return {
      success: true,
      output: `Executed task: ${context.subtask.title} using ${context.agent.name} with ${context.tools.length} tools`,
      metrics: {
        startTime: new Date(Date.now() - executionTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: executionTime,
        resourceUsage: {
          cpu: this.measureCpuUsage(context),
          memory: this.measureMemoryUsage(context)
        }
      }
    };
  }

  private estimateExecutionTime(context: ExecutionContext): number {
    // Estimate execution time based on task complexity and agent capabilities
    const baseTime = 1000; // 1 second base time
    const toolOverhead = context.tools.length * 500; // 500ms per tool
    const complexityFactor = context.agent.capabilities.canDelegateWork ? 1.5 : 1;
    
    return (baseTime + toolOverhead) * complexityFactor;
  }

  getExecutionStatus(executionId: string) {
    return this.executions.get(executionId);
  }

  getAllExecutions() {
    return Array.from(this.executions.entries());
  }

  getResourceMetrics(executionId: string): ResourceMetrics[] {
    const execution = this.executions.get(executionId);
    return execution ? execution.resourceMetrics : [];
  }
}
