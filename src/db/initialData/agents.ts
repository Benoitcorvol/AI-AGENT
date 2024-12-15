import { Agent } from '../../types/agent';
import { roleCapabilities } from '../../utils/agentRoles';
import { initialTools } from './tools';

export const initialAgents: Agent[] = [
  {
    id: 'manager-1',
    name: 'Task Manager',
    description: 'Coordinates and delegates tasks to worker agents',
    model: 'gpt-4',
    systemPrompt: 'You are a manager agent responsible for coordinating tasks.',
    context: 'Task management and delegation',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[0]], // Web Search tool
    connections: [],
    role: 'manager',
    capabilities: roleCapabilities.manager,
    subAgents: []
  },
  {
    id: 'coordinator-1',
    name: 'Team Coordinator',
    description: 'Coordinates between different worker agents',
    model: 'gpt-4',
    systemPrompt: 'You are a coordinator agent focused on team collaboration.',
    context: 'Team coordination and task management',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analyzer
    connections: [],
    role: 'coordinator',
    capabilities: roleCapabilities.coordinator,
    subAgents: []
  },
  {
    id: 'worker-1',
    name: 'Research Assistant',
    description: 'Performs web research and analysis',
    model: 'gpt-4',
    systemPrompt: 'You are a research assistant focused on gathering information.',
    context: 'Web research and data analysis',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analyzer
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'worker-2',
    name: 'Code Assistant',
    description: 'Handles code-related tasks and analysis',
    model: 'gpt-4',
    systemPrompt: 'You are a coding assistant focused on software development.',
    context: 'Software development and code analysis',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  }
];