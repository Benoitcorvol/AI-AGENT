import { initialTools } from './initialData/tools';
import { initialAgents } from './initialData/agents';
import { modelDb } from './modelDb';

const DB_NAME = 'ai_agents_db';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

export type StoreNames = 'agents' | 'tools' | 'workflows' | 'model_configs' | 'memory_nodes' | 'memory_edges';

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
      const oldVersion = event.oldVersion;

      // Create base stores if they don't exist
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('model_configs')) {
          console.log('Creating model_configs store');
          db.createObjectStore('model_configs', { keyPath: 'provider' });
        }

        if (!db.objectStoreNames.contains('tools')) {
          console.log('Creating tools store');
          const toolStore = db.createObjectStore('tools', { keyPath: 'id' });
          
          // Add initial tools
          initialTools.forEach(tool => {
            toolStore.add(tool);
          });
        }

        if (!db.objectStoreNames.contains('agents')) {
          console.log('Creating agents store');
          const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
          agentStore.createIndex('role', 'role');
          agentStore.createIndex('parentId', 'parentId');
        }

        if (!db.objectStoreNames.contains('workflows')) {
          console.log('Creating workflows store');
          const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' });
          workflowStore.createIndex('type', 'type');
          workflowStore.createIndex('managerId', 'managerId');
        }
      }

      // Add memory stores in version 2
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('memory_nodes')) {
          console.log('Creating memory_nodes store');
          const memoryNodeStore = db.createObjectStore('memory_nodes', { keyPath: 'id' });
          memoryNodeStore.createIndex('agentId', 'agentId');
          memoryNodeStore.createIndex('type', 'type');
          memoryNodeStore.createIndex('timestamp', 'metadata.timestamp');
        }

        if (!db.objectStoreNames.contains('memory_edges')) {
          console.log('Creating memory_edges store');
          const memoryEdgeStore = db.createObjectStore('memory_edges', { keyPath: 'id' });
          memoryEdgeStore.createIndex('sourceId', 'sourceId');
          memoryEdgeStore.createIndex('targetId', 'targetId');
          memoryEdgeStore.createIndex('type', 'type');
        }
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

export function handleStoreError(error: Error | DOMException): never {
  console.error('Database operation failed:', error);
  throw new Error(`Database operation failed: ${error.message}`);
}

export async function initializeDB(): Promise<void> {
  const db = await openDB();
  
  // Initialize stores in correct order
  const modelConfigStore = db.transaction('model_configs', 'readwrite').objectStore('model_configs');
  const toolStore = db.transaction('tools', 'readwrite').objectStore('tools');
  const agentStore = db.transaction('agents', 'readwrite').objectStore('agents');
  
  // Check if stores are empty
  const [modelConfigCount, toolCount, agentCount] = await Promise.all([
    new Promise<number>((resolve) => {
      const request = modelConfigStore.count();
      request.onsuccess = () => resolve(request.result);
    }),
    new Promise<number>((resolve) => {
      const request = toolStore.count();
      request.onsuccess = () => resolve(request.result);
    }),
    new Promise<number>((resolve) => {
      const request = agentStore.count();
      request.onsuccess = () => resolve(request.result);
    })
  ]);

  // Initialize in order: models -> tools -> agents
  if (modelConfigCount === 0) {
    console.log('Initializing model configurations...');
    await modelDb.initializeProviders();
  }
  
  if (toolCount === 0) {
    console.log('Initializing tools...');
    for (const tool of initialTools) {
      toolStore.add(tool);
    }
  }
  
  // Only add agents after ensuring models are configured
  const modelConfigs = await modelDb.getAllModelConfigs();
  if (agentCount === 0 && modelConfigs.length > 0) {
    console.log('Initializing agents...');
    for (const agent of initialAgents) {
      agentStore.add(agent);
    }
  }
}

// Call initialization when the application starts
initializeDB().catch(console.error);
