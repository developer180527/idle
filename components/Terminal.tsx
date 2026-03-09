import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon, XCircle, Eraser, ChevronDown, ChevronUp } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
  isRunning: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  logs, 
  onClear, 
  isRunning, 
  isOpen = true, 
  onToggle 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs change, but only if we are already near the bottom
  // to avoid annoying the user if they are reading history.
  useEffect(() => {
    const container = containerRef.current;
    if (container && isOpen) {
      // Check if user is near bottom (within 100px) or if it's the very first logs
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom || logs.length < 5) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs, isOpen]);

  return (
    <div className="flex flex-col h-full bg-black text-gray-300 font-mono text-sm border-t border-gray-800">
      <div 
        className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 select-none cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-300">Console</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 ml-2 text-xs text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Clear Console"
          >
            <Eraser size={14} /> Clear
          </button>
          {onToggle && (
            <button
              className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white transition-colors"
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>

      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-1 ${!isOpen ? 'hidden' : ''}`} 
        ref={containerRef}
      >
        {logs.length === 0 && (
          <div className="text-gray-600 italic">No output yet. Run your code to see results.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="whitespace-pre-wrap break-words leading-relaxed animate-in fade-in duration-200 font-mono">
            {log.type === 'stdout' && <span className="text-gray-300">{log.content}</span>}
            {log.type === 'stderr' && <span className="text-red-400 bg-red-900/10 px-1 rounded">{log.content}</span>}
            {log.type === 'system' && <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider block mt-2 mb-1">[{log.content}]</span>}
            {log.type === 'info' && <span className="text-gray-500 italic">{log.content}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};