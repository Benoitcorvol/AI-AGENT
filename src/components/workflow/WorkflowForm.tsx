import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Agent } from '../../types/agent';
import { Workflow } from '../../types/workflow';

interface WorkflowFormProps {
  agents: Agent[];
  onSubmit: (workflow: Workflow) => void;
  onEditAgent: (agent: Agent) => void;
  onClose: () => void;
  initialData?: Workflow;
}

export function WorkflowForm({ agents, onSubmit, onEditAgent, onClose, initialData }: WorkflowFormProps) {
  const [formData, setFormData] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    type: 'sequential',
    steps: [],
    managerId: '',
    workerIds: [],
    config: {
      requireApproval: false,
      autoRetry: {
        maxAttempts: 3,
        delayMs: 1000
      },
      timeout: 30000
    },
    ...initialData
  });

  const managerAgents = agents.filter(agent => 
    agent.role === 'manager' || agent.role === 'coordinator'
  );
  
  const workerAgents = agents.filter(agent => 
    agent.role === 'worker'
  );
  
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(formData.workerIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure hierarchical workflows have a manager agent
    if (formData.type === 'hierarchical' && !formData.managerId) {
      alert('Please select a manager agent for hierarchical workflow');
      return;
    }

    onSubmit({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      workerIds: selectedWorkers,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: formData.steps || [],
    } as Workflow);
  };

  const handleManagerChange = (managerId: string) => {
    // Clear selected workers when manager changes
    setSelectedWorkers([]);
    setFormData(prev => ({
      ...prev,
      managerId,
      workerIds: []
    }));
  };

  const handleWorkerSelection = (workerId: string, checked: boolean) => {
    const worker = agents.find(a => a.id === workerId);
    if (!worker) return;

    // Update selected workers
    setSelectedWorkers(prev => 
      checked ? [...prev, workerId] : prev.filter(id => id !== workerId)
    );

    // Update form data
    setFormData(prev => ({
      ...prev,
      workerIds: checked 
        ? [...(prev.workerIds || []), workerId]
        : (prev.workerIds || []).filter(id => id !== workerId)
    }));

    // If this is a manager agent, update their subAgents list
    if (formData.managerId) {
      const manager = agents.find(a => a.id === formData.managerId);
      if (manager) {
        onEditAgent({
          ...manager,
          subAgents: checked
            ? [...new Set([...manager.subAgents, workerId])]
            : manager.subAgents.filter(id => id !== workerId)
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value as Workflow['type'],
                managerId: e.target.value === 'hierarchical' ? formData.managerId : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="sequential">Sequential</option>
              <option value="parallel">Parallel</option>
              <option value="hierarchical">Hierarchical</option>
            </select>
          </div>

          {formData.type === 'hierarchical' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Manager Agent
              </label>
              <div className="space-y-4">
                <select
                  value={formData.managerId || ''}
                  onChange={(e) => handleManagerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a manager agent</option>
                  {managerAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role})
                    </option>
                  ))}
                </select>

                {formData.managerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Worker Agents
                    </label>
                    <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                      {workerAgents.map(agent => (
                        <label key={agent.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedWorkers.includes(agent.id)}
                            onChange={(e) => handleWorkerSelection(agent.id, e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{agent.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Manager agents can coordinate and delegate tasks to worker agents
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {initialData ? 'Update Workflow' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}