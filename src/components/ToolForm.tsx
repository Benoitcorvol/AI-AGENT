import React from 'react';
import { X } from 'lucide-react';
import { Tool, Parameter } from '../types/agent';

interface ToolFormProps {
  onSubmit: (tool: Tool) => void;
  onClose: () => void;
  initialData?: Tool;
}

export function ToolForm({ onSubmit, onClose, initialData }: ToolFormProps) {
  const [formData, setFormData] = React.useState<Partial<Tool>>({
    name: '',
    description: '',
    parameters: [],
    ...initialData,
  });

  const [newParameter, setNewParameter] = React.useState<Partial<Parameter>>({
    name: '',
    type: 'string',
    description: '',
    required: false,
  });

  const addParameter = () => {
    if (newParameter.name && newParameter.type) {
      setFormData({
        ...formData,
        parameters: [
          ...(formData.parameters || []),
          { ...newParameter as Parameter },
        ],
      });
      setNewParameter({
        name: '',
        type: 'string',
        description: '',
        required: false,
      });
    }
  };

  const removeParameter = (index: number) => {
    setFormData({
      ...formData,
      parameters: formData.parameters?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      parameters: formData.parameters || [],
    } as Tool);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Tool' : 'Create New Tool'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <form id="tool-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-24"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Parameters</h3>
              </div>

              <div className="space-y-4">
                {formData.parameters?.map((param, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <div className="font-medium">{param.name}</div>
                      <div className="text-sm text-gray-500">
                        {param.type} {param.required && '(required)'} - {param.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParameter(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Parameter name"
                      value={newParameter.name}
                      onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <select
                      value={newParameter.type}
                      onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value as Parameter['type'] })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Parameter description"
                      value={newParameter.description}
                      onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newParameter.required}
                        onChange={(e) => setNewParameter({ ...newParameter, required: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Required parameter</span>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={addParameter}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Add Parameter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tool-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {initialData ? 'Update Tool' : 'Create Tool'}
          </button>
        </div>
      </div>
    </div>
  );
}