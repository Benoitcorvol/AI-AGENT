import React from 'react';
import { MoreVertical, Wrench, GitBranch, Database, Users, Thermometer } from 'lucide-react';
import { Agent } from '../types/agent';
import { AgentCardMenu } from './AgentCardMenu';
import { AgentCardStats } from './AgentCardStats';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{agent.name}</h3>
        </div>
        <AgentCardMenu onEdit={() => onEdit(agent)} onDelete={() => onDelete(agent.id)} />
      </div>
      
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-2">{agent.description}</p>
      <AgentCardStats agent={agent} />
    </div>
  );
}