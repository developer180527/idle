import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = 'python' }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Optional: Configure monaco further here
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a', // Match app background
      },
    });
    monaco.editor.setTheme('custom-dark');
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          padding: { top: 16, bottom: 16 },
          fixedOverflowWidgets: true,
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};