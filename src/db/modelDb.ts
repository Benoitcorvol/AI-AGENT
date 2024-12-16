import { getStore } from './dbSetup';
import { ModelConfig } from '../types/models';
import { modelProviders } from '../config/modelProviders';

export interface StoredModelConfig {
  provider: string;
  apiKey: string;
  baseUrl: string | null;
  models: ModelConfig[];
}

export const modelDb = {
  saveModelConfig: async (provider: string, apiKey: string, baseUrl?: string) => {
    const store = await getStore('model_configs', 'readwrite');
    const providerConfig = modelProviders.find(p => p.name === provider);
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const config: StoredModelConfig = {
      provider,
      apiKey,
      baseUrl: baseUrl || null,
      models: providerConfig.models
    };
    
    const request = store.put(config);
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getModelConfig: async (provider: string) => {
    const store = await getStore('model_configs', 'readonly');
    const request = store.get(provider);
    return new Promise<StoredModelConfig | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  deleteModelConfig: async (provider: string) => {
    const store = await getStore('model_configs', 'readwrite');
    const request = store.delete(provider);
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getAllModelConfigs: async () => {
    const store = await getStore('model_configs', 'readonly');
    const request = store.getAll();
    return new Promise<StoredModelConfig[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  initializeProviders: async () => {
    const store = await getStore('model_configs', 'readwrite');
    
    // Initialize each provider with empty credentials but with their models
    for (const provider of modelProviders) {
      const config: StoredModelConfig = {
        provider: provider.name,
        apiKey: '',
        baseUrl: provider.defaultBaseUrl || null,
        models: provider.models
      };
      store.put(config);
    }
  }
};
