import { ProviderConfig } from '../../types/models';

export const openaiProvider: ProviderConfig = {
  name: 'OpenAI',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'State-of-the-art language models from OpenAI',
  website: 'https://openai.com',
  models: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision'],
      releaseDate: '2024-05-13'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding'],
      releaseDate: '2024-05-13'
    },
    {
      id: 'o1',
      name: 'O1',
      provider: 'openai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision', 'audio'],
      releaseDate: '2024-12-05'
    },
    {
      id: 'o1-pro',
      name: 'O1 Pro',
      provider: 'openai',
      contextWindow: 128000,
      maxTokens: 8192,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision', 'audio', 'image-generation'],
      releaseDate: '2024-12-05'
    },
    {
      id: 'o1-preview',
      name: 'O1 Preview',
      provider: 'openai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision'],
      isPreview: true
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision']
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding']
    },
    {
      id: 'gpt-3.5-turbo-0125',
      name: 'GPT-3.5 Turbo (0125)',
      provider: 'openai',
      contextWindow: 16384,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    }
  ]
};