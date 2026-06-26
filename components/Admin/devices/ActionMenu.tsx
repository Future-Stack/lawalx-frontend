import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Device } from './types';

type ActionMenuProps = {
  device: Device;
  onAction: (action: string, device: Device) => void;
};

export const ActionMenu: React.FC<ActionMenuProps> = ({ device, onAction }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction('View Details', device);
        }}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
        title="View Details"
      >
        <Eye className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction('Delete Client', device);
        }}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer"
        title="Delete Device"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ActionMenu;
