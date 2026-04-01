import React from 'react';
import { 
  FileJson, 
  FileCode, 
  Minimize2, 
  Maximize2, 
  Copy, 
  Download, 
  Trash2, 
  Wand2,
  SortAsc, 
  Search, 
  Sun, 
  Moon,
  History,
  Settings,
  Share2,
  Globe,
  Code2,
  GitCompare
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onSort: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onConvertYaml: () => void;
  onRemoveEmpty: () => void;
  onToggleTheme: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onShare: () => void;
  onApiFetch: () => void;
  activeTab: 'editor' | 'tree' | 'diff';
  setActiveTab: (tab: 'editor' | 'tree' | 'diff') => void;
  theme: 'dark' | 'light';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onMinify,
  onSort,
  onClear,
  onCopy,
  onDownload,
  onConvertYaml,
  onRemoveEmpty,
  onToggleTheme,
  onToggleHistory,
  onToggleSettings,
  onShare,
  onApiFetch,
  activeTab,
  setActiveTab,
  theme,
}) => {
  const Button = ({ onClick, icon: Icon, label, title, className }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
        className
      )}
    >
      <Icon size={16} />
      {label && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <FileJson size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">JSON Master</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Format, Validate & Transform</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onToggleHistory} icon={History} title="History" />
          <Button onClick={onToggleSettings} icon={Settings} title="Settings" />
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button 
            onClick={onToggleTheme} 
            icon={theme === 'dark' ? Sun : Moon} 
            title={theme === 'dark' ? "Light Mode" : "Dark Mode"} 
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'editor' 
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'tree' 
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            Tree View
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === 'diff' 
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            Diff Viewer
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button onClick={onFormat} icon={Maximize2} label="Format" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" />
          <Button onClick={onMinify} icon={Minimize2} label="Minify" />
          <Button onClick={onSort} icon={SortAsc} label="Sort Keys" />
          <Button onClick={onRemoveEmpty} icon={Wand2} label="Clean JSON" className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button onClick={onConvertYaml} icon={Code2} label="YAML" />
          <Button onClick={onApiFetch} icon={Globe} label="Fetch API" />
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button onClick={onCopy} icon={Copy} title="Copy to Clipboard" />
          <Button onClick={onDownload} icon={Download} title="Download JSON" />
          <Button onClick={onShare} icon={Share2} title="Share Link" />
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button onClick={onClear} icon={Trash2} label="Clear All" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" />
        </div>
      </div>
    </div>
  );
};
