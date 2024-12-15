import { ProviderConfig } from '../../types/models';

export const anthropicProvider: ProviderConfig = {
  name: 'Anthropic',
  requiresApiKey: true,
  requiresBaseUrl: false,
  description: 'Advanced AI models from Anthropic, including the Claude series',
  website: 'https://anthropic.com',
  models: [
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision'],
      releaseDate: '2024-10-22'
    },
    {
      id: 'claude-3.5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'vision'],
      releaseDate: '2024-11-04'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision', 'multimodal']
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding', 'vision']
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'vision']
    }
  ]
};