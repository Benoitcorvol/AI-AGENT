import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Agent } from '../types/agent';
import { AgentCard } from './AgentCard';
import { AgentForm } from './AgentForm';

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (id: string) => void;
}

export function AgentList({ agents, isLoading, onEditAgent, onDeleteAgent }: AgentListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();

  const handleSubmitAgent = async (agentData: Partial<Agent>) => {
    if (editingAgent) {
      onEditAgent({ ...editingAgent, ...agentData } as Agent);
    } else {
      const newAgent = {
        ...agentData,
        id: crypto.randomUUID(),
        tools: agentData.tools || [],
        connections: agentData.connections || [],
        subAgents: agentData.subAgents || [],
      } as Agent;
      onEditAgent(newAgent);
    }
    setShowForm(false);
    setEditingAgent(undefined);
  };

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Agents</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="space-y-3">
                <div className="h-2 w-48 bg-slate-200 rounded"></div>
                <div className="h-2 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            Loading agents...
          </div>
        ) : (
          agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={handleEditClick}
              onDelete={onDeleteAgent}
            />
          ))
        )}
      </div>
      {showForm && (
        <AgentForm
          onSubmit={handleSubmitAgent}
          onClose={() => {
            setShowForm(false);
            setEditingAgent(undefined);
          }}
          initialData={editingAgent}
          availableAgents={agents}
        />
      )}
    </div>
  );
}
