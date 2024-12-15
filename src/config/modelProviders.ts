import { ProviderConfig } from '../types/models';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';
import { mistralProvider } from './providers/mistral';
import { xaiProvider } from './providers/xai';
import { metaProvider } from './providers/meta';
import { ollamaProvider } from './providers/ollama';
import { openrouterProvider } from './providers/openrouter';

export const modelProviders: ProviderConfig[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  mistralProvider,
  xaiProvider,
  metaProvider,
  ollamaProvider,
  openrouterProvider
];
