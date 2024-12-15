import { Agent, Tool, AgentRole } from '../types/agent';
import { AgentCreationRequest, AgentCreationResult, AgentTemplate } from '../types/agentFactory';
import { analyzeUserPrompt } from '../utils/promptAnalyzer';
import { generateSystemPrompt } from '../utils/promptGenerator';
import { selectOptimalTools } from '../utils/toolSelector';

const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  researcher: {
    role: 'worker',
    basePrompt: 'You are a research specialist focused on gathering and analyzing information.',
    suggestedTools: ['web-search', 'document-reader', 'data-analyzer'],
    capabilities: {
      canCreateSubAgents: false,
      canDelegateWork: false,
      canAccessOtherAgents: false
    }
  },
  orchestrator: {
    role: 'manager',
    basePrompt: 'You are an orchestrator agent responsible for creating and managing other agents.',
    suggestedTools: ['agent-creator', 'workflow-manager', 'task-distributor'],
    capabilities: {
      canCreateSubAgents: true,
      canDelegateWork: true,
      canAccessOtherAgents: true
    }
  },
  specialist: {
    role: 'worker',
    basePrompt: 'You are a specialist agent focused on your assigned domain.',
    suggestedTools: ['domain-specific-tool', 'analysis-tool'],
    capabilities: {
      canCreateSubAgents: false,
      canDelegateWork: false,
      canAccessOtherAgents: true
    }
  }
};

export class AgentFactory {
  private async createSingleAgent(
    template: AgentTemplate,
    specialization: string,
    tools: Tool[]
  ): Promise<Agent> {
    const systemPrompt = await generateSystemPrompt(template.basePrompt, specialization, tools);
    
    return {
      id: crypto.randomUUID(),
      name: `${specialization} ${template.role}`,
      description: `Specialized in ${specialization}`,
      model: 'gpt-4',
      systemPrompt,
      context: `Domain: ${specialization}`,
      temperature: 0.7,
      maxTokens: 2048,
      tools,
      connections: [],
      role: template.role,
      capabilities: template.capabilities,
      subAgents: []
    };
  }

  public async createAgentSystem(request: AgentCreationRequest): Promise<AgentCreationResult> {
    // Analyze the user's prompt to determine required capabilities
    const analysis = await analyzeUserPrompt(request.userPrompt);
    
    // Create the main orchestrator agent
    const mainAgent = await this.createSingleAgent(
      AGENT_TEMPLATES.orchestrator,
      'System Orchestrator',
      await selectOptimalTools(['agent-creator', 'workflow-manager'])
    );

    // Create specialized sub-agents based on the analysis
    const subAgents = await Promise.all(
      analysis.requiredSpecialties.map(specialty =>
        this.createSingleAgent(
          AGENT_TEMPLATES.specialist,
          specialty,
          selectOptimalTools(analysis.requiredTools[specialty])
        )
      )
    );

    // Link sub-agents to the main agent
    mainAgent.subAgents = subAgents.map(agent => agent.id);

    // Generate suggested workflow
    const suggestedWorkflow = {
      steps: analysis.suggestedSteps.map(step => ({
        agentId: step.agentType === 'main' ? mainAgent.id : subAgents[step.agentIndex].id,
        toolId: step.toolId,
        description: step.description,
        expectedDuration: step.duration,
        requiredInput: step.input,
        expectedOutput: step.output
      })),
      expectedOutcome: analysis.expectedOutcome,
      estimatedCompletion: analysis.estimatedCompletion
    };

    return {
      mainAgent,
      subAgents,
      suggestedWorkflow
    };
  }
}