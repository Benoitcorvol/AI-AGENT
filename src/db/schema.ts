import { getStore } from './dbSetup';

type StoreNames = 'agents' | 'tools' | 'workflows' | 'model_configs';
type ModelConfig = { provider: string; apiKey: string; baseUrl: string | null };

// Export functions to interact with IndexedDB
export const db = {
  prepare: (sql: string) => {
    // This is a compatibility layer to make the transition from SQLite easier
    // It returns an object that mimics SQLite's prepared statements
    // but actually uses IndexedDB under the hood
    return {
      run: async (...params: unknown[]) => {
        if (sql.includes('INSERT OR REPLACE INTO model_configs')) {
          const [provider, apiKey, baseUrl] = params as [string, string, string | null];
          const store = await getStore('model_configs', 'readwrite');
          const request = store.put({ provider, apiKey, baseUrl });
          return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(undefined);
            request.onerror = () => reject(request.error);
          });
        } else if (sql.includes('DELETE FROM model_configs')) {
          const [provider] = params as [string];
          const store = await getStore('model_configs', 'readwrite');
          const request = store.delete(provider);
          return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(undefined);
            request.onerror = () => reject(request.error);
          });
        }
      },
      get: async (...params: unknown[]) => {
        if (sql.includes('SELECT * FROM model_configs WHERE provider')) {
          const [provider] = params as [string];
          const store = await getStore('model_configs', 'readonly');
          const request = store.get(provider);
          return new Promise<ModelConfig | undefined>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
        return undefined;
      },
      all: async () => {
        if (sql.includes('SELECT * FROM model_configs')) {
          const store = await getStore('model_configs', 'readonly');
          const request = store.getAll();
          return new Promise<ModelConfig[]>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
        return [];
      }
    };
  },
  exec: async (sql: string) => {
    // This is just a no-op since we're using IndexedDB
    // The table creation is handled in dbSetup.ts
    console.log('Executing SQL:', sql);
  }
};
