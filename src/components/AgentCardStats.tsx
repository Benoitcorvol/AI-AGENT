import React from 'react';
import { WrenchIcon, GitBranchIcon, DatabaseIcon, UsersIcon, ThermometerIcon } from 'lucide-react';
import { Agent } from '../types/agent';

interface AgentCardStatsProps {
  agent: Agent;
}

export function AgentCardStats({ agent }: AgentCardStatsProps) {
  return (
    <>
      <div className="text-sm text-gray-500 mb-6 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <DatabaseIcon className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-medium text-gray-700">{agent.model}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <UsersIcon className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-medium text-gray-700 capitalize">{agent.role}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <ThermometerIcon className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-medium text-gray-700">{agent.temperature}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1">
          <WrenchIcon className={`w-4 h-4 ${agent.tools.length > 0 ? 'text-indigo-600' : ''}`} />
          <span>{agent.tools.length} {agent.tools.length === 1 ? 'Tool' : 'Tools'}</span>
        </div>
        <div className="flex items-center gap-1">
          <DatabaseIcon className="w-4 h-4 text-gray-400" />
          <span>{agent.connections.length} Connections</span>
        </div>
        {agent.capabilities.canCreateSubAgents && (
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4 text-green-500" />
            <span>{agent.subAgents.length} Sub-agents</span>
          </div>
        )}
        {agent.parentId && (
          <div className="flex items-center gap-1">
            <GitBranchIcon className="w-4 h-4 text-blue-500" />
            <span>Sub-agent</span>
          </div>
        )}
      </div>
    </>
  );
}