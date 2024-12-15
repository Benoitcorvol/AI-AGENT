import { ProviderConfig } from '../../types/models';

export const googleProvider: ProviderConfig = {
  name: 'Google AI',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'Advanced AI models from Google, including the Gemini series',
  website: 'https://ai.google.dev',
  models: [
    {
      id: 'gemini-2.0',
      name: 'Gemini 2.0',
      provider: 'google',
      contextWindow: 1000000,
      maxTokens: 8192,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision', 'audio', 'multimodal'],
      releaseDate: '2024-09-01'
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      contextWindow: 1000000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision']
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      contextWindow: 1000000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding']
    },
    {
      id: 'gemma-7b',
      name: 'Gemma 7B',
      provider: 'google',
      contextWindow: 8192,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis'],
      releaseDate: '2024-02-21'
    },
    {
      id: 'gemma-2b',
      name: 'Gemma 2B',
      provider: 'google',
      contextWindow: 8192,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis'],
      releaseDate: '2024-02-21'
    }
  ]
};