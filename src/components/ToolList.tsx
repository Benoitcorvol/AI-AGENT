import React, { useState } from 'react';
import { Plus, Wrench, Type, Hash, Calendar, ToggleLeft, List, FileText, AlertCircle } from 'lucide-react';
import { Tool as ToolType } from '../types/agent';
import { ToolForm } from './ToolForm';
import { toolDb } from '../db/database';

interface ToolListProps {
  tools: ToolType[];
  isLoading: boolean;
  onEditTool: (tool: ToolType) => void;
  onDeleteTool: (id: string) => void;
}

const getParameterIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'string':
      return <Type className="w-3 h-3" />;
    case 'number':
      return <Hash className="w-3 h-3" />;
    case 'date':
      return <Calendar className="w-3 h-3" />;
    case 'boolean':
      return <ToggleLeft className="w-3 h-3" />;
    case 'array':
      return <List className="w-3 h-3" />;
    case 'object':
      return <FileText className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

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
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
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
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-200 h-10 w-10"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))
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
            <div key={tool.id} className="group relative bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors duration-300 transform group-hover:scale-110">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{tool.name}</h3>
                    <span className="text-xs text-gray-500">ID: {tool.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
                {tool.description}
              </p>
              
              {tool.parameters.length > 0 && (
                <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Parameters
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {tool.parameters.map((param, index) => (
                      <li key={index} className="flex items-center gap-2 bg-white rounded-md p-2 shadow-sm">
                        <span className="text-gray-400">
                          {getParameterIcon(param.type)}
                        </span>
                        <span className="font-medium">{param.name}</span>
                        <span className="text-xs text-gray-400">({param.type})</span>
                        {param.required && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">Required</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
                <button
                  onClick={() => handleEditClick(tool)}
                  className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteTool(tool.id)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
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
