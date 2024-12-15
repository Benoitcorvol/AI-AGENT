import { ProviderConfig } from '../../types/models';

export const mistralProvider: ProviderConfig = {
  name: 'Mistral AI',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'High-performance AI models from Mistral AI',
  website: 'https://mistral.ai',
  models: [
    {
      id: 'mistral-large-2',
      name: 'Mistral Large 2',
      provider: 'mistral',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-07-24'
    },
    {
      id: 'mixtral-8x22b',
      name: 'Mixtral 8x22B',
      provider: 'mistral',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-04-10'
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'mistral',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-02-26'
    },
    {
      id: 'mistral-medium',
      name: 'Mistral Medium',
      provider: 'mistral',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    },
    {
      id: 'mistral-small',
      name: 'Mistral Small',
      provider: 'mistral',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    }
  ]
};