export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'analyzing' | 'assigned' | 'executing' | 'reviewing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  parentTaskId?: string;
  metadata: Record<string, any>;
}

export interface SubTask extends Task {
  parentTaskId: string;
  assignedAgentId?: string;
  assignedToolId?: string;
  dependencies: string[];
  progress: number;
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  output: any;
  metrics: {
    startTime: string;
    endTime: string;
    duration: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details: any;
  };
}