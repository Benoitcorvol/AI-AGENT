import React, { useState, useEffect } from 'react';
import { modelDb } from '../db/modelDb';

interface Props {
  onModelConfigured: () => void;
}

export function ModelManager({ onModelConfigured }: Props) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [provider]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const config = await modelDb.getModelConfig(provider);
      if (config) {
        setApiKey(config.apiKey);
        setBaseUrl(config.baseUrl || '');
      } else {
        setApiKey('');
        setBaseUrl('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await modelDb.saveModelConfig(provider, apiKey, baseUrl || undefined);
      onModelConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save model configuration');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your API key"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL (Optional)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Custom base URL (if needed)"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
