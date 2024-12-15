import React, { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { AgentFactory } from '../services/agentFactory';
import { AgentCreationRequest, AgentCreationResult } from '../types/agentFactory';
import { Agent } from '../types/agent';

interface AgentCreatorProps {
  onAgentsCreated: (agents: Agent[]) => void;
}

export function AgentCreator({ onAgentsCreated }: AgentCreatorProps) {
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<AgentCreationResult | null>(null);

  const handleCreateAgents = async () => {
    setIsCreating(true);
    try {
      const factory = new AgentFactory();
      const request: AgentCreationRequest = {
        userPrompt: prompt,
        preferredModel: 'gpt-4',
        maxAgents: 5
      };

      const result = await factory.createAgentSystem(request);
      setResult(result);
      onAgentsCreated([result.mainAgent, ...result.subAgents]);
    } catch (error) {
      console.error('Failed to create agents:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Brain className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">AI Agent Creator</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe Your Task
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe what you want to accomplish, and I'll create the appropriate AI agents to help you..."
          />
        </div>

        <button
          onClick={handleCreateAgents}
          disabled={isCreating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Creating Agents...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create AI Agents
            </>
          )}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Created Agents</h3>
            <div className="grid gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="font-medium text-indigo-900">Main Agent</div>
                <div className="text-sm text-indigo-700">{result.mainAgent.name}</div>
              </div>
              {result.subAgents.map((agent) => (
                <div key={agent.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">Sub Agent</div>
                  <div className="text-sm text-gray-700">{agent.name}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Suggested Workflow</h4>
              <div className="space-y-2">
                {result.suggestedWorkflow.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-700">
                      {index + 1}
                    </span>
                    {step.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}