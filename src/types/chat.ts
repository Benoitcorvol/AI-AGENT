import { AgentRole } from './agent';

export interface Message {
  id: string;
  workflowId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  timestamp: string;
  metadata?: {
    taskId?: string;
    toolId?: string;
    status?: 'thinking' | 'executing' | 'complete' | 'error';
    result?: unknown;
  };
}

export interface BaseParticipant {
  id: string;
  name: string;
}

export interface UserParticipant extends BaseParticipant {
  type: 'user';
}

export interface AgentParticipant extends BaseParticipant {
  type: 'agent';
  role: AgentRole;
}

export type ConversationParticipant = UserParticipant | AgentParticipant;

export interface Conversation {
  id: string;
  workflowId: string;
  title: string;
  participants: ConversationParticipant[];
  messages: Message[];
  status: 'active' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}
