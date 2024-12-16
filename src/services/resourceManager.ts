import { Agent, Tool } from '../types/agent';
import { SubTask } from '../types/taskManagement';

export class ResourceManager {
  private agents: Map<string, Agent>;
  private agentAvailability: Map<string, boolean>;

  constructor(agents: Agent[]) {
    this.agents = new Map(agents.map(agent => [agent.id, agent]));
    this.agentAvailability = new Map(agents.map(agent => [agent.id, true]));
  }

  async allocateResources(subtask: SubTask): Promise<{
    agent: Agent;
    tools: Tool[];
  } | null> {
    const availableAgents = this.getAvailableAgents();
    const suitableAgent = this.findSuitableAgent(availableAgents, subtask);
    
    if (!suitableAgent) {
      return null;
    }

    const requiredTools = this.identifyRequiredTools(suitableAgent, subtask);
    
    if (requiredTools.length === 0) {
      return null;
    }

    this.agentAvailability.set(suitableAgent.id, false);
    return { agent: suitableAgent, tools: requiredTools };
  }

  releaseResources(agentId: string): void {
    this.agentAvailability.set(agentId, true);
  }

  private getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values())
      .filter(agent => this.agentAvailability.get(agent.id));
  }

  private findSuitableAgent(agents: Agent[], subtask: SubTask): Agent | null {
    const requiredCapabilities = subtask.metadata.requiredCapabilities as string[];
    
    return agents.find(agent => 
      agent.role === 'worker' && // Only consider worker agents
      requiredCapabilities.every(capability => 
        // Check if agent has necessary tools/capabilities
        agent.tools.some(tool => 
          tool.description.toLowerCase().includes(capability.toLowerCase())
        )
      )
    ) || null;
  }

  private identifyRequiredTools(agent: Agent, subtask: SubTask): Tool[] {
    const requiredCapabilities = subtask.metadata.requiredCapabilities as string[];
    
    return agent.tools.filter(tool =>
      requiredCapabilities.some(capability =>
        tool.description.toLowerCase().includes(capability.toLowerCase())
      )
    );
  }
}
