import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Tool as ToolType } from '../types/agent';
import { ToolForm } from './ToolForm';
import { toolDb } from '../db/database';

interface ToolListProps {
  tools: ToolType[];
  isLoading: boolean;
  onEditTool: (tool: ToolType) => void;
  onDeleteTool: (id: string) => void;
}

export function ToolList({ tools, isLoading, onEditTool, onDeleteTool }: ToolListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolType | undefined>();

  const handleSubmitTool = async (toolData: ToolType) => {
    try {
      if (editingTool) {
        await toolDb.updateTool(toolData);
        onEditTool(toolData);
      } else {
        const newTool = await toolDb.createTool(toolData);
        onEditTool(newTool);
      }
      setShowForm(false);
      setEditingTool(undefined);
    } catch (error) {
      console.error('Failed to save tool:', error);
    }
  };

  const handleEditClick = (tool: ToolType) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Tools</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Tool
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="space-y-3">
                <div className="h-2 w-48 bg-slate-200 rounded"></div>
                <div className="h-2 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : tools.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools yet</h3>
            <p className="text-gray-500">Create your first tool to get started</p>
          </div>
        ) : (
          tools.map(tool => (
            <div key={tool.id} className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(tool)}
                    className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTool(tool.id)}
                    className="text-sm text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-2">{tool.description}</p>
              
              {tool.parameters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Parameters:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tool.parameters.map((param, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-gray-400">({param.type})</span>
                        {param.required && <span className="text-red-500">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <ToolForm
          onSubmit={handleSubmitTool}
          onClose={() => {
            setShowForm(false);
            setEditingTool(undefined);
          }}
          initialData={editingTool}
        />
      )}
    </div>
  );
}