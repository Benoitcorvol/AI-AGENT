import { Agent } from '../../types/agent';
import { initialTools } from './tools';

const roleCapabilities = {
  manager: {
    canCreateSubAgents: true,
    canDelegateWork: true,
    canAccessOtherAgents: true
  },
  coordinator: {
    canCreateSubAgents: false,
    canDelegateWork: true,
    canAccessOtherAgents: true
  },
  worker: {
    canCreateSubAgents: false,
    canDelegateWork: false,
    canAccessOtherAgents: false
  }
};

export const initialAgents: Agent[] = [
  {
    id: 'cto-agent',
    name: 'Tech Strategy Lead',
    description: 'Chief Technology Officer - Oversees technical direction and architecture decisions',
    model: 'openai/gpt-4',
    systemPrompt: 'You are the CTO of a modern IT agency. Focus on technical strategy, architecture decisions, and team coordination.',
    context: 'Technical leadership and strategic planning',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1], initialTools[3]], // Web Search, Text Analysis, and Text Generation
    connections: [],
    role: 'manager',
    capabilities: roleCapabilities.manager,
    subAgents: []
  },
  {
    id: 'project-manager',
    name: 'Project Orchestrator',
    description: 'Senior Project Manager - Coordinates teams and manages project timelines',
    model: 'anthropic/claude-2',
    systemPrompt: 'You are a senior project manager focused on coordinating teams and ensuring project success.',
    context: 'Project management and team coordination',
    temperature: 0.6,
    maxTokens: 2048,
    tools: [initialTools[1]], // Text Analysis
    connections: [],
    role: 'coordinator',
    capabilities: roleCapabilities.coordinator,
    subAgents: []
  },
  {
    id: 'frontend-lead',
    name: 'UI/UX Architect',
    description: 'Frontend Development Lead - Specializes in modern web interfaces and user experience',
    model: 'openai/gpt-4',
    systemPrompt: 'You are a frontend development lead specializing in modern web technologies and user experience design.',
    context: 'Frontend development and UI/UX design',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'coordinator',
    capabilities: roleCapabilities.coordinator,
    subAgents: []
  },
  {
    id: 'backend-lead',
    name: 'Systems Architect',
    description: 'Backend Development Lead - Focuses on scalable architecture and APIs',
    model: 'openai/gpt-4',
    systemPrompt: 'You are a backend development lead focusing on scalable systems and API design.',
    context: 'Backend development and system architecture',
    temperature: 0.6,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'coordinator',
    capabilities: roleCapabilities.coordinator,
    subAgents: []
  },
  {
    id: 'devops-engineer',
    name: 'Infrastructure Specialist',
    description: 'DevOps Engineer - Manages cloud infrastructure and deployment pipelines',
    model: 'anthropic/claude-2',
    systemPrompt: 'You are a DevOps engineer specializing in cloud infrastructure and CI/CD pipelines.',
    context: 'Cloud infrastructure and automation',
    temperature: 0.5,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'security-expert',
    name: 'Security Guardian',
    description: 'Security Specialist - Ensures application and infrastructure security',
    model: 'openai/gpt-4',
    systemPrompt: 'You are a security specialist focused on identifying and mitigating security risks.',
    context: 'Application and infrastructure security',
    temperature: 0.4,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analysis
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'frontend-dev',
    name: 'UI Developer',
    description: 'Frontend Developer - Implements responsive and accessible web interfaces',
    model: 'openai/gpt-3.5-turbo',
    systemPrompt: 'You are a frontend developer specializing in responsive and accessible web interfaces.',
    context: 'Frontend development and UI implementation',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'backend-dev',
    name: 'API Engineer',
    description: 'Backend Developer - Implements APIs and database solutions',
    model: 'openai/gpt-3.5-turbo',
    systemPrompt: 'You are a backend developer focusing on API development and database optimization.',
    context: 'Backend development and databases',
    temperature: 0.6,
    maxTokens: 2048,
    tools: [initialTools[2]], // Code Executor
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'qa-engineer',
    name: 'Quality Assurance',
    description: 'QA Engineer - Ensures code quality and comprehensive testing',
    model: 'anthropic/claude-3-sonnet',
    systemPrompt: 'You are a QA engineer focused on maintaining high code quality and comprehensive testing.',
    context: 'Quality assurance and testing',
    temperature: 0.5,
    maxTokens: 2048,
    tools: [initialTools[1], initialTools[2]], // Text Analysis and Code Executor
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'data-scientist',
    name: 'Data Analyst',
    description: 'Data Scientist - Analyzes data and implements ML solutions',
    model: 'openai/gpt-4',
    systemPrompt: 'You are a data scientist specializing in data analysis and machine learning implementations.',
    context: 'Data analysis and machine learning',
    temperature: 0.6,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analysis
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'ux-researcher',
    name: 'UX Researcher',
    description: 'UX Researcher - Conducts user research and provides UX insights',
    model: 'anthropic/claude-2',
    systemPrompt: 'You are a UX researcher focused on understanding user needs and improving user experience.',
    context: 'User research and UX design',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analysis
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  },
  {
    id: 'technical-writer',
    name: 'Documentation Specialist',
    description: 'Technical Writer - Creates and maintains project documentation',
    model: 'openai/gpt-3.5-turbo',
    systemPrompt: 'You are a technical writer specializing in creating clear and comprehensive documentation.',
    context: 'Technical documentation and content creation',
    temperature: 0.6,
    maxTokens: 2048,
    tools: [initialTools[0], initialTools[1]], // Web Search and Text Analysis
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: []
  }
];
