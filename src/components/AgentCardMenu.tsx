import React from 'react';
import { Edit, Trash2, Copy } from 'lucide-react';

export interface AgentCardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function AgentCardMenu({ onEdit, onDelete, onDuplicate }: AgentCardMenuProps) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
      <div className="p-1">
        <button
          onClick={onEdit}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Agent
        </button>
        <button
          onClick={onDuplicate}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicate Agent
        </button>
        <button
          onClick={onDelete}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Agent
        </button>
      </div>
    </div>
  );
}
