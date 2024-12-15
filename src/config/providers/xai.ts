import { ProviderConfig } from '../../types/models';

export const xaiProvider: ProviderConfig = {
  name: 'xAI',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'Advanced AI models from xAI, including the Grok series',
  website: 'https://x.ai',
  models: [
    {
      id: 'grok-2',
      name: 'Grok-2',
      provider: 'xai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision', 'image-generation'],
      releaseDate: '2024-08-20'
    },
    {
      id: 'grok-2-mini',
      name: 'Grok-2 Mini',
      provider: 'xai',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-08-20'
    },
    {
      id: 'grok-1.5',
      name: 'Grok-1.5',
      provider: 'xai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-03-29'
    },
    {
      id: 'grok-1.5-vision',
      name: 'Grok-1.5 Vision',
      provider: 'xai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'vision'],
      releaseDate: '2024-04-12'
    },
    {
      id: 'grok-1',
      name: 'Grok-1',
      provider: 'xai',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    }
  ]
};