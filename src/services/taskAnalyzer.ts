import { Task, SubTask } from '../types/taskManagement';
import { Agent } from '../types/agent';
import { executeAgentAction } from '../utils/agentExecution';
import { v4 as uuidv4 } from 'uuid';

interface LLMSubtaskResponse {
  title: string;
  description: string;
  requiredCapabilities: string[];
  dependencies: string[];
  complexity: number;
  expectedOutput: string;
}

export class TaskAnalyzer {
  private managerAgent: Agent;

  constructor(managerAgent: Agent) {
    this.managerAgent = managerAgent;
  }

  async analyzeRequirements(task: Task): Promise<{
    subtasks: SubTask[];
    requiredCapabilities: string[];
    estimatedResources: Record<string, number>;
  }> {
    // First break down the task using the manager agent's LLM
    const subtasks = await this.breakdownTask(task);
    
    // Then identify required capabilities for each subtask
    const capabilities = this.identifyRequiredCapabilities(subtasks);
    
    // Finally estimate resource requirements
    const resources = this.estimateResourceRequirements(subtasks);

    return {
      subtasks,
      requiredCapabilities: capabilities,
      estimatedResources: resources
    };
  }

  private async breakdownTask(task: Task): Promise<SubTask[]> {
    // Use the manager agent to break down the task
    const analysisPrompt = `
      Analyze the following task and break it down into subtasks:
      Title: ${task.title}
      Description: ${task.description}
      Priority: ${task.priority}

      For each subtask, provide:
      1. A clear title and description
      2. Required capabilities/skills
      3. Dependencies on other subtasks
      4. Estimated complexity (1-5)
      5. Expected output format

      Respond with a JSON array of subtasks in this exact format:
      [
        {
          "title": "Subtask title",
          "description": "Detailed description",
          "requiredCapabilities": ["capability1", "capability2"],
          "dependencies": [],
          "complexity": 2,
          "expectedOutput": "Expected output format"
        }
      ]
    `;

    try {
      const textGenTool = this.managerAgent.tools.find(t => t.name === 'text-generation');
      if (!textGenTool) {
        throw new Error('Manager agent does not have text generation capability');
      }

      const analysisStep = {
        id: uuidv4(),
        name: 'Task Analysis',
        description: 'Breaking down task into subtasks',
        agentId: this.managerAgent.id,
        toolId: textGenTool.id,
        parameters: {
          prompt: analysisPrompt
        }
      };

      const result = await executeAgentAction(this.managerAgent, analysisStep);
      
      // Parse the LLM response into subtasks
      const parsedSubtasks = this.parseSubtasksFromLLM(result, task.id);
      
      return parsedSubtasks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to break down task:', errorMessage);
      throw new Error(`Task breakdown failed: ${errorMessage}`);
    }
  }

  private parseSubtasksFromLLM(llmResult: unknown, parentTaskId: string): SubTask[] {
    try {
      // Handle the response format from executeAgentAction
      let responseText: string;
      if (typeof llmResult === 'object' && llmResult !== null && 'result' in llmResult) {
        responseText = (llmResult as { result: string }).result;
      } else if (typeof llmResult === 'string') {
        responseText = llmResult;
      } else {
        throw new Error('Invalid LLM response format');
      }

      // Find JSON content in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in LLM response');
      }

      // Parse the JSON content
      const subtasksData: LLMSubtaskResponse[] = JSON.parse(jsonMatch[0]);

      // Validate the parsed data
      if (!Array.isArray(subtasksData)) {
        throw new Error('Parsed content is not an array');
      }

      // Transform the data into SubTask format
      return subtasksData.map((data: LLMSubtaskResponse, index: number) => {
        if (!data.title || !data.description) {
          throw new Error(`Invalid subtask data at index ${index}: missing required fields`);
        }

        return {
          id: uuidv4(),
          parentTaskId,
          title: data.title,
          description: data.description,
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dependencies: data.dependencies || [],
          progress: 0,
          metadata: {
            requiredCapabilities: data.requiredCapabilities || [],
            complexity: data.complexity || 1,
            expectedOutput: data.expectedOutput || '',
            orderIndex: index
          }
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to parse LLM response:', errorMessage);
      throw new Error(`Failed to parse subtasks from LLM response: ${errorMessage}`);
    }
  }

  private identifyRequiredCapabilities(subtasks: SubTask[]): string[] {
    // Aggregate unique capabilities from all subtasks
    const allCapabilities = new Set<string>();
    
    subtasks.forEach(subtask => {
      const capabilities = subtask.metadata.requiredCapabilities;
      if (Array.isArray(capabilities)) {
        capabilities.forEach(cap => allCapabilities.add(cap));
      }
    });

    return Array.from(allCapabilities);
  }

  private estimateResourceRequirements(subtasks: SubTask[]): Record<string, number> {
    // Calculate resource estimates based on subtask complexity and dependencies
    const resources: Record<string, number> = {
      estimatedTimeMinutes: 0,
      totalComplexity: 0,
      parallelizableTasks: 0,
      sequentialTasks: 0
    };

    // Create dependency graph
    const dependencyGraph = new Map<string, string[]>();
    subtasks.forEach(task => {
      dependencyGraph.set(task.id, task.dependencies);
    });

    // Calculate critical path and resource requirements
    const visited = new Set<string>();
    const calculatePath = (taskId: string): number => {
      if (visited.has(taskId)) return 0;
      visited.add(taskId);

      const task = subtasks.find(t => t.id === taskId);
      if (!task) return 0;

      const complexity = task.metadata.complexity || 1;
      const dependencies = dependencyGraph.get(taskId) || [];
      
      const dependencyTimes = dependencies.map(depId => calculatePath(depId));
      const maxDependencyTime = Math.max(0, ...dependencyTimes);

      return complexity + maxDependencyTime;
    };

    // Calculate total complexity and time estimates
    subtasks.forEach(task => {
      resources.totalComplexity += task.metadata.complexity || 1;
      if (task.dependencies.length === 0) {
        resources.parallelizableTasks++;
      } else {
        resources.sequentialTasks++;
      }
    });

    // Estimate total time based on critical path
    const criticalPathLength = Math.max(
      ...subtasks.map(task => calculatePath(task.id))
    );
    resources.estimatedTimeMinutes = criticalPathLength * 5; // Rough estimate: 5 minutes per complexity unit

    return resources;
  }
}
