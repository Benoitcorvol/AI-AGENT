import { Agent } from '../types/agent';
import { getStore, handleStoreError } from './dbSetup';
import { initialAgents } from './initialData/agents';

export const agentDb = {
  async createAgent(agent: Agent): Promise<Agent> {
    try {
      const store = await getStore('agents', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(agent);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return agent;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async updateAgent(agent: Agent): Promise<Agent> {
    try {
      const store = await getStore('agents', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(agent);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return agent;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async deleteAgent(id: string): Promise<void> {
    try {
      const store = await getStore('agents', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      handleStoreError(error);
    }
  },

  async getAllAgents(): Promise<Agent[]> {
    try {
      const store = await getStore('agents');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          // Only use request.result, don't fallback to initialAgents here
          const agents = request.result;
          console.log('Loaded agents:', agents);
          resolve(agents);
        };
      });
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Only use initialAgents as fallback when there's an actual error
      return initialAgents;
    }
  }
};
