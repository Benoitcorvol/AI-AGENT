import { getStore } from './dbSetup';

type ModelConfig = {
  provider: string;
  apiKey: string;
  baseUrl: string | null;
};

export const modelDb = {
  saveModelConfig: async (provider: string, apiKey: string, baseUrl?: string) => {
    const store = await getStore('model_configs', 'readwrite');
    const request = store.put({ provider, apiKey, baseUrl: baseUrl || null });
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getModelConfig: async (provider: string) => {
    const store = await getStore('model_configs', 'readonly');
    const request = store.get(provider);
    return new Promise<ModelConfig | undefined>((resolve, reject) => {
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
    return new Promise<ModelConfig[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};
