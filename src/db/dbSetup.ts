import { initialTools } from './initialData/tools';
import { initialAgents } from './initialData/agents';

const DB_NAME = 'ai_agents_db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

export type StoreNames = 'agents' | 'tools' | 'workflows' | 'model_configs';

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    console.log('Opening database...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      dbInitPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('Database opened successfully');
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Database upgrade needed');
      const db = request.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('agents')) {
        console.log('Creating agents store');
        const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
        agentStore.createIndex('role', 'role');
        agentStore.createIndex('parentId', 'parentId');

        // Add initial agents
        initialAgents.forEach(agent => {
          agentStore.add(agent);
        });
      }

      if (!db.objectStoreNames.contains('tools')) {
        console.log('Creating tools store');
        const toolStore = db.createObjectStore('tools', { keyPath: 'id' });
        
        // Add initial tools
        initialTools.forEach(tool => {
          toolStore.add(tool);
        });
      }

      if (!db.objectStoreNames.contains('workflows')) {
        console.log('Creating workflows store');
        const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' });
        workflowStore.createIndex('type', 'type');
        workflowStore.createIndex('managerId', 'managerId');
      }

      if (!db.objectStoreNames.contains('model_configs')) {
        console.log('Creating model_configs store');
        const modelConfigStore = db.createObjectStore('model_configs', { keyPath: 'provider' });
      }
    };
  });

  return dbInitPromise;
}

export async function getStore(
  storeName: StoreNames,
  mode: IDBTransactionMode = 'readonly'
): Promise<IDBObjectStore> {
  const db = await openDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

export function handleStoreError(error: any): never {
  console.error('Database operation failed:', error);
  throw new Error(`Database operation failed: ${error.message}`);
}

export async function initializeDB(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(['agents', 'tools', 'workflows', 'model_configs'], 'readwrite');
  
  // Initialize stores if empty
  const toolStore = transaction.objectStore('tools');
  const agentStore = transaction.objectStore('agents');
  
  const toolCount = await new Promise<number>((resolve) => {
    const request = toolStore.count();
    request.onsuccess = () => resolve(request.result);
  });
  
  const agentCount = await new Promise<number>((resolve) => {
    const request = agentStore.count();
    request.onsuccess = () => resolve(request.result);
  });
  
  if (toolCount === 0) {
    for (const tool of initialTools) {
      toolStore.add(tool);
    }
  }
  
  if (agentCount === 0) {
    for (const agent of initialAgents) {
      agentStore.add(agent);
    }
  }
}

// Call initialization when the application starts
initializeDB().catch(console.error);
