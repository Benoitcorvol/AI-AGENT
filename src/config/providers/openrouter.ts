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
      id: 'xai/grok-2-vision-1212',
      name: 'Grok 2 Vision 1212',
      provider: 'openrouter' as const,
      contextWindow: 33000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'xai/grok-2-1212',
      name: 'Grok 2 1212',
      provider: 'openrouter' as const,
      contextWindow: 131000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'cohere/command-r7b-12-2024',
      name: 'Command R7B (12-2024)',
      provider: 'openrouter' as const,
      contextWindow: 128000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'google/gemini-2-0-flash-experimental',
      name: 'Gemini 2.0 Flash Experimental (free)',
      provider: 'openrouter' as const,
      contextWindow: 1050000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'google/gemini-experimental-1206',
      name: 'Gemini Experimental 1206 (free)',
      provider: 'openrouter' as const,
      contextWindow: 2100000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'meta/llama-3-3-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      provider: 'openrouter' as const,
      contextWindow: 131000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'amazon/nova-lite-1-0',
      name: 'Amazon: Nova Lite 1.0',
      provider: 'openrouter' as const,
      contextWindow: 300000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
     {
      id: 'amazon/nova-micro-1-0',
      name: 'Amazon: Nova Micro 1.0',
      provider: 'openrouter' as const,
      contextWindow: 128000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'amazon/nova-pro-1-0',
      name: 'Amazon: Nova Pro 1.0',
      provider: 'openrouter' as const,
      contextWindow: 300000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
    {
      id: 'qwen/qwq-32b-preview',
      name: 'Qwen: QwQ 32B Preview',
      provider: 'openrouter' as const,
       contextWindow: 33000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    },
     {
      id: 'google/gemini-experimental-1121',
      name: 'Google: Gemini Experimental 1121 (free)',
      provider: 'openrouter' as const,
      contextWindow: 41000,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation']
    }
  ]
};
