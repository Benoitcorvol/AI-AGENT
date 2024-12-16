import { Agent } from '../types/agent';
import { MemoryManager } from './memoryManager';

export class AgentMemoryIntegration {
  private static instance: AgentMemoryIntegration;
  private memoryManager: MemoryManager;

  private constructor() {
    this.memoryManager = MemoryManager.getInstance();
  }

  static getInstance(): AgentMemoryIntegration {
    if (!AgentMemoryIntegration.instance) {
      AgentMemoryIntegration.instance = new AgentMemoryIntegration();
    }
    return AgentMemoryIntegration.instance;
  }

  async processAgentMessage(agent: Agent, message: string, role: 'user' | 'assistant'): Promise<void> {
    if (!agent.capabilities.canUseMemory || !agent.memoryConfig?.enabled) {
      return;
    }

    // Store the message as an experience
    const memoryNode = await this.memoryManager.addMemory(
      agent.id,
      message,
      'experience',
      {
        confidence: 1.0,
        source: role
      }
    );

    // Extract potential facts or concepts from the message
    const extractedInfo = await this.extractInformation(message);
    
    // Store extracted information and create relationships
    for (const info of extractedInfo) {
      const relatedNode = await this.memoryManager.addMemory(
        agent.id,
        info.content,
        info.type,
        {
          confidence: info.confidence,
          source: 'extraction'
        }
      );

      // Create relationship between message and extracted information
      await this.memoryManager.createRelationship(
        memoryNode.id,
        relatedNode.id,
        'related_to',
        info.confidence,
        'Extracted from message'
      );
    }

    // Perform memory maintenance
    await this.maintainMemories(agent);
  }

  async retrieveRelevantMemories(agent: Agent, context: string): Promise<string> {
    if (!agent.capabilities.canUseMemory || !agent.memoryConfig?.enabled) {
      return '';
    }

    const memories = await this.memoryManager.queryMemories({
      agentId: agent.id,
      content: context,
      minConfidence: agent.memoryConfig.minConfidence,
      limit: 5
    });

    // Format memories for inclusion in prompt
    return memories.map(result => {
      const memory = result.node;
      const related = result.relatedNodes
        .map(r => `  - Related ${r.node.type}: ${r.node.content}`)
        .join('\n');

      return `[Memory - ${memory.type}] (confidence: ${memory.metadata.confidence})
${memory.content}
${related ? '\nRelated information:\n' + related : ''}`;
    }).join('\n\n');
  }

  private async extractInformation(text: string): Promise<Array<{
    type: 'fact' | 'concept';
    content: string;
    confidence: number;
  }>> {
    // This is a simple implementation - could be enhanced with NLP or LLM processing
    const extracted: Array<{
      type: 'fact' | 'concept';
      content: string;
      confidence: number;
    }> = [];

    // Extract potential facts (sentences with specific patterns)
    const factPatterns = [
      /\b(?:is|are|was|were)\b.+/g,
      /\b(?:has|have|had)\b.+/g,
      /\b(?:can|could|will|would)\b.+/g
    ];

    for (const pattern of factPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 10) { // Avoid very short matches
            extracted.push({
              type: 'fact',
              content: match.trim(),
              confidence: 0.8
            });
          }
        });
      }
    }

    // Extract potential concepts (noun phrases)
    const conceptPatterns = [
      /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, // Proper nouns
      /\b(?:the\s+)?(?:[a-z]+\s+)*(?:process|system|method|approach|concept|idea|theory)\b/gi // Common concept patterns
    ];

    for (const pattern of conceptPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 5) { // Avoid very short matches
            extracted.push({
              type: 'concept',
              content: match.trim(),
              confidence: 0.7
            });
          }
        });
      }
    }

    return extracted;
  }

  private async maintainMemories(agent: Agent): Promise<void> {
    if (!agent.memoryConfig) return;

    // Prune old memories based on retention period
    if (agent.memoryConfig.retentionPeriod) {
      const maxAge = agent.memoryConfig.retentionPeriod;
      await this.memoryManager.pruneMemories(agent.id, maxAge, agent.memoryConfig.minConfidence);
    }

    // TODO: Implement memory consolidation
    // This could involve:
    // 1. Merging similar memories
    // 2. Strengthening frequently accessed memories
    // 3. Creating higher-level concepts from related memories
  }

  async updateAgentContext(agent: Agent, currentContext: string): Promise<string> {
    if (!agent.capabilities.canUseMemory || !agent.memoryConfig?.enabled) {
      return currentContext;
    }

    const relevantMemories = await this.retrieveRelevantMemories(agent, currentContext);
    
    if (!relevantMemories) {
      return currentContext;
    }

    return `${currentContext}\n\nRelevant memories:\n${relevantMemories}`;
  }
}
