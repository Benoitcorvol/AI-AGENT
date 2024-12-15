import React from 'react';
import { Wrench, GitBranch, Users } from 'lucide-react';
import { Agent } from '../types/agent';
import { AgentCardMenu } from './AgentCardMenu';
import { AgentCardStats } from './AgentCardStats';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const getStatusColor = () => {
    // This could be enhanced with real status logic
    return 'bg-green-400';
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col min-h-[300px]">
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor() }} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors duration-300 transform group-hover:scale-110">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
              {agent.name}
            </h3>
            <span className="text-xs text-gray-500 block">ID: {agent.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <AgentCardMenu onEdit={() => onEdit(agent)} onDelete={() => onDelete(agent.id)} />
        </div>
      </div>
      
      <div className="flex-grow">
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 break-words">
          {agent.description}
        </p>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{agent.tools?.length || 0} Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{agent.connections?.length || 0} Connections</span>
          </div>
        </div>
        
        <AgentCardStats agent={agent} />
      </div>

      {/* Quick Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
        <button 
          onClick={() => onEdit(agent)}
          className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(agent.id)}
          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
