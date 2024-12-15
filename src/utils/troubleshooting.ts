import { Agent, Tool } from '../types/agent';

export interface DatabaseStatus {
  isConnected: boolean;
  version: number;
  stores: {
    name: string;
    count: number;
    indexes: string[];
  }[];
  error?: string;
}

export interface ToolStatus {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  isAvailable: boolean;
  error?: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  isAvailable: boolean;
  subAgents: string[];
  tools: string[];
  lastActive?: string;
  error?: string;
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const request = indexedDB.open('ai_agents_db');
    
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        resolve({
          isConnected: false,
          version: 0,
          stores: [],
          error: request.error?.message
        });
      };

      request.onsuccess = () => {
        const db = request.result;
        const stores = Array.from(db.objectStoreNames).map(name => {
          const transaction = db.transaction(name, 'readonly');
          const store = transaction.objectStore(name);
          return {
            name,
            count: 0, // Will be updated
            indexes: Array.from(store.indexNames)
          };
        });

        resolve({
          isConnected: true,
          version: db.version,
          stores
        });
      };
    });
  } catch (error) {
    return {
      isConnected: false,
      version: 0,
      stores: [],
      error: error.message
    };
  }
}

export async function checkToolStatus(tool: Tool): Promise<ToolStatus> {
  return {
    id: tool.id,
    name: tool.name,
    createdAt: new Date().toISOString(), // Should come from metadata
    isAvailable: true, // Should check actual availability
    lastUsed: undefined // Should track usage
  };
}

export async function checkAgentStatus(agent: Agent): Promise<AgentStatus> {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    isAvailable: true, // Should check actual availability
    subAgents: agent.subAgents,
    tools: agent.tools.map(t => t.id),
    lastActive: undefined // Should track activity
  };
}

export function generateTroubleshootingReport(
  dbStatus: DatabaseStatus,
  toolStatuses: ToolStatus[],
  agentStatuses: AgentStatus[]
): string {
  let report = '# AI Agent System Troubleshooting Report\n\n';

  // Database Status
  report += '## Database Status\n';
  report += `- Connection: ${dbStatus.isConnected ? '✅ Connected' : '❌ Disconnected'}\n`;
  report += `- Version: ${dbStatus.version}\n`;
  if (dbStatus.error) {
    report += `- Error: ${dbStatus.error}\n`;
  }

  // Tool Status
  report += '\n## Tools Status\n';
  toolStatuses.forEach(tool => {
    report += `\n### ${tool.name} (${tool.id})\n`;
    report += `- Available: ${tool.isAvailable ? '✅' : '❌'}\n`;
    report += `- Created: ${tool.createdAt}\n`;
    if (tool.lastUsed) {
      report += `- Last Used: ${tool.lastUsed}\n`;
    }
    if (tool.error) {
      report += `- Error: ${tool.error}\n`;
    }
  });

  // Agent Status
  report += '\n## Agents Status\n';
  agentStatuses.forEach(agent => {
    report += `\n### ${agent.name} (${agent.id})\n`;
    report += `- Role: ${agent.role}\n`;
    report += `- Available: ${agent.isAvailable ? '✅' : '❌'}\n`;
    report += `- Tools: ${agent.tools.join(', ')}\n`;
    if (agent.subAgents.length > 0) {
      report += `- Sub-agents: ${agent.subAgents.join(', ')}\n`;
    }
    if (agent.lastActive) {
      report += `- Last Active: ${agent.lastActive}\n`;
    }
    if (agent.error) {
      report += `- Error: ${agent.error}\n`;
    }
  });

  return report;
}