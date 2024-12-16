import { ProviderConfig } from '../../types/models';

export const openrouterProvider: ProviderConfig = {
  name: 'openrouter',
  requiresApiKey: true,
  requiresBaseUrl: false,
  defaultBaseUrl: 'https://openrouter.ai/api/v1',
  models: [
    {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT 3.5 Turbo',
      provider: 'openrouter' as const,
      contextWindow: 4096,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'openai/gpt-4',
      name: 'GPT 4',
      provider: 'openrouter' as const,
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'anthropic/claude-2',
      name: 'Claude 2',
      provider: 'openrouter' as const,
      contextWindow: 100000,
      maxTokens: 8000,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'google/palm-2-chat-bison',
      name: 'PaLM 2 Chat Bison',
      provider: 'openrouter' as const,
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'mistralai/mistral-7b-instruct',
      name: 'Mistral 7B Instruct',
      provider: 'openrouter' as const,
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'meta/llama-2-70b-chat',
      name: 'Llama 2 70B Chat',
      provider: 'openrouter' as const,
      contextWindow: 4096,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'google/gemini-pro',
      name: 'Gemini Pro',
      provider: 'openrouter' as const,
      contextWindow: 30720,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'google/gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'openrouter' as const,
      contextWindow: 30720,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'image-understanding']
    },
    {
      id: 'meta/llama-3-70b-chat',
      name: 'Llama 3 70B Chat',
      provider: 'openrouter' as const,
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'openrouter' as const,
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'anthropic/claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'openrouter' as const,
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'openrouter' as const,
      contextWindow: 200000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    }
  ]
};
