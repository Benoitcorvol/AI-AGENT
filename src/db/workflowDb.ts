import { Workflow } from '../types/workflow';
import { getStore, handleStoreError } from './dbSetup';

export const workflowDb = {
  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    try {
      const store = await getStore('workflows', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(workflow);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return workflow;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async updateWorkflow(workflow: Workflow): Promise<Workflow> {
    try {
      const store = await getStore('workflows', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(workflow);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      return workflow;
    } catch (error) {
      handleStoreError(error);
    }
  },

  async deleteWorkflow(id: string): Promise<void> {
    try {
      const store = await getStore('workflows', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      handleStoreError(error);
    }
  },

  async getAllWorkflows(): Promise<Workflow[]> {
    try {
      const store = await getStore('workflows');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      });
    } catch (error) {
      handleStoreError(error);
    }
  }
};