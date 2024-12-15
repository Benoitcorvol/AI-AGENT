import { ProviderConfig } from '../../types/models';

export const ollamaProvider: ProviderConfig = {
  name: 'Ollama',
  requiresApiKey: false,
  requiresBaseUrl: true,
  defaultBaseUrl: 'http://localhost:11434',
  description: 'Run large language models locally',
  website: 'https://ollama.ai',
  models: [
    {
      id: 'llama2',
      name: 'Llama 2',
      provider: 'ollama',
      contextWindow: 4096,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    },
    {
      id: 'codellama',
      name: 'CodeLlama',
      provider: 'ollama',
      contextWindow: 4096,
      maxTokens: 2048,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'coding']
    },
    {
      id: 'mistral',
      name: 'Mistral',
      provider: 'ollama',
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    },
    {
      id: 'mixtral',
      name: 'Mixtral 8x7B',
      provider: 'ollama',
      contextWindow: 32768,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis', 'coding']
    },
    {
      id: 'neural-chat',
      name: 'Neural Chat',
      provider: 'ollama',
      contextWindow: 8192,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      capabilities: ['text-generation', 'analysis']
    }
  ]
};