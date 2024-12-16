import { Message, Conversation, AgentParticipant } from '../types/chat';
import { Agent } from '../types/agent';
import { WorkflowManager } from './workflowManager';
import { TaskAnalyzer } from './taskAnalyzer';
import { Task, SubTask } from '../types/taskManagement';
import { executeAgentAction } from '../utils/agentExecution';
import { AgentMemoryIntegration } from './agentMemoryIntegration';
import { v4 as uuidv4 } from 'uuid';

interface AgentResponse {
  content: string;
  status: 'success' | 'failure' | 'needs_validation';
  metadata?: Record<string, unknown>;
}

interface ValidationResult {
  isValid: boolean;
  feedback: string;
  suggestedImprovements: string[];
}

export class ChatManager {
  private workflowManager: WorkflowManager;
  private taskAnalyzer: TaskAnalyzer;
  private conversations: Map<string, Conversation>;
  private agents: Agent[];
  private memoryIntegration: AgentMemoryIntegration;

  constructor(agents: Agent[]) {
    this.agents = agents;
    const managerAgent = agents.find(a => a.role === 'manager');
    if (!managerAgent) {
      throw new Error('No manager agent found in the provided agents list');
    }

    this.workflowManager = new WorkflowManager(agents);
    this.taskAnalyzer = new TaskAnalyzer(managerAgent);
    this.conversations = new Map();
    this.memoryIntegration = AgentMemoryIntegration.getInstance();
  }

  async startConversation(workflowId: string, title: string, participants: Conversation['participants']): Promise<Conversation> {
    const conversation: Conversation = {
      id: uuidv4(),
      workflowId,
      title,
      participants,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add initial system message from manager
    const managerParticipant = participants.find(p => 
      p.type === 'agent' && (p as AgentParticipant).role === 'manager'
    ) as AgentParticipant | undefined;

    if (managerParticipant) {
      const managerAgent = this.agents.find(a => a.id === managerParticipant.id);
      if (managerAgent) {
        const initialMessage = "Hello! I'm your workflow manager. I'll help coordinate tasks between our team members. What would you like us to help you with?";
        
        conversation.messages.push({
          id: uuidv4(),
          workflowId,
          senderId: managerAgent.id,
          senderType: 'agent',
          content: initialMessage,
          timestamp: new Date().toISOString()
        });

        // Store initial message in memory if agent has memory capability
        if (managerAgent.capabilities.canUseMemory) {
          await this.memoryIntegration.processAgentMessage(managerAgent, initialMessage, 'assistant');
        }
      }
    }

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async sendMessage(conversationId: string, content: string, senderId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      workflowId: conversation.workflowId,
      senderId,
      senderType: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date().toISOString();

    // Get manager agent
    const managerParticipant = conversation.participants.find(p => 
      p.type === 'agent' && (p as AgentParticipant).role === 'manager'
    ) as AgentParticipant | undefined;

    if (!managerParticipant) throw new Error('No manager participant found');
    
    const managerAgent = this.agents.find(a => a.id === managerParticipant.id);
    if (!managerAgent) throw new Error('No manager agent found');

    // Store user message in manager's memory
    if (managerAgent.capabilities.canUseMemory) {
      await this.memoryIntegration.processAgentMessage(managerAgent, content, 'user');
    }

    try {
      // 1. Create initial task from user message
      const task: Task = {
        id: uuidv4(),
        title: 'User Request',
        description: content,
        priority: 'medium',
        status: 'analyzing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      };

      // 2. Manager analyzes and breaks down the task
      await this.addThinkingMessage(conversation, managerAgent.id, "Analyzing your request and creating a plan...");
      
      // Enhance task context with relevant memories
      if (managerAgent.capabilities.canUseMemory) {
        task.description = await this.memoryIntegration.updateAgentContext(managerAgent, task.description);
      }
      
      let analysis;
      try {
        analysis = await this.taskAnalyzer.analyzeRequirements(task);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to analyze task requirements: ${errorMessage}`);
      }

      if (!analysis || !analysis.subtasks || analysis.subtasks.length === 0) {
        throw new Error('Task analysis produced no valid subtasks');
      }

      // 3. Manager creates execution plan
      const planMessage = await this.createExecutionPlan(conversation, managerAgent, analysis.subtasks);
      conversation.messages.push(planMessage);

      // Store plan in memory
      if (managerAgent.capabilities.canUseMemory) {
        await this.memoryIntegration.processAgentMessage(managerAgent, planMessage.content, 'assistant');
      }

      // 4. Execute subtasks with appropriate agents
      for (const subtask of analysis.subtasks) {
        const result = await this.executeSubtask(conversation, subtask);
        
        // 5. Manager validates the result
        const isValid = await this.validateResult(conversation, managerAgent, subtask, result);
        
        if (!isValid) {
          // Retry with feedback
          const retryResult = await this.retrySubtask(conversation, subtask, result);
          if (!retryResult.success) {
            throw new Error(`Failed to complete subtask: ${subtask.title}`);
          }
        }
      }

      // 6. Final status update
      const completionMessage = "I've completed all the tasks successfully. Is there anything else you need?";
      const statusMessage: Message = {
        id: uuidv4(),
        workflowId: conversation.workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: completionMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          status: 'complete'
        }
      };

      conversation.messages.push(statusMessage);

      // Store completion message in memory
      if (managerAgent.capabilities.canUseMemory) {
        await this.memoryIntegration.processAgentMessage(managerAgent, completionMessage, 'assistant');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in chat manager:', error);
      
      const failureContent = `I apologize, but I encountered an error: ${errorMessage}`;
      const failureMessage: Message = {
        id: uuidv4(),
        workflowId: conversation.workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: failureContent,
        timestamp: new Date().toISOString(),
        metadata: {
          status: 'error',
          result: errorMessage
        }
      };

      conversation.messages.push(failureMessage);

      // Store error message in memory
      if (managerAgent.capabilities.canUseMemory) {
        await this.memoryIntegration.processAgentMessage(managerAgent, failureContent, 'assistant');
      }
    }
  }

  private async addThinkingMessage(conversation: Conversation, agentId: string, content: string): Promise<void> {
    const thinkingMessage: Message = {
      id: uuidv4(),
      workflowId: conversation.workflowId,
      senderId: agentId,
      senderType: 'agent',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        status: 'thinking'
      }
    };

    conversation.messages.push(thinkingMessage);

    // Store thinking message in memory
    const agent = this.agents.find(a => a.id === agentId);
    if (agent?.capabilities.canUseMemory) {
      await this.memoryIntegration.processAgentMessage(agent, content, 'assistant');
    }
  }

  private async createExecutionPlan(
    conversation: Conversation,
    managerAgent: Agent,
    subtasks: SubTask[]
  ): Promise<Message> {
    let planPrompt = `
      Create an execution plan for the following subtasks:
      ${subtasks.map((st, i) => `
        ${i + 1}. ${st.title}
        Description: ${st.description}
        Required Capabilities: ${st.metadata.requiredCapabilities.join(', ')}
        Dependencies: ${st.dependencies.length ? st.dependencies.join(', ') : 'None'}
      `).join('\n')}

      Provide a clear plan that includes:
      1. Task execution order
      2. Agent assignments
      3. Success criteria for each task
      4. Coordination points
    `;

    // Enhance prompt with relevant memories if available
    if (managerAgent.capabilities.canUseMemory) {
      planPrompt = await this.memoryIntegration.updateAgentContext(managerAgent, planPrompt);
    }

    const planStep = {
      id: uuidv4(),
      name: 'Create Execution Plan',
      description: 'Creating detailed execution plan for subtasks',
      agentId: managerAgent.id,
      toolId: managerAgent.tools.find(t => t.name === 'text-generation')?.id || '',
      parameters: {
        prompt: planPrompt
      }
    };

    const result = await executeAgentAction(managerAgent, planStep);
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    // Store plan in memory
    if (managerAgent.capabilities.canUseMemory) {
      await this.memoryIntegration.processAgentMessage(managerAgent, content, 'assistant');
    }

    return {
      id: uuidv4(),
      workflowId: conversation.workflowId,
      senderId: managerAgent.id,
      senderType: 'agent',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        taskId: subtasks[0].id,
        status: 'complete'
      }
    };
  }

  private async executeSubtask(conversation: Conversation, subtask: SubTask): Promise<AgentResponse> {
    // Find the most suitable agent for this subtask
    const agent = this.findBestAgentForSubtask(subtask);
    if (!agent) {
      throw new Error(`No suitable agent found for subtask: ${subtask.title}`);
    }

    // Add assignment message
    await this.addThinkingMessage(
      conversation,
      agent.id,
      `Working on: ${subtask.title}`
    );

    // Prepare execution prompt
    let executionPrompt = `
      Execute the following task:
      ${subtask.description}
      
      Expected Output: ${subtask.metadata.expectedOutput}
      
      Provide your response in a clear and structured format.
    `;

    // Enhance prompt with relevant memories if available
    if (agent.capabilities.canUseMemory) {
      executionPrompt = await this.memoryIntegration.updateAgentContext(agent, executionPrompt);
    }

    // Execute the subtask
    const executionStep = {
      id: uuidv4(),
      name: subtask.title,
      description: subtask.description,
      agentId: agent.id,
      toolId: agent.tools[0].id, // Select appropriate tool based on task
      parameters: {
        prompt: executionPrompt
      }
    };

    const result = await executeAgentAction(agent, executionStep);
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    // Store execution result in memory
    if (agent.capabilities.canUseMemory) {
      await this.memoryIntegration.processAgentMessage(agent, content, 'assistant');
    }

    return {
      content,
      status: 'needs_validation'
    };
  }

  private findBestAgentForSubtask(subtask: SubTask): Agent | undefined {
    // Filter agents by required capabilities
    const requiredCapabilities = subtask.metadata.requiredCapabilities as string[];
    
    return this.agents.find(agent => 
      agent.role === 'worker' && // Only consider worker agents
      requiredCapabilities.every(capability => 
        // Check if agent has necessary tools/capabilities
        agent.tools.some(tool => 
          tool.description.toLowerCase().includes(capability.toLowerCase())
        )
      )
    );
  }

  private async validateResult(
    conversation: Conversation,
    managerAgent: Agent,
    subtask: SubTask,
    result: AgentResponse
  ): Promise<boolean> {
    let validationPrompt = `
      Validate the following task result:
      
      Task: ${subtask.title}
      Description: ${subtask.description}
      Expected Output: ${subtask.metadata.expectedOutput}
      
      Result:
      ${result.content}
      
      Validate that the result:
      1. Completely addresses the task requirements
      2. Matches the expected output format
      3. Is accurate and high quality
      
      Respond with a JSON object containing:
      {
        "isValid": boolean,
        "feedback": string,
        "suggestedImprovements": string[]
      }
    `;

    // Enhance validation prompt with relevant memories
    if (managerAgent.capabilities.canUseMemory) {
      validationPrompt = await this.memoryIntegration.updateAgentContext(managerAgent, validationPrompt);
    }

    const validationStep = {
      id: uuidv4(),
      name: 'Validate Result',
      description: 'Validating subtask result',
      agentId: managerAgent.id,
      toolId: managerAgent.tools.find(t => t.name === 'text-generation')?.id || '',
      parameters: {
        prompt: validationPrompt
      }
    };

    const validationResult = await executeAgentAction(managerAgent, validationStep);
    let validation: ValidationResult;
    
    try {
      validation = typeof validationResult === 'string' 
        ? JSON.parse(validationResult)
        : validationResult as ValidationResult;
    } catch (error) {
      console.error('Failed to parse validation result:', error);
      return false;
    }

    // Store validation result in memory
    if (managerAgent.capabilities.canUseMemory) {
      await this.memoryIntegration.processAgentMessage(
        managerAgent,
        `Validation result for ${subtask.title}: ${validation.feedback}`,
        'assistant'
      );
    }

    // Add validation message to conversation
    const validationMessage: Message = {
      id: uuidv4(),
      workflowId: conversation.workflowId,
      senderId: managerAgent.id,
      senderType: 'agent',
      content: validation.feedback,
      timestamp: new Date().toISOString(),
      metadata: {
        taskId: subtask.id,
        status: validation.isValid ? 'complete' : 'error'
      }
    };

    conversation.messages.push(validationMessage);

    return validation.isValid;
  }

  private async retrySubtask(
    conversation: Conversation,
    subtask: SubTask,
    previousResult: AgentResponse
  ): Promise<{ success: boolean; result?: AgentResponse }> {
    const agent = this.findBestAgentForSubtask(subtask);
    if (!agent) {
      throw new Error(`No suitable agent found for retry of subtask: ${subtask.title}`);
    }

    // Add retry message
    await this.addThinkingMessage(
      conversation,
      agent.id,
      `Retrying task with improvements: ${subtask.title}`
    );

    let retryPrompt = `
      Previous attempt result:
      ${previousResult.content}
      
      Feedback and required improvements:
      ${previousResult.metadata?.feedback || 'Improve the quality and completeness of the response'}
      
      Please retry the task:
      ${subtask.description}
      
      Expected Output: ${subtask.metadata.expectedOutput}
      
      Ensure your new response addresses all the feedback and meets the requirements.
    `;

    // Enhance retry prompt with relevant memories
    if (agent.capabilities.canUseMemory) {
      retryPrompt = await this.memoryIntegration.updateAgentContext(agent, retryPrompt);
    }

    const retryStep = {
      id: uuidv4(),
      name: `Retry: ${subtask.title}`,
      description: subtask.description,
      agentId: agent.id,
      toolId: agent.tools[0].id,
      parameters: {
        prompt: retryPrompt
      }
    };

    try {
      const result = await executeAgentAction(agent, retryStep);
      const content = typeof result === 'string' ? result : JSON.stringify(result);

      // Store retry result in memory
      if (agent.capabilities.canUseMemory) {
        await this.memoryIntegration.processAgentMessage(agent, content, 'assistant');
      }
      
      return {
        success: true,
        result: {
          content,
          status: 'success'
        }
      };
    } catch (error) {
      console.error('Failed to retry subtask:', error);
      return { success: false };
    }
  }

  getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }
}
