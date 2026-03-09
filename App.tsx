import React, { useState, useEffect, useCallback } from 'react';
import { Play, Download, Settings, Sidebar as SidebarIcon, MessageSquare } from 'lucide-react';

import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/Editor';
import { Terminal } from './components/Terminal';
import { AIAssistant } from './components/AIAssistant';
import { Button } from './components/Button';

import { FileSystem, VirtualFile, LogEntry } from './types';
import { loadFileSystem, saveFileSystem, createNewFile } from './services/fileSystem';
import { initializePyodide, getPyodide } from './services/pyodideService';
import { WELCOME_MESSAGE } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [files, setFiles] = useState<FileSystem>({});
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Initializing environment...');

  // --- Effects ---
  
  // Initialize System
  useEffect(() => {
    // Load Files
    const fs = loadFileSystem();
    setFiles(fs);
    const fileIds = Object.keys(fs);
    if (fileIds.length > 0) {
      setActiveFileId(fileIds[0]);
    }

    // Initialize Logs
    addLog('system', WELCOME_MESSAGE);

    // Initialize Pyodide
    const initRuntime = async () => {
      try {
        await initializePyodide(
          (text) => addLog('stdout', text),
          (text) => addLog('stderr', text)
        );
        setIsPyodideReady(true);
        setStatusMessage('Ready');
        addLog('system', 'runtime: Python environment loaded successfully.');
      } catch (err) {
        setStatusMessage('Error loading runtime');
        addLog('stderr', 'Failed to load Python runtime. Check your connection.');
        console.error(err);
      }
    };
    initRuntime();
  }, []);

  // Auto-save
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      saveFileSystem(files);
    }
  }, [files]);

  // --- Helpers ---

  const addLog = useCallback((type: LogEntry['type'], content: string) => {
    setLogs(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: Date.now()
    }]);
    
    // Auto-open terminal on new output if it's closed, unless it's just system info on startup
    if (type === 'stdout' || type === 'stderr') {
        setIsTerminalOpen(true);
    }
  }, []);

  const activeFile = activeFileId ? files[activeFileId] : null;

  // --- Handlers ---

  const handleCodeChange = (newContent: string | undefined) => {
    if (activeFileId && newContent !== undefined) {
      setFiles(prev => ({
        ...prev,
        [activeFileId]: {
          ...prev[activeFileId],
          content: newContent,
          updatedAt: Date.now()
        }
      }));
    }
  };

  const handleRunCode = async () => {
    if (!activeFile || !isPyodideReady) return;

    setIsRunning(true);
    setIsTerminalOpen(true);
    setStatusMessage('Running...');
    addLog('system', `Run: ${activeFile.name}`);

    const pyodide = getPyodide();
    if (!pyodide) return;

    try {
      // Create a virtual file system in Pyodide for all our files
      // This allows 'import' between files
      for (const file of (Object.values(files) as VirtualFile[])) {
        if (file.name.endsWith('.py')) {
          pyodide.globals.set(file.name.replace('.py', ''), undefined); // Reset module if exists
          pyodide.runPython(`
with open("${file.name}", "w") as f:
    f.write(${JSON.stringify(file.content)})
          `);
        }
      }

      // Execute the current file
      await pyodide.runPythonAsync(activeFile.content);
      
    } catch (err: any) {
      addLog('stderr', err.toString());
    } finally {
      setIsRunning(false);
      setStatusMessage('Ready');
    }
  };

  const handleFileCreate = (name: string) => {
    const newFile = createNewFile(name);
    setFiles(prev => ({ ...prev, [newFile.id]: newFile }));
    setActiveFileId(newFile.id);
  };

  const handleFileDelete = (id: string) => {
    const newFiles = { ...files };
    delete newFiles[id];
    setFiles(newFiles);
    if (activeFileId === id) {
      const remaining = Object.keys(newFiles);
      setActiveFileId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header / Toolbar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-400">
            <span>PyPad</span>
            <span className="text-gray-100 font-light">AI</span>
          </div>
          
          <div className="h-6 w-px bg-gray-700 mx-2" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSidebar(!showSidebar)}
            className={showSidebar ? 'bg-gray-800 text-white' : ''}
            title="Toggle Sidebar"
          >
            <SidebarIcon size={18} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCode}
            disabled={!isPyodideReady || isRunning || !activeFile}
            icon={isRunning ? <span className="animate-spin text-white">⟳</span> : <Play size={16} fill="currentColor" />}
            className="min-w-[100px]"
          >
            {isRunning ? 'Running' : 'Run'}
          </Button>
        </div>

        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">
                {statusMessage}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={showAIAssistant ? 'bg-purple-900/30 text-purple-300' : 'text-gray-400 hover:text-purple-300'}
                title="AI Assistant"
            >
                <MessageSquare size={18} />
                <span className="ml-2 hidden sm:inline">Ask AI</span>
            </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {showSidebar && (
          <FileExplorer 
            files={files}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
          />
        )}

        {/* Center: Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
           {/* Editor Tabs */}
           {activeFile && (
               <div className="flex items-center bg-gray-950 border-b border-gray-800 h-9 shrink-0">
                   <div className="px-4 py-2 bg-[#0f172a] text-blue-400 text-xs border-t-2 border-blue-500 font-medium flex items-center">
                       {activeFile.name}
                   </div>
               </div>
           )}

           {/* Editor Area */}
           <div className="flex-1 relative min-h-0">
             <div className="absolute inset-0">
                {activeFile ? (
                <CodeEditor 
                    code={activeFile.content} 
                    onChange={handleCodeChange}
                />
                ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                    <p className="mb-2">No file selected</p>
                    <Button variant="secondary" onClick={() => handleFileCreate('new_script.py')}>Create New File</Button>
                    </div>
                </div>
                )}
             </div>
           </div>

           {/* Terminal Area */}
           <div 
             className={`${isTerminalOpen ? 'h-48' : 'h-10'} shrink-0 relative z-0 transition-all duration-300 ease-in-out border-t border-gray-800`}
           >
             <Terminal 
               logs={logs} 
               onClear={() => setLogs([])} 
               isRunning={isRunning}
               isOpen={isTerminalOpen}
               onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
             />
           </div>
        </div>

        {/* Right Panel: AI */}
        {showAIAssistant && (
            <AIAssistant 
                currentCode={activeFile?.content || ''}
                isOpen={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
            />
        )}
      </div>
    </div>
  );
};

export default App;