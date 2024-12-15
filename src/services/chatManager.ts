import { Message, Conversation } from '../types/chat';
import { Agent } from '../types/agent';
import { WorkflowManager } from './workflowManager';
import { TaskAnalyzer } from './taskAnalyzer';

export class ChatManager {
  private workflowManager: WorkflowManager;
  private taskAnalyzer: TaskAnalyzer;
  private conversations: Map<string, Conversation>;

  constructor(agents: Agent[]) {
    this.workflowManager = new WorkflowManager(agents);
    this.taskAnalyzer = new TaskAnalyzer();
    this.conversations = new Map();
  }

  async startConversation(workflowId: string, title: string, participants: Conversation['participants']): Promise<Conversation> {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      workflowId,
      title,
      participants,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add initial system message
    const managerAgent = participants.find(p => p.role === 'Manager');
    if (managerAgent) {
      conversation.messages.push({
        id: crypto.randomUUID(),
        workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: "Hello! I'm your workflow manager. I'll help coordinate the tasks between our team members. What would you like us to help you with?",
        timestamp: new Date().toISOString()
      });
    }

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async sendMessage(conversationId: string, content: string, senderId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      workflowId: conversation.workflowId,
      senderId,
      senderType: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date().toISOString();

    // Get manager agent
    const managerAgent = conversation.participants.find(p => p.role === 'Manager');
    if (!managerAgent) throw new Error('No manager agent found');

    // Add thinking message
    const thinkingMessage: Message = {
      id: crypto.randomUUID(),
      workflowId: conversation.workflowId,
      senderId: managerAgent.id,
      senderType: 'agent',
      content: "I'll help you with that. Here's my plan:",
      timestamp: new Date().toISOString(),
      metadata: {
        status: 'thinking'
      }
    };

    conversation.messages.push(thinkingMessage);

    try {
      // Simulate manager thinking
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Manager's plan
      const planMessage: Message = {
        id: crypto.randomUUID(),
        workflowId: conversation.workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: "I'll help coordinate this task. Here's how we'll proceed:",
        timestamp: new Date().toISOString()
      };

      conversation.messages.push(planMessage);

      // Get worker agents
      const workers = conversation.participants.filter(p => p.role === 'Worker');

      // Simulate worker assignments
      for (const worker of workers) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const assignmentMessage: Message = {
          id: crypto.randomUUID(),
          workflowId: conversation.workflowId,
          senderId: managerAgent.id,
          senderType: 'agent',
          content: `@${worker.name}, please help with this task.`,
          timestamp: new Date().toISOString()
        };

        conversation.messages.push(assignmentMessage);

        // Worker acknowledgment
        const workerMessage: Message = {
          id: crypto.randomUUID(),
          workflowId: conversation.workflowId,
          senderId: worker.id,
          senderType: 'agent',
          content: `I'll start working on it right away.`,
          timestamp: new Date().toISOString(),
          metadata: {
            status: 'executing'
          }
        };

        conversation.messages.push(workerMessage);
      }

      // Final status
      const statusMessage: Message = {
        id: crypto.randomUUID(),
        workflowId: conversation.workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: "The team is now working on your request. I'll keep you updated on our progress.",
        timestamp: new Date().toISOString(),
        metadata: {
          status: 'executing'
        }
      };

      conversation.messages.push(statusMessage);

    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        workflowId: conversation.workflowId,
        senderId: managerAgent.id,
        senderType: 'agent',
        content: "I apologize, but I encountered an error while processing your request.",
        timestamp: new Date().toISOString(),
        metadata: {
          status: 'error',
          error: error.message
        }
      };

      conversation.messages.push(errorMessage);
    }
  }

  getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }
}