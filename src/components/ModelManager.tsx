import React, { useState, useEffect } from 'react';
import { modelDb, StoredModelConfig } from '../db/modelDb';
import { modelProviders } from '../config/modelProviders';
import { Loader2 } from 'lucide-react';

interface Props {
  onModelConfigured: () => void;
}

export function ModelManager({ onModelConfigured }: Props) {
  const [provider, setProvider] = useState(modelProviders[0]?.name || '');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelConfig, setModelConfig] = useState<StoredModelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [provider]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize providers if needed
      const configs = await modelDb.getAllModelConfigs();
      if (configs.length === 0) {
        await modelDb.initializeProviders();
      }
      
      // Load selected provider config
      const config = await modelDb.getModelConfig(provider);
      if (config) {
        setApiKey(config.apiKey);
        setBaseUrl(config.baseUrl || '');
        setModelConfig(config);
      } else {
        setApiKey('');
        setBaseUrl('');
        setModelConfig(null);
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
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await modelDb.saveModelConfig(provider, apiKey, baseUrl || undefined);
      setSuccessMessage('Configuration saved successfully');
      onModelConfigured();
      await loadConfig(); // Reload to get updated model list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save model configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const getProviderWebsite = (providerName: string) => {
    const provider = modelProviders.find(p => p.name === providerName);
    return provider?.website;
  };

  if (isLoading) {
    return (
      <div className="min-h-[12rem] flex items-center justify-center text-gray-500">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Model Configuration</h2>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setError(null);
              setSuccessMessage(null);
            }}
            className="w-full px-3 py-2 text-base sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#128C7E] transition-shadow"
          >
            {modelProviders.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          {getProviderWebsite(provider) && (
            <p className="mt-1 text-sm text-gray-500">
              Get your API key at{' '}
              <a 
                href={getProviderWebsite(provider)}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#128C7E] hover:underline"
              >
                {getProviderWebsite(provider)}
              </a>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError(null);
              setSuccessMessage(null);
            }}
            className="w-full px-3 py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C7E] transition-shadow"
            placeholder="Enter your API key"
          />
        </div>

        {modelProviders.find(p => p.name === provider)?.requiresBaseUrl && (
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Base URL {!modelProviders.find(p => p.name === provider)?.requiresBaseUrl && '(Optional)'}
            </label>
            <input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full px-3 py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C7E] transition-shadow"
              placeholder="Custom base URL (if needed)"
            />
          </div>
        )}

        {modelConfig && modelConfig.models.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Models</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {modelConfig.models.map(model => (
                <div key={model.id} className="text-sm">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({model.capabilities.join(', ')})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full px-4 py-2 bg-[#128C7E] text-white text-base sm:text-sm rounded-lg hover:bg-[#075E54] focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
