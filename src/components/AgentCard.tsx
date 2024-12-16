import React, { useState, useEffect } from 'react';
import { MoreVertical, Brain } from 'lucide-react';
import { Agent } from '../types/agent';
import { AgentCardMenu } from './AgentCardMenu';
import { AgentCardStats } from './AgentCardStats';
import { MemoryManager } from '../services/memoryManager';
import { MemoryNode } from '../types/memory';

interface AgentCardProps {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function AgentCard({ agent, onEdit, onDelete, onDuplicate }: AgentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [recentMemories, setRecentMemories] = useState<MemoryNode[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);

  useEffect(() => {
    const loadRecentMemories = async () => {
      try {
        const memoryManager = MemoryManager.getInstance();
        const results = await memoryManager.queryMemories({
          agentId: agent.id,
          limit: 3
        });
        setRecentMemories(results.map(r => r.node));
      } catch (error) {
        console.error('Failed to load memories:', error);
      } finally {
        setIsLoadingMemories(false);
      }
    };

    loadRecentMemories();
  }, [agent.id]);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.agent-menu')) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
          </div>
          <div className="relative agent-menu">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            {showMenu && (
              <AgentCardMenu
                onEdit={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                onDelete={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                onDuplicate={() => {
                  setShowMenu(false);
                  onDuplicate();
                }}
              />
            )}
          </div>
        </div>

        <AgentCardStats agent={agent} />

        {/* Recent Memories */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-medium text-gray-700">Recent Memories</h4>
          </div>
          {isLoadingMemories ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ) : recentMemories.length > 0 ? (
            <div className="space-y-2">
              {recentMemories.map(memory => (
                <div key={memory.id} className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                    {memory.type}
                  </span>
                  <p className="text-sm text-gray-600 flex-1">
                    {memory.content.length > 100 
                      ? `${memory.content.slice(0, 100)}...` 
                      : memory.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No memories yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
