import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, DiffEditor } from '@monaco-editor/react';
import { JsonError } from '../types';

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  theme: 'vs-dark' | 'light';
  language?: 'json' | 'yaml';
  readOnly?: boolean;
  onValidate?: (errors: JsonError[]) => void;
  onPaste?: (value: string) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  theme,
  language = 'json',
  readOnly = false,
  onValidate,
  onPaste,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Custom paste handling for auto-format
    if (onPaste) {
      editor.onDidPaste((e: any) => {
        const pastedText = editor.getModel()?.getValueInRange(e.range);
        if (pastedText) {
          onPaste(pastedText);
        }
      });
    }
  };

  const handleEditorValidation = (markers: any[]) => {
    if (onValidate) {
      const errors: JsonError[] = markers
        .filter(m => m.severity === 8) // Error severity
        .map(m => ({
          message: m.message,
          line: m.startLineNumber,
          column: m.startColumn,
        }));
      onValidate(errors);
    }
  };

  return (
    <div className="h-full w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        theme={theme}
        onChange={onChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

interface JsonDiffEditorProps {
  original: string;
  modified: string;
  theme: 'vs-dark' | 'light';
}

export const JsonDiffViewer: React.FC<JsonDiffEditorProps> = ({
  original,
  modified,
  theme,
}) => {
  return (
    <div className="h-full w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <DiffEditor
        height="100%"
        original={original}
        modified={modified}
        language="json"
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: true,
          renderSideBySide: true,
        }}
      />
    </div>
  );
};
