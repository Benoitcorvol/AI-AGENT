import React from 'react';
import { Wrench, GitBranch, Database, Users, Thermometer, Cpu } from 'lucide-react';
import { Agent } from '../types/agent';

interface AgentCardStatsProps {
  agent: Agent;
}

export function AgentCardStats({ agent }: AgentCardStatsProps) {
  return (
    <div className="space-y-4">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">Model</span>
          </div>
          <div className="truncate" title={agent.model}>
            <span className="text-sm font-medium text-gray-700">
              {agent.model}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">Role</span>
          </div>
          <div className="truncate" title={agent.role}>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {agent.role}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">Temperature</span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {agent.temperature}
          </span>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-md border border-indigo-100 transition-colors hover:bg-indigo-100">
          <Wrench className={`w-3.5 h-3.5 ${agent.tools.length > 0 ? 'text-indigo-600' : 'text-gray-400'}`} />
          <span className="text-gray-700">{agent.tools.length} {agent.tools.length === 1 ? 'Tool' : 'Tools'}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-md border border-blue-100 transition-colors hover:bg-blue-100">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-gray-700">{agent.connections.length} Connections</span>
        </div>

        {agent.capabilities.canCreateSubAgents && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-md border border-green-100 transition-colors hover:bg-green-100">
            <Users className="w-3.5 h-3.5 text-green-600" />
            <span className="text-gray-700">{agent.subAgents.length} Sub-agents</span>
          </div>
        )}

        {agent.parentId && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-md border border-purple-100 transition-colors hover:bg-purple-100">
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-gray-700">Sub-agent</span>
          </div>
        )}
      </div>
    </div>
  );
}
