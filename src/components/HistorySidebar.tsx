import React from 'react';
import { JsonHistoryItem } from '../types';
import { Clock, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface HistorySidebarProps {
  history: JsonHistoryItem[];
  onSelect: (item: JsonHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onSelect,
  onDelete,
  onClear,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <Clock size={18} />
          <span>History</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
            <p className="text-sm">No history yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="group p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all cursor-pointer relative"
              onClick={() => onSelect(item)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 font-mono">
                {item.content.substring(0, 100)}
              </p>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClear}
            className="w-full py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};
