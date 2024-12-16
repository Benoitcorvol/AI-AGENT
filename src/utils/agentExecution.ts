/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent, Tool, Parameter } from '../types/agent';
import { WorkflowStep } from '../types/workflow';
import { modelDb } from '../db/modelDb';

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
  if (tool.name === 'text-generation') {
    // Get API key from model database
    const modelConfig = await modelDb.getModelConfig('openrouter');
    if (!modelConfig || !modelConfig.apiKey) {
      throw new Error('OpenRouter API key not found in database. Please configure it in the Model Manager.');
    }

    const apiKey = modelConfig.apiKey;
    const baseUrl = modelConfig.baseUrl || 'https://openrouter.ai/api/v1';

    // Get the model configuration to ensure we use the correct ID
    // First try exact match, then try with provider prefix
    const model = modelConfig.models.find(m => 
      m.id === agent.model || 
      m.id === `openai/${agent.model}` ||
      m.id === `anthropic/${agent.model}` ||
      m.id === `google/${agent.model}` ||
      m.id === `meta/${agent.model}`
    );

    if (!model) {
      // Provide a more helpful error message listing available models
      const availableModels = modelConfig.models.map(m => m.id).join(', ');
      throw new Error(
        `Model ${agent.model} not found in OpenRouter configuration. ` +
        `Available models are: ${availableModels}`
      );
    }

    // Construct messages array with proper formatting
    const messages = [];

    // Add system message if present
    if (context.systemPrompt) {
      messages.push({
        role: 'system',
        content: context.systemPrompt
      });
    }

    // Add context as system message if present
    if (context.context) {
      messages.push({
        role: 'system',
        content: context.context
      });
    }

    // Add user message (the actual prompt)
    messages.push({
      role: 'user',
      content: parameters.prompt
    });

    // Construct request body according to OpenRouter specifications
    const body = {
      model: model.id,
      messages: messages,
      temperature: context.temperature || model.defaultTemperature,
      max_tokens: context.maxTokens || model.maxTokens,
      top_p: 1,
      stream: false
    };

    try {
      // Construct headers with all required fields
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'http://localhost:3000',
        'X-Title': 'Bolt'
      };

      console.debug('OpenRouter Request:', {
        url: `${baseUrl}/chat/completions`,
        model: model.id,
        messageCount: messages.length,
        temperature: body.temperature,
        max_tokens: body.max_tokens
      });

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = `OpenRouter API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || errorData.message || 'Unknown error'}`;
        } catch {
          errorMessage += ` - ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return {
        success: true,
        result: data.choices[0].message.content,
        requiresDelegation: false
      };
    } catch (error: any) {
      console.error('OpenRouter Request Failed:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
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
