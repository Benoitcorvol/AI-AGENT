export interface MemoryNode {
  id: string;
  agentId: string;
  type: 'fact' | 'concept' | 'experience' | 'relationship';
  content: string;
  metadata: {
    timestamp: number;
    confidence: number;
    source?: string;
  };
  embedding?: number[]; // Vector embedding for semantic search
}

export interface MemoryEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'related_to' | 'causes' | 'part_of' | 'similar_to' | 'opposite_of';
  weight: number;
  metadata: {
    timestamp: number;
    context?: string;
  };
}

export interface MemoryQuery {
  agentId: string;
  content?: string;
  type?: MemoryNode['type'];
  timeRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  minConfidence?: number;
}

export interface MemorySearchResult {
  node: MemoryNode;
  score: number;
  relatedNodes: Array<{
    node: MemoryNode;
    edge: MemoryEdge;
  }>;
}
