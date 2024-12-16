import React from 'react';
import { X, Brain } from 'lucide-react';
import { Agent, ModelType, AgentRole, Tool } from '../types/agent';
import { roleCapabilities, roleDescriptions } from '../utils/agentRoles';
import { ToolSelector } from './ToolSelector';
import { toolDb } from '../db/database';
import { modelDb } from '../db/modelDb';
import { ModelConfig } from '../types/models';
import { MemoryBrowser } from './MemoryBrowser';

interface AgentFormProps {
  onSubmit: (agent: Partial<Agent>) => void;
  onClose: () => void;
  availableAgents: Agent[];
  initialData?: Agent;
}

const ROLE_OPTIONS: AgentRole[] = ['worker', 'coordinator', 'manager'];

export function AgentForm({ onSubmit, onClose, initialData, availableAgents }: AgentFormProps) {
  const [availableTools, setAvailableTools] = React.useState<Tool[]>([]);
  const [configuredModels, setConfiguredModels] = React.useState<ModelConfig[]>([]);
  const [showMemoryBrowser, setShowMemoryBrowser] = React.useState(false);
  
  React.useEffect(() => {
    const loadTools = async () => {
      try {
        const tools = await toolDb.getAllTools();
        setAvailableTools(tools);
      } catch (error) {
        console.error('Failed to load tools:', error);
      }
    };
    loadTools();
  }, []);

  React.useEffect(() => {
    const loadConfiguredModels = async () => {
      const models: ModelConfig[] = [];
      const configs = await modelDb.getAllModelConfigs();
      
      for (const config of configs) {
        if (config.apiKey) {
          // Only add models from providers that have an API key configured
          models.push(...config.models);
        }
      }
      setConfiguredModels(models);
    };
    loadConfiguredModels();
  }, []);

  const [formData, setFormData] = React.useState<Partial<Agent>>({
    name: '',
    description: '',
    model: configuredModels[0]?.id || '',
    systemPrompt: '',
    context: '',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [],
    connections: [],
    role: 'worker',
    capabilities: roleCapabilities.worker,
    subAgents: [],
    ...initialData,
  });

  const handleRoleChange = (role: AgentRole) => {
    setFormData({
      ...formData,
      role,
      capabilities: roleCapabilities[role]
    });
  };

  const handleSubAgentChange = (selectedIds: string[]) => {
    setFormData({
      ...formData,
      subAgents: selectedIds
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
    });
  };

  // Group models by provider and ensure unique keys
  const modelsByProvider = configuredModels.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, ModelConfig[]>);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Agent' : 'Create New Agent'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <form id="agent-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Model
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value as ModelType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                {Object.entries(modelsByProvider).map(([provider, models], index) => (
                  <optgroup key={`${provider}-${index}`} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
                    {models.map((model) => (
                      <option key={`${model.id}-${index}`} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {configuredModels.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  No models configured. Please configure models in the Model Manager.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as AgentRole)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                required
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {roleDescriptions[formData.role as AgentRole]}
              </p>
            </div>

            {(formData.role === 'manager' || formData.role === 'coordinator') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-agents
                </label>
                <div className="space-y-2 border rounded p-2">
                  {availableAgents
                    .filter(agent => agent.id !== initialData?.id)
                    .map(agent => (
                      <label key={agent.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.subAgents?.includes(agent.id)}
                          onChange={(e) => {
                            const newSubAgents = e.target.checked
                              ? [...(formData.subAgents || []), agent.id]
                              : (formData.subAgents || []).filter(id => id !== agent.id);
                            handleSubAgentChange(newSubAgents);
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{agent.name}</span>
                        <span className="text-xs text-gray-500">({agent.role})</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <ToolSelector
              selectedTools={formData.tools || []}
              availableTools={availableTools}
              onToolsChange={(tools) => setFormData({ ...formData, tools })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 h-32 font-mono"
                placeholder="You are a helpful AI assistant..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 h-32 font-mono"
                placeholder="Additional context or knowledge..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max="32000"
                  step="1"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {initialData && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowMemoryBrowser(true)}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Brain className="w-5 h-5" />
                  Manage Agent Memory
                </button>
              </div>
            )}
          </form>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="agent-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {initialData ? 'Update Agent' : 'Create Agent'}
          </button>
        </div>
      </div>

      {/* Memory Browser Modal */}
      {showMemoryBrowser && initialData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Agent Memory</h3>
              <button
                onClick={() => setShowMemoryBrowser(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MemoryBrowser agentId={initialData.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
