/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent, Tool, Parameter } from '../types/agent';
import { WorkflowStep } from '../types/workflow';

interface ToolExecutionContext {
  systemPrompt: string;
  context: string;
  temperature: number;
  maxTokens: number;
  tool: {
    name: string;
    description: string;
    parameters: Parameter[];
  };
  step: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

interface ToolExecutionResult {
  success: boolean;
  result: string;
  requiresDelegation: boolean;
  delegationDetails?: DelegationDetails;
}

export async function executeAgentAction(
  agent: Agent,
  step: WorkflowStep
): Promise<unknown> {
  // Validate agent has required tool
  const tool = agent.tools.find(t => t.id === step.toolId);
  if (!tool) {
    throw new Error(`Agent ${agent.name} does not have access to tool ${step.toolId}`);
  }

  // Check agent capabilities
  if (step.parameters.requiresDelegation && !agent.capabilities.canDelegateWork) {
    throw new Error(`Agent ${agent.name} cannot delegate work`);
  }

  // Prepare execution context
  const context: ToolExecutionContext = {
    systemPrompt: agent.systemPrompt,
    context: agent.context,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    tool: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    },
    step: {
      name: step.name,
      description: step.description,
      parameters: step.parameters
    }
  };

  try {
    // Execute the tool with the agent's context
    const result = await executeTool(tool, step.parameters, context, agent) as ToolExecutionResult;

    // If the agent can delegate, check if delegation is needed
    if (agent.capabilities.canDelegateWork && result.requiresDelegation && result.delegationDetails) {
      return await handleDelegation(agent, result.delegationDetails);
    }

    return result;
  } catch (error: any) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
}

async function executeTool(
  tool: Tool,
  parameters: Record<string, any>,
  context: ToolExecutionContext,
  agent: Agent
): Promise<unknown> {
  // This would be replaced with actual tool execution logic
  // For now, we'll simulate tool execution
  if (tool.name === 'text-generation') {
    const apiKey = agent.apiKey;
    const baseUrl = agent.baseUrl || 'https://openrouter.ai/api/v1';
    const model = agent.model;

    if (!apiKey) {
      throw new Error('API key is required for OpenRouter');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'YOUR_SITE_URL', // Replace with your site URL
      'X-Title': 'YOUR_APP_NAME' // Replace with your app name
    };

    const body: string = JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: parameters.prompt
        }
      ]
    });

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${response.status} - ${error.message}`);
      }

      const data = await response.json();
      return {
        success: true,
        result: data.choices[0].message.content,
        requiresDelegation: false
      };
    } catch (error: any) {
      throw new Error(`OpenRouter API request failed: ${error.message}`);
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          result: `Executed ${tool.name} with parameters: ${JSON.stringify(parameters)}`,
          requiresDelegation: false
        });
      }, 1000);
    });
  }
}

interface DelegationDetails {
  targetAgent: string;
  reason: string;
}

async function handleDelegation(
  agent: Agent,
  delegationDetails: DelegationDetails
): Promise<unknown> {
  // This would handle delegating work to other agents
  // For now, we'll simulate delegation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        result: `Delegated work from agent ${agent.name}`,
        delegatedTo: delegationDetails.targetAgent
      });
    }, 500);
  });
}
