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
      throw new Error('OpenRouter API key not found in database');
    }

    const apiKey = modelConfig.apiKey;
    const baseUrl = modelConfig.baseUrl || 'https://openrouter.ai/api/v1';

    // Get the model configuration to ensure we use the correct ID
    const model = modelConfig.models.find(m => m.id === agent.model || `openai/${agent.model}`);
    if (!model) {
      throw new Error(`Model ${agent.model} not found in OpenRouter configuration`);
    }

    // Log configuration for debugging
    console.debug('OpenRouter Configuration:', {
      baseUrl,
      modelId: model.id,
      hasApiKey: !!apiKey,
      modelCapabilities: model.capabilities
    });

    // Construct headers with all required fields
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Bolt'
    };

    // Log headers for debugging (excluding sensitive data)
    console.debug('Request Headers:', {
      'Content-Type': headers['Content-Type'],
      'HTTP-Referer': headers['HTTP-Referer'],
      'X-Title': headers['X-Title']
    });

    // Construct messages array
    const messages = [
      {
        role: 'system',
        content: context.systemPrompt
      }
    ];

    if (context.context) {
      messages.push({
        role: 'system',
        content: context.context
      });
    }

    messages.push({
      role: 'user',
      content: parameters.prompt
    });

    // Construct request body
    const body = {
      model: model.id, // Use the exact model ID from configuration
      messages: messages,
      temperature: context.temperature || model.defaultTemperature,
      max_tokens: context.maxTokens || model.maxTokens
    };

    // Log request body for debugging (excluding sensitive data)
    console.debug('Request Body:', {
      model: body.model,
      messageCount: body.messages.length,
      temperature: body.temperature,
      max_tokens: body.max_tokens
    });

    try {
      console.debug('Sending request to OpenRouter API...');
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      // Log response status and headers for debugging
      console.debug('Response Status:', response.status);
      console.debug('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        throw new Error(
          `OpenRouter API error: ${response.status} - ${
            errorData.error?.message || 
            errorData.message || 
            response.statusText || 
            'Unknown error'
          }`
        );
      }

      const data = await response.json();
      
      // Log response data structure for debugging
      console.debug('Response Data Structure:', {
        hasChoices: Array.isArray(data.choices),
        choicesLength: data?.choices?.length,
        hasMessage: !!data?.choices?.[0]?.message,
        hasContent: !!data?.choices?.[0]?.message?.content
      });

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid Response Format:', data);
        throw new Error('Invalid response format from OpenRouter API');
      }

      return {
        success: true,
        result: data.choices[0].message.content,
        requiresDelegation: false
      };
    } catch (error: any) {
      // Enhanced error logging
      console.error('OpenRouter Request Failed:', {
        error: error.message,
        stack: error.stack,
        cause: error.cause
      });
      throw error; // Preserve the original error
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
