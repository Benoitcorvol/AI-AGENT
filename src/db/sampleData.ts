import { Agent, Tool } from '../types/agent';

export const sampleTools: Tool[] = [
  {
    id: 'search-tool',
    name: 'Web Search',
    description: 'Search the web for information using Google Custom Search API',
    parameters: [{
      name: 'query',
      type: 'string',
      description: 'The search query',
      required: true
    }, {
      name: 'numResults',
      type: 'number',
      description: 'Number of results to return',
      required: false
    }]
  },
  // ... other tools from database.ts
];

export const sampleAgents: Agent[] = [
  {
    id: 'researcher',
    name: 'Research Assistant',
    description: 'Performs web research and summarizes findings',
    model: 'gpt-4',
    systemPrompt: 'You are a research assistant focused on gathering accurate information.',
    context: 'Specialized in web research and data analysis',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [sampleTools[0]], // Web Search tool
    connections: [],
    role: 'worker',
    capabilities: {
      canCreateSubAgents: false,
      canDelegateWork: false,
      canAccessOtherAgents: false
    },
    subAgents: []
  },
  // ... other agents from database.ts
];