import React from 'react';
import { Trash, Settings } from 'lucide-react';
import { Agent } from '../../types/agent';
import { WorkflowStep } from '../../types/workflow';

interface WorkflowStepComponentProps {
  step: WorkflowStep;
  agents: Agent[];
  onUpdateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  onDelete: () => void;
}

export function WorkflowStepComponent({ step, agents, onUpdateStep, onDelete }: WorkflowStepComponentProps) {
  const selectedAgent = agents.find(a => a.id === step.agentId);
  const selectedTool = selectedAgent?.tools.find(t => t.id === step.toolId);
  
  const availableAgents = agents.filter(agent => {
    // Show all agents initially
    if (!selectedAgent) return true;
    
    // For worker steps, show only worker agents
    if (selectedAgent.role === 'worker') {
      return agent.role === 'worker';
    }
    
    // For manager/coordinator steps, show their assigned workers and self
    if (selectedAgent.role === 'manager' || selectedAgent.role === 'coordinator') {
      return agent.id === selectedAgent.id || 
             agent.parentId === selectedAgent.id ||
             agent.role === 'worker';
    }
    
    return true;
  });

  const subAgents = selectedAgent 
    ? agents.filter(agent => agent.parentId === selectedAgent.id)
    : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="space-y-2 flex-1">
            <input
              type="text"
              value={step.name || ''}
              onChange={(e) => onUpdateStep(step.id, { name: e.target.value })}
              placeholder="Step Name"
              className="w-full text-lg font-medium bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-400 focus:outline-none"
            />
            <textarea
              value={step.description || ''}
              onChange={(e) => onUpdateStep(step.id, { description: e.target.value })}
              placeholder="Describe what this step does..."
              className="w-full text-sm text-gray-600 bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-400 resize-none focus:outline-none"
              rows={2}
            />
          </div>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={step.agentId}
              onChange={(e) => onUpdateStep(step.id, { 
                agentId: e.target.value,
                toolId: '',
                parameters: {},
                subAgents: []
              })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select an agent</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role === 'manager' ? 'Manager' : 
                    agent.role === 'coordinator' ? 'Coordinator' : 'Worker'})
                </option>
              ))}
            </select>
            {(selectedAgent?.role === 'manager' || selectedAgent?.role === 'coordinator') && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-agents
                </label>
                <div className="text-sm text-gray-600">
                  {subAgents.length === 0 ? (
                    <p className="text-gray-500 italic">No sub-agents assigned</p>
                  ) : (
                    subAgents.map(subAgent => (
                      <div key={subAgent.id} className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        {subAgent.name} ({subAgent.role === 'manager' ? 'Manager' : 
                          subAgent.role === 'coordinator' ? 'Coordinator' : 'Worker'})
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedAgent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool
              </label>
              <select
                value={step.toolId}
                onChange={(e) => onUpdateStep(step.id, { toolId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a tool</option>
                {selectedAgent.tools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTool && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Parameters
                </label>
                <button
                  onClick={() => {/* TODO: Implement parameter settings */}}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {selectedTool.parameters.map(param => (
                  <div key={param.name} className="flex items-start gap-2">
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      placeholder={param.name}
                      value={step.parameters[param.name] || ''}
                      onChange={(e) => onUpdateStep(step.id, {
                        parameters: {
                          ...step.parameters,
                          [param.name]: e.target.value
                        }
                      })}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {param.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}