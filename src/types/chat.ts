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
    result?: any;
  };
}

export interface Conversation {
  id: string;
  workflowId: string;
  title: string;
  participants: {
    id: string;
    type: 'user' | 'agent';
    name: string;
    role?: string;
  }[];
  messages: Message[];
  status: 'active' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}