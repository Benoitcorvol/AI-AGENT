import React, { useEffect, useState } from 'react';
import { Brain, RefreshCw, X, Search, AlertCircle, Plus } from 'lucide-react';
import { MemoryNode, MemoryEdge } from '../types/memory';
import { MemoryManager } from '../services/memoryManager';

interface MemoryBrowserProps {
  agentId: string;
}

interface ModalData {
  title: string;
  content: unknown;
}

export const MemoryBrowser: React.FC<MemoryBrowserProps> = ({ agentId }) => {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [edges, setEdges] = useState<MemoryEdge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryNode['type']>('fact');
  const [newMemoryContent, setNewMemoryContent] = useState('');

  const memoryManager = MemoryManager.getInstance();

  const refreshData = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      const results = await memoryManager.queryMemories({ agentId });
      setMemories(results.map(r => r.node));
      // Get all edges for these memories
      const memoryIds = new Set(results.map(r => r.node.id));
      const allEdges: MemoryEdge[] = [];
      for (const result of results) {
        result.relatedNodes.forEach(({ edge }) => {
          if (memoryIds.has(edge.sourceId) && memoryIds.has(edge.targetId)) {
            allEdges.push(edge);
          }
        });
      }
      setEdges(allEdges);
      setIsRefreshing(false);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMemories([]);
      setEdges([]);
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [agentId]);

  const handleAddMemory = async () => {
    if (!newMemoryContent.trim()) return;
    
    try {
      await memoryManager.addMemory(agentId, newMemoryContent, selectedType, {
        confidence: 1.0,
        source: 'manual'
      });
      setNewMemoryContent('');
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add memory');
    }
  };

  const filteredMemories = memories.filter(memory => 
    memory.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const memoryTypes: MemoryNode['type'][] = ['fact', 'concept', 'experience', 'relationship'];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-[#075E54] text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Agent Memory
            </h2>
            <p className="text-xs sm:text-sm text-green-100 mt-1">Browse and manage agent memories</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#128C7E] rounded-full text-xs sm:text-sm">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Add Memory Form */}
          <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as MemoryNode['type'])}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] focus:border-transparent transition-shadow"
              >
                {memoryTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add new memory..."
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] focus:border-transparent transition-shadow"
              />
              <button
                onClick={handleAddMemory}
                disabled={!newMemoryContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#128C7E] text-white text-sm rounded-lg hover:bg-[#075E54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search Memories
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#128C7E] text-white text-sm rounded-lg hover:bg-[#075E54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Memory List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#128C7E]"></div>
            <p className="text-sm text-gray-500">Loading memories...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#DCF8C6] flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-[#128C7E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Memories Found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start by adding some memories to this agent'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#DCF8C6] text-[#075E54] text-xs font-medium rounded-full">
                        {memory.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(memory.metadata.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{memory.content}</p>
                    {memory.metadata.source && (
                      <p className="mt-1 text-xs text-gray-500">
                        Source: {memory.metadata.source}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {Math.round(memory.metadata.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                {/* Related Memories */}
                {edges.some(edge => edge.sourceId === memory.id || edge.targetId === memory.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Related Memories:</h4>
                    <div className="space-y-2">
                      {edges
                        .filter(edge => edge.sourceId === memory.id || edge.targetId === memory.id)
                        .map(edge => {
                          const relatedMemory = memories.find(m => 
                            m.id === (edge.sourceId === memory.id ? edge.targetId : edge.sourceId)
                          );
                          if (!relatedMemory) return null;
                          return (
                            <div key={edge.id} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                {edge.type}
                              </span>
                              <span>{relatedMemory.content.slice(0, 50)}...</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-[#075E54]">
                {modalData.title}
              </h3>
              <button
                onClick={() => setModalData(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#128C7E] rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg">
                {typeof modalData.content === 'object'
                  ? JSON.stringify(modalData.content, null, 2)
                  : String(modalData.content)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
