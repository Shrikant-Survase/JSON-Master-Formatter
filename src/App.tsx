import React, { useState, useEffect, useCallback } from 'react';
import { JsonEditor, JsonDiffViewer } from './components/JsonEditor';
import { Toolbar } from './components/Toolbar';
import { HistorySidebar } from './components/HistorySidebar';
import { JsonHistoryItem, AppSettings, JsonError } from './types';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { AlertCircle, CheckCircle2, X, Search, Globe, Code2 } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const STORAGE_KEY = 'json_master_history';
const SETTINGS_KEY = 'json_master_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  indentSize: 2,
  autoFormatOnPaste: true,
  showLineNumbers: true,
  wordWrap: 'on',
};

export default function App() {
  const [json, setJson] = useState<string>('{\n  "name": "JSON Master",\n  "version": "1.0.0",\n  "features": [\n    "Formatting",\n    "Validation",\n    "Diff Viewer",\n    "YAML Conversion"\n  ],\n  "author": {\n    "name": "Google AI Studio",\n    "email": "shrikant.survase@greytip.com"\n  }\n}');
  const [originalJson, setOriginalJson] = useState<string>('');
  const [history, setHistory] = useState<JsonHistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'editor' | 'tree' | 'diff'>('editor');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [schema, setSchema] = useState<string>('');
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [isApiOpen, setIsApiOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    // Check URL for shared JSON
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('json');
    if (shared) {
      try {
        setJson(atob(shared));
      } catch (e) {
        console.error('Failed to decode shared JSON');
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 5)));
  }, [history]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleFormat();
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handleMinify();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [json, settings.indentSize]);

  const addToHistory = useCallback((content: string) => {
    const newItem: JsonHistoryItem = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 5));
  }, []);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, settings.indentSize);
      setJson(formatted);
      addToHistory(formatted);
      setErrors([]);
    } catch (e: any) {
      setErrors([{ message: e.message }]);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(json);
      const minified = JSON.stringify(parsed);
      setJson(minified);
      addToHistory(minified);
      setErrors([]);
    } catch (e: any) {
      setErrors([{ message: e.message }]);
    }
  };

  const handleSort = () => {
    try {
      const sortObject = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sortObject);
        return Object.keys(obj)
          .sort()
          .reduce((acc: any, key) => {
            acc[key] = sortObject(obj[key]);
            return acc;
          }, {});
      };
      const parsed = JSON.parse(json);
      const sorted = sortObject(parsed);
      setJson(JSON.stringify(sorted, null, settings.indentSize));
      setErrors([]);
    } catch (e: any) {
      setErrors([{ message: e.message }]);
    }
  };

  const handleRemoveEmpty = () => {
    try {
      const cleanObject = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
          return obj
            .map(cleanObject)
            .filter(v => v !== null && v !== undefined && v !== '');
        }
        return Object.keys(obj).reduce((acc: any, key) => {
          const val = cleanObject(obj[key]);
          if (val !== null && val !== undefined && val !== '') {
            acc[key] = val;
          }
          return acc;
        }, {});
      };
      const parsed = JSON.parse(json);
      const cleaned = cleanObject(parsed);
      setJson(JSON.stringify(cleaned, null, settings.indentSize));
    } catch (e: any) {
      setErrors([{ message: e.message }]);
    }
  };

  const handleConvertYaml = () => {
    try {
      const parsed = JSON.parse(json);
      const yamlStr = yaml.dump(parsed);
      setJson(yamlStr);
    } catch (e: any) {
      // If it's already YAML, try converting back to JSON
      try {
        const parsed = yaml.load(json);
        setJson(JSON.stringify(parsed, null, settings.indentSize));
      } catch (e2: any) {
        setErrors([{ message: "Invalid JSON or YAML" }]);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    // Could add a toast here
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const encoded = btoa(json);
    const url = `${window.location.origin}${window.location.pathname}?json=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Shareable link copied to clipboard!');
  };

  const handleApiFetch = async () => {
    if (!apiUrl) return;
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      const formatted = JSON.stringify(data, null, settings.indentSize);
      setJson(formatted);
      setIsApiOpen(false);
      setApiUrl('');
    } catch (e: any) {
      alert(`Failed to fetch API: ${e.message}`);
    }
  };

  const validateSchema = () => {
    if (!schema) return;
    try {
      const parsedJson = JSON.parse(json);
      const parsedSchema = JSON.parse(schema);
      const validate = ajv.compile(parsedSchema);
      const valid = validate(parsedJson);
      if (!valid) {
        const schemaErrors = validate.errors?.map(err => ({
          message: `Schema Error: ${err.instancePath} ${err.message}`,
        })) || [];
        setErrors(prev => [...prev, ...schemaErrors]);
      } else {
        alert('JSON is valid against schema!');
      }
    } catch (e: any) {
      setErrors([{ message: `Schema Parsing Error: ${e.message}` }]);
    }
  };

  const handlePaste = (pastedText: string) => {
    if (settings.autoFormatOnPaste) {
      try {
        const parsed = JSON.parse(pastedText);
        const formatted = JSON.stringify(parsed, null, settings.indentSize);
        setJson(formatted);
      } catch (e) {
        // Not JSON, just let it be
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJson(content);
        if (settings.autoFormatOnPaste) {
          try {
            const parsed = JSON.parse(content);
            setJson(JSON.stringify(parsed, null, settings.indentSize));
          } catch (e) {}
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div 
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Toolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onSort={handleSort}
        onClear={() => setJson('')}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onConvertYaml={handleConvertYaml}
        onRemoveEmpty={handleRemoveEmpty}
        onToggleTheme={() => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        onShare={handleShare}
        onApiFetch={() => setIsApiOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'diff' && !originalJson) setOriginalJson(json);
          setActiveTab(tab);
        }}
        theme={settings.theme}
      />

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex-1 relative">
            {activeTab === 'editor' && (
              <JsonEditor
                value={json}
                onChange={(v) => setJson(v || '')}
                theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
                onValidate={setErrors}
                onPaste={handlePaste}
              />
            )}
            {activeTab === 'tree' && (
              <div className="h-full w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-auto p-4 bg-white dark:bg-zinc-900">
                {(() => {
                  try {
                    const parsed = JSON.parse(json);
                    return (
                      <JsonView 
                        data={parsed} 
                        shouldExpandNode={(level) => level < 2}
                        style={settings.theme === 'dark' ? {
                          ...defaultStyles,
                          container: 'bg-transparent',
                          label: 'text-indigo-300',
                          punctuation: 'text-zinc-500',
                          stringValue: 'text-emerald-400',
                          numberValue: 'text-amber-400',
                          booleanValue: 'text-rose-400',
                          nullValue: 'text-zinc-500',
                        } : {
                          ...defaultStyles,
                          container: 'bg-transparent',
                          label: 'text-indigo-600',
                          punctuation: 'text-zinc-400',
                          stringValue: 'text-emerald-600',
                          numberValue: 'text-amber-600',
                          booleanValue: 'text-rose-600',
                          nullValue: 'text-zinc-400',
                        }}
                      />
                    );
                  } catch (e) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <AlertCircle size={48} className="mb-4 text-red-500" />
                        <p>Invalid JSON. Cannot display tree view.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
            {activeTab === 'diff' && (
              <JsonDiffViewer
                original={originalJson}
                modified={json}
                theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
              />
            )}
          </div>

          {/* Status Bar / Errors */}
          <div className={cn(
            "p-3 rounded-lg flex items-center justify-between transition-all",
            errors.length > 0 
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" 
              : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
          )}>
            <div className="flex items-center gap-2 overflow-hidden">
              {errors.length > 0 ? (
                <>
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400 truncate">
                    {errors[0].message} {errors[0].line ? `(Line ${errors[0].line}, Col ${errors[0].column})` : ''}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    JSON is valid
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span>Lines: {json.split('\n').length}</span>
              <span>Chars: {json.length}</span>
            </div>
          </div>
        </div>

        {/* Floating Modals */}
        <AnimatePresence>
          {isApiOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Globe size={20} className="text-indigo-500" />
                    Fetch from API
                  </h3>
                  <button onClick={() => setIsApiOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Enter a URL to fetch JSON data directly into the editor.
                </p>
                <input
                  type="url"
                  placeholder="https://api.example.com/data"
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
                <div className="flex gap-3">
                  <button 
                    onClick={handleApiFetch}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Fetch Data
                  </button>
                  <button 
                    onClick={() => setIsApiOpen(false)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Editor Settings</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Indent Size</label>
                    <select 
                      value={settings.indentSize}
                      onChange={(e) => setSettings(s => ({ ...s, indentSize: Number(e.target.value) as 2 | 4 }))}
                      className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm outline-none"
                    >
                      <option value={2}>2 Spaces</option>
                      <option value={4}>4 Spaces</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Format on Paste</label>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, autoFormatOnPaste: !s.autoFormatOnPaste }))}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        settings.autoFormatOnPaste ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        settings.autoFormatOnPaste ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Word Wrap</label>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, wordWrap: s.wordWrap === 'on' ? 'off' : 'on' }))}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        settings.wordWrap === 'on' ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        settings.wordWrap === 'on' ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <HistorySidebar
          history={history}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={(item) => {
            setJson(item.content);
            setIsHistoryOpen(false);
          }}
          onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
          onClear={() => setHistory([])}
        />
      </main>

      {/* Schema Validation Panel (Collapsible) */}
      <div className={cn(
        "fixed bottom-20 right-4 w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl transition-all z-40",
        isSchemaOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Code2 size={18} className="text-indigo-500" />
            JSON Schema Validator
          </h3>
          <button onClick={() => setIsSchemaOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <textarea
            placeholder="Paste your JSON Schema here..."
            className="w-full h-40 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
          />
          <button 
            onClick={validateSchema}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Validate JSON
          </button>
        </div>
      </div>

      {/* Floating Action Button for Schema */}
      <button
        onClick={() => setIsSchemaOpen(!isSchemaOpen)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40 group"
      >
        <Code2 size={24} />
        <span className="absolute right-full mr-3 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Schema Validator
        </span>
      </button>
    </div>
  );
}
