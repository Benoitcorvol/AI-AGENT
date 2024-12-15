import React from 'react';
import { MoreVertical } from 'lucide-react';

interface AgentCardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function AgentCardMenu({ onEdit, onDelete }: AgentCardMenuProps) {
  return (
    <div className="relative group">
      <button className="p-1 rounded-full hover:bg-gray-100">
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
        <button
          onClick={onEdit}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Edit Agent
        </button>
        <button
          onClick={onDelete}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Delete Agent
        </button>
      </div>
    </div>
  );
}