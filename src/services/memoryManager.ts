import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../db/dbSetup';
import { MemoryNode, MemoryEdge, MemoryQuery, MemorySearchResult } from '../types/memory';

export class MemoryManager {
  private static instance: MemoryManager;

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  async addMemory(agentId: string, content: string, type: MemoryNode['type'], metadata: Partial<MemoryNode['metadata']> = {}): Promise<MemoryNode> {
    const node: MemoryNode = {
      id: uuidv4(),
      agentId,
      type,
      content,
      metadata: {
        timestamp: Date.now(),
        confidence: metadata.confidence || 1.0,
        source: metadata.source,
      }
    };

    const store = await getStore('memory_nodes', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return node;
  }

  async createRelationship(sourceId: string, targetId: string, type: MemoryEdge['type'], weight: number = 1.0, context?: string): Promise<MemoryEdge> {
    const edge: MemoryEdge = {
      id: uuidv4(),
      sourceId,
      targetId,
      type,
      weight,
      metadata: {
        timestamp: Date.now(),
        context
      }
    };

    const store = await getStore('memory_edges', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(edge);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return edge;
  }

  async queryMemories(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const store = await getStore('memory_nodes');
    const edgeStore = await getStore('memory_edges');
    
    const results: MemorySearchResult[] = [];
    const nodes = await new Promise<MemoryNode[]>((resolve, reject) => {
      const request = store.index('agentId').getAll(query.agentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Filter nodes based on query parameters
    const filteredNodes = nodes.filter(node => {
      if (query.type && node.type !== query.type) return false;
      if (query.timeRange) {
        const timestamp = node.metadata.timestamp;
        if (timestamp < query.timeRange.start || timestamp > query.timeRange.end) {
          return false;
        }
      }
      if (query.minConfidence && node.metadata.confidence < query.minConfidence) {
        return false;
      }
      return true;
    });

    // Sort by relevance if content query is provided
    if (query.content) {
      const contentLower = query.content.toLowerCase();
      filteredNodes.sort((a, b) => {
        const scoreA = this.calculateRelevanceScore(a.content, contentLower);
        const scoreB = this.calculateRelevanceScore(b.content, contentLower);
        return scoreB - scoreA;
      });
    }

    // Get related nodes for each filtered node
    for (const node of filteredNodes) {
      const edges = await new Promise<MemoryEdge[]>((resolve, reject) => {
        const request = edgeStore.index('sourceId').getAll(node.id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const relatedNodes = await Promise.all(
        edges.map(async edge => {
          const targetRequest = store.get(edge.targetId);
          const targetNode = await new Promise<MemoryNode>((resolve, reject) => {
            targetRequest.onsuccess = () => resolve(targetRequest.result);
            targetRequest.onerror = () => reject(targetRequest.error);
          });
          return { node: targetNode, edge };
        })
      );

      results.push({
        node,
        score: query.content ? this.calculateRelevanceScore(node.content, query.content.toLowerCase()) : 1,
        relatedNodes
      });
    }

    // Apply limit if specified
    if (query.limit && query.limit > 0) {
      return results.slice(0, query.limit);
    }

    return results;
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    if (contentLower === query) return 1;
    if (contentLower.includes(query)) return 0.8;
    
    // Calculate word overlap
    const contentWords = new Set(contentLower.split(/\s+/));
    const queryWords = new Set(query.split(/\s+/));
    const intersection = new Set([...contentWords].filter(x => queryWords.has(x)));
    
    return intersection.size / queryWords.size * 0.6;
  }

  async pruneMemories(agentId: string, maxAge?: number, minConfidence?: number): Promise<void> {
    const store = await getStore('memory_nodes', 'readwrite');
    const edgeStore = await getStore('memory_edges', 'readwrite');

    const nodes = await new Promise<MemoryNode[]>((resolve, reject) => {
      const request = store.index('agentId').getAll(agentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const now = Date.now();
    const nodesToDelete = nodes.filter(node => {
      if (maxAge && (now - node.metadata.timestamp) > maxAge) return true;
      if (minConfidence && node.metadata.confidence < minConfidence) return true;
      return false;
    });

    // Delete nodes and their relationships
    for (const node of nodesToDelete) {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = store.delete(node.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = edgeStore.index('sourceId').getAll(node.id);
          request.onsuccess = () => {
            const edges = request.result;
            Promise.all(edges.map(edge => 
              new Promise<void>((res, rej) => {
                const delRequest = edgeStore.delete(edge.id);
                delRequest.onsuccess = () => res();
                delRequest.onerror = () => rej(delRequest.error);
              })
            )).then(() => resolve());
          };
          request.onerror = () => reject(request.error);
        })
      ]);
    }
  }
}
