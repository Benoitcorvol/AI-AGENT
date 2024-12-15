import { Tool } from '../../types/agent';

export const initialTools: Tool[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    parameters: [{
      name: 'query',
      type: 'string',
      description: 'Search query',
      required: true
    }, {
      name: 'numResults',
      type: 'number',
      description: 'Number of results',
      required: false
    }]
  },
  {
    id: 'text-analyzer',
    name: 'Text Analyzer',
    description: 'Analyze text content and extract insights',
    parameters: [{
      name: 'text',
      type: 'string',
      description: 'Text to analyze',
      required: true
    }, {
      name: 'type',
      type: 'string',
      description: 'Analysis type',
      required: true
    }]
  },
  {
    id: 'code-executor',
    name: 'Code Executor',
    description: 'Execute code in various languages',
    parameters: [{
      name: 'code',
      type: 'string',
      description: 'Code to execute',
      required: true
    }, {
      name: 'language',
      type: 'string',
      description: 'Programming language',
      required: true
    }]
  }
];