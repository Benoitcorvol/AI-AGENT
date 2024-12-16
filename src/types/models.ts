export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'xai' | 'meta' | 'ollama' | 'openrouter';
export type ModelCapability = 'text-generation' | 'chat' | 'embeddings' | 'image-understanding';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  apiKey?: string;
  baseUrl?: string;
  contextWindow: number;
  maxTokens: number;
  defaultTemperature: number;
  capabilities: ModelCapability[];
  isPreview?: boolean;
  releaseDate?: string;
}

export interface ProviderConfig {
  name: string;
  requiresApiKey: boolean;
  requiresBaseUrl: boolean;
  defaultBaseUrl?: string;
  models: ModelConfig[];
  description?: string;
  website?: string;
}
