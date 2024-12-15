import React from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Tool } from '../types/agent';

interface ToolSelectorProps {
  selectedTools: Tool[];
  availableTools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
}

export function ToolSelector({ selectedTools, availableTools, onToolsChange }: ToolSelectorProps) {
  const handleToolSelect = (toolId: string, checked: boolean) => {
    if (checked) {
      const toolToAdd = availableTools.find(t => t.id === toolId);
      if (toolToAdd) {
        onToolsChange([...selectedTools, toolToAdd]);
      }
    } else {
      onToolsChange(selectedTools.filter(t => t.id !== toolId));
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Tools</label>

      <div className="border rounded-lg p-4 space-y-3">
        {availableTools.length === 0 ? (
          <div className="text-sm text-gray-500 text-center">
            No tools available. Create some tools first.
          </div>
        ) : availableTools.map(tool => (
          <div key={tool.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              id={`tool-${tool.id}`}
              checked={selectedTools.some(t => t.id === tool.id)}
              onChange={(e) => handleToolSelect(tool.id, e.target.checked)}
              className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor={`tool-${tool.id}`} className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{tool.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
            </label>
          </div>
        ))}
        
        {availableTools.length > 0 && selectedTools.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Tools:</div>
            <div className="space-y-2">
              {selectedTools.map(tool => (
                <div key={tool.id} className="text-sm text-gray-600 flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-indigo-600" />
                  {tool.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}