import { Task, SubTask, TaskResult } from '../types/taskManagement';
import { ResourceManager } from './resourceManager';
import { ExecutionMonitor } from './executionMonitor';
import { Agent } from '../types/agent';

interface ExecutionNode {
  subtask: SubTask;
  dependencies: Set<string>;
  dependents: Set<string>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: TaskResult;
}

interface ResourceAllocation {
  agent: Agent;
  startTime: string;
  endTime?: string;
  metrics: {
    cpu: number;
    memory: number;
  };
}

export class ExecutionManager {
  private resourceManager: ResourceManager;
  private monitor: ExecutionMonitor;
  private activeExecutions: Map<string, {
    subtask: SubTask;
    promise: Promise<TaskResult>;
    allocation?: ResourceAllocation;
  }>;

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
    this.monitor = new ExecutionMonitor();
    this.activeExecutions = new Map();
  }

  async executeTask(task: Task, subtasks: SubTask[]): Promise<TaskResult> {
    try {
      // Create execution graph
      const executionPlan = this.createExecutionPlan(subtasks);
      
      // Execute according to dependencies
      const results = await this.executeSubtasks(executionPlan);
      
      // Aggregate and validate results
      const finalResult = this.aggregateResults(results);
      
      // Update task status
      task.status = finalResult.success ? 'completed' : 'failed';
      task.updatedAt = new Date().toISOString();

      return finalResult;
    } catch (error) {
      return this.handleExecutionError(error, task);
    }
  }

  private createExecutionPlan(subtasks: SubTask[]): Map<string, ExecutionNode> {
    const executionGraph = new Map<string, ExecutionNode>();

    // Create nodes
    subtasks.forEach(subtask => {
      executionGraph.set(subtask.id, {
        subtask,
        dependencies: new Set(subtask.dependencies),
        dependents: new Set(),
        status: 'pending'
      });
    });

    // Build dependency relationships
    subtasks.forEach(subtask => {
      subtask.dependencies.forEach(depId => {
        const dependentNode = executionGraph.get(depId);
        if (dependentNode) {
          dependentNode.dependents.add(subtask.id);
        }
      });
    });

    return executionGraph;
  }

  private async executeSubtasks(executionPlan: Map<string, ExecutionNode>): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const inProgress = new Set<string>();
    
    while (executionPlan.size > 0 || inProgress.size > 0) {
      // Find ready tasks (all dependencies completed)
      const readyTasks = Array.from(executionPlan.entries())
        .filter(([, node]) => {
          return node.status === 'pending' && 
                 Array.from(node.dependencies).every(depId => {
                   const depNode = executionPlan.get(depId);
                   return depNode && depNode.status === 'completed';
                 });
        })
        .map(([id]) => id);

      // Execute ready tasks in parallel
      const executions = readyTasks.map(async taskId => {
        const node = executionPlan.get(taskId)!;
        inProgress.add(taskId);
        
        try {
          const result = await this.executeSubtask(node.subtask);
          node.status = result.success ? 'completed' : 'failed';
          node.result = result;
          results.push(result);

          // Clean up completed task
          executionPlan.delete(taskId);
          inProgress.delete(taskId);

          // Update dependent tasks
          node.dependents.forEach(depId => {
            const depNode = executionPlan.get(depId);
            if (depNode) {
              depNode.dependencies.delete(taskId);
            }
          });
        } catch (error) {
          node.status = 'failed';
          inProgress.delete(taskId);
          throw error;
        }
      });

      if (executions.length > 0) {
        await Promise.all(executions);
      } else if (inProgress.size > 0) {
        // Wait for in-progress tasks
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // No tasks ready and none in progress - might be a cycle
        throw new Error('Execution deadlock detected - possible circular dependency');
      }
    }

    return results;
  }

  private async executeSubtask(subtask: SubTask): Promise<TaskResult> {
    const startTime = new Date().toISOString();
    const resources = await this.resourceManager.allocateResources(subtask);
    
    if (!resources) {
      throw new Error(`No suitable resources found for subtask ${subtask.id}`);
    }

    const allocation: ResourceAllocation = {
      agent: resources.agent,
      startTime,
      metrics: {
        cpu: 0,
        memory: 0
      }
    };

    try {
      const execution = this.monitor.startExecution(subtask, resources);
      this.activeExecutions.set(subtask.id, {
        subtask,
        promise: execution.promise,
        allocation
      });
      
      // Monitor resource usage
      const resourceTracking = this.monitor.trackResourceUsage(subtask.id);
      
      const result = await execution.promise;
      
      // Update resource metrics
      allocation.endTime = new Date().toISOString();
      allocation.metrics = await resourceTracking;
      
      // Cleanup
      this.activeExecutions.delete(subtask.id);
      await this.resourceManager.releaseResources(resources.agent.id);
      
      return {
        ...result,
        metrics: {
          startTime: allocation.startTime,
          endTime: allocation.endTime,
          duration: new Date(allocation.endTime).getTime() - new Date(allocation.startTime).getTime(),
          resourceUsage: allocation.metrics
        }
      };
    } catch (error) {
      this.handleSubtaskError(error, subtask);
      throw error;
    }
  }

  private aggregateResults(results: TaskResult[]): TaskResult {
    const startTime = results[0]?.metrics.startTime || new Date().toISOString();
    const endTime = results[results.length - 1]?.metrics.endTime || new Date().toISOString();
    
    const success = results.every(r => r.success);
    const totalDuration = results.reduce((sum, r) => sum + r.metrics.duration, 0);
    
    const resourceUsage = results.reduce((total, r) => ({
      cpu: total.cpu + r.metrics.resourceUsage.cpu,
      memory: total.memory + r.metrics.resourceUsage.memory
    }), { cpu: 0, memory: 0 });

    return {
      success,
      output: results.map(r => r.output),
      metrics: {
        startTime,
        endTime,
        duration: totalDuration,
        resourceUsage
      }
    };
  }

  private handleExecutionError(error: unknown, task: Task): TaskResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Task execution failed:', errorMessage);
    
    return {
      success: false,
      output: null,
      metrics: {
        startTime: task.createdAt,
        endTime: new Date().toISOString(),
        duration: 0,
        resourceUsage: { cpu: 0, memory: 0 }
      },
      error: {
        code: 'EXECUTION_ERROR',
        message: errorMessage,
        details: error
      }
    };
  }

  private handleSubtaskError(error: unknown, subtask: SubTask): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Subtask ${subtask.id} failed:`, errorMessage);
    
    // Update subtask status
    subtask.status = 'failed';
    subtask.updatedAt = new Date().toISOString();
    subtask.result = {
      success: false,
      output: null,
      metrics: {
        startTime: subtask.createdAt,
        endTime: new Date().toISOString(),
        duration: 0,
        resourceUsage: { cpu: 0, memory: 0 }
      },
      error: {
        code: 'SUBTASK_ERROR',
        message: errorMessage,
        details: error
      }
    };
  }

  getActiveExecutions(): Map<string, {
    subtask: SubTask;
    allocation?: ResourceAllocation;
  }> {
    // Return active executions without exposing promises
    return new Map(
      Array.from(this.activeExecutions.entries()).map(([id, data]) => [
        id,
        {
          subtask: data.subtask,
          allocation: data.allocation
        }
      ])
    );
  }
}
