import { ProviderConfig } from '../../types/models';

export const metaProvider: ProviderConfig = {
  name: 'Meta AI',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'Open source models from Meta, including the Llama series',
  website: 'https://ai.meta.com',
  models: [
    {
      id: 'llama-3.3-70b',
      name: 'Llama 3.3 70B',
      provider: 'meta',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-09-15'
    },
    {
      id: 'llama-3.2-90b-vision',
      name: 'Llama 3.2 90B Vision',
      provider: 'meta',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision'],
      releaseDate: '2024-08-01'
    },
    {
      id: 'llama-3.1-405b',
      name: 'Llama 3.1 405B',
      provider: 'meta',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-07-01'
    },
    {
      id: 'llama-3-405b',
      name: 'Llama 3 405B',
      provider: 'meta',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-06-23'
    }
  ]
};