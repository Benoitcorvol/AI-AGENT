import React, { useState } from 'react';
import { ArrowRight, Plus, Settings, X } from 'lucide-react';
import { Agent, Workflow, WorkflowStep } from '../types/agent';
import { WorkflowStep as WorkflowStepComponent } from './WorkflowStep';

interface WorkflowBuilderProps {
  agents: Agent[];
  workflow: Workflow;
  onUpdateWorkflow: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ agents, workflow, onUpdateWorkflow }: WorkflowBuilderProps) {
  const [workflowType, setWorkflowType] = useState<'sequential' | 'hierarchical' | 'parallel'>(
    workflow.type || 'sequential'
  );
  const [showSettings, setShowSettings] = useState(false);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${workflow.steps.length + 1}`,
      description: 'Describe what this step does...',
      agentId: agents[0]?.id || '',
      toolId: agents[0]?.tools[0]?.id || '',
      parameters: {},
      validation: {
        required: false,
        rules: []
      },
      retryStrategy: {
        maxAttempts: workflow.config?.autoRetry?.maxAttempts || 3,
        delayMs: workflow.config?.autoRetry?.delayMs || 1000
      }
    };
    
    onUpdateWorkflow({
      ...workflow,
      updatedAt: new Date().toISOString(),
      type: workflowType,
      config: {
        ...workflow.config,
        maxConcurrentSteps: workflowType === 'parallel' ? 3 : undefined,
      },
      steps: [...workflow.steps, newStep],
    });
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    onUpdateWorkflow({
      ...workflow,
      steps: workflow.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const handleTypeChange = (type: 'sequential' | 'hierarchical' | 'parallel') => {
    setWorkflowType(type);
    onUpdateWorkflow({
      ...workflow,
      type,
      config: {
        ...workflow.config,
        maxConcurrentSteps: type === 'parallel' ? 3 : undefined,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Workflow Builder</h2>
          <p className="text-sm text-gray-500 mt-1">Design your agent workflow</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => handleTypeChange('sequential')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                workflowType === 'sequential'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              Sequential
            </button>
            <button
              onClick={() => handleTypeChange('parallel')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                workflowType === 'parallel'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              Parallel
            </button>
            <button
              onClick={() => handleTypeChange('hierarchical')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                workflowType === 'hierarchical'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              Hierarchical
            </button>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6 bg-gray-50 rounded-lg p-6">
        {workflow.steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
            <p className="text-gray-500 mb-4">Add your first workflow step</p>
            <button
              onClick={addStep}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <ArrowRight className={`w-6 h-6 ${
                        workflowType === 'parallel' ? 'rotate-90' : ''
                      } text-indigo-400`} />
                    </div>
                  )}
                  <WorkflowStepComponent
                    step={step}
                    agents={agents}
                    onUpdateStep={updateStep}
                    onDelete={() => {
                      onUpdateWorkflow({
                        ...workflow,
                        steps: workflow.steps.filter(s => s.id !== step.id)
                      });
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-6">
              <button
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          </>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Workflow Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {workflowType === 'parallel' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Concurrent Steps
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={workflow.steps.length}
                    value={workflow.config?.maxConcurrentSteps || 3}
                    onChange={(e) => onUpdateWorkflow({
                      ...workflow,
                      config: {
                        ...workflow.config,
                        maxConcurrentSteps: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Require Approval
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={workflow.config?.requireApproval || false}
                    onChange={(e) => onUpdateWorkflow({
                      ...workflow,
                      config: {
                        ...workflow.config,
                        requireApproval: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">
                    Require human approval between steps
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto Retry
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max attempts"
                      value={workflow.config?.autoRetry?.maxAttempts || 0}
                      onChange={(e) => onUpdateWorkflow({
                        ...workflow,
                        config: {
                          ...workflow.config,
                          autoRetry: {
                            ...workflow.config?.autoRetry,
                            maxAttempts: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      placeholder="Delay (ms)"
                      value={workflow.config?.autoRetry?.delayMs || 0}
                      onChange={(e) => onUpdateWorkflow({
                        ...workflow,
                        config: {
                          ...workflow.config,
                          autoRetry: {
                            ...workflow.config?.autoRetry,
                            delayMs: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={workflow.config?.timeout || 0}
                  onChange={(e) => onUpdateWorkflow({
                    ...workflow,
                    config: {
                      ...workflow.config,
                      timeout: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}