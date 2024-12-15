import { Tool } from '../types/agent';
import { getStore, handleStoreError } from './dbSetup';
import { initialTools } from './initialData/tools';

export const toolDb = {
  async createTool(tool: Tool): Promise<Tool> {
    try {
      const store = await getStore('tools', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(tool);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return tool;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async updateTool(tool: Tool): Promise<Tool> {
    try {
      const store = await getStore('tools', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(tool);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return tool;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async deleteTool(id: string): Promise<void> {
    try {
      const store = await getStore('tools', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      handleStoreError(error);
    }
  },

  async getAllTools(): Promise<Tool[]> {
    try {
      const store = await getStore('tools');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const tools = request.result || initialTools;
          console.log('Loaded tools:', tools);
          resolve(tools);
        };
      });
    } catch (error) {
      console.error('Failed to load tools:', error);
      return initialTools;
    }
  }
};