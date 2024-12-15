import React, { useState } from 'react';
import { MessageCircle, Plus, Edit, Trash, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Workflow, WorkflowExecution } from '../../types/workflow';
import { WorkflowForm } from './WorkflowForm';
import { Agent } from '../../types/agent';

interface WorkflowListProps {
  agents: Agent[];
  workflows: Workflow[];
  executions: WorkflowExecution[];
  onEditAgent: (agent: Agent) => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (id: string) => void;
  onCreateWorkflow: (workflow: Workflow) => void;
}

export function WorkflowList({ 
  agents, 
  workflows, 
  executions, 
  onEditAgent, 
  onSelectWorkflow, 
  onDeleteWorkflow, 
  onCreateWorkflow 
}: WorkflowListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#075E54] text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Workflow Chats</h2>
            <p className="text-sm text-green-100 mt-1">Select or create a workflow to start chatting</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-[#128C7E] rounded-full hover:bg-[#075E54] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {workflows.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#DCF8C6] flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-[#128C7E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-500 mb-4">Create your first workflow to start chatting</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#128C7E] text-white rounded-lg hover:bg-[#075E54] transition-colors"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          workflows.map(workflow => {
            const execution = executions.find(e => e.workflowId === workflow.id);
            const manager = agents.find(a => a.id === workflow.managerId);
            const workers = agents.filter(a => workflow.workerIds?.includes(a.id));
            const lastExecution = execution?.startedAt ? new Date(execution.startedAt) : null;

            return (
              <div
                key={workflow.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectWorkflow(workflow)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[#075E54]">{workflow.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{workflow.description}</p>
                    </div>
                    <div className="flex items-start gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkflow(workflow.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowForm(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{workers.length + (manager ? 1 : 0)} agents</span>
                    </div>
                    {lastExecution && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{lastExecution.toLocaleDateString()}</span>
                      </div>
                    )}
                    {execution?.status && (
                      <div className="flex items-center gap-1">
                        {execution.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : execution.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : null}
                        <span
                          className={`${
                            execution.status === 'completed'
                              ? 'text-green-600'
                              : execution.status === 'failed'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {execution.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {workflow.type === 'hierarchical' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {manager && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#DCF8C6] text-[#075E54]">
                          👑 {manager.name}
                        </span>
                      )}
                      {workers.map(worker => (
                        <span
                          key={worker.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {worker.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <WorkflowForm
          agents={agents}
          onSubmit={(workflow) => {
            onCreateWorkflow(workflow);
            setShowForm(false);
          }}
          onEditAgent={onEditAgent}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
