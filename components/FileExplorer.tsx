import React, { useState } from 'react';
import { VirtualFile, FileSystem } from '../types';
import { FileCode, Trash2, Plus, FolderOpen } from 'lucide-react';

interface FileExplorerProps {
  files: FileSystem;
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onFileCreate: (name: string) => void;
  onFileDelete: (id: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const fileList = (Object.values(files) as VirtualFile[]).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-gray-200 font-semibold flex items-center gap-2">
          <FolderOpen size={18} /> Explorer
        </h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
          title="New File"
        >
          <Plus size={18} />
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-gray-800 bg-gray-800/50">
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.py"
            className="w-full bg-gray-900 text-white text-sm px-2 py-1 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            onBlur={() => setIsCreating(false)}
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {fileList.map((file) => (
          <div
            key={file.id}
            className={`group flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors ${
              activeFileId === file.id
                ? 'bg-blue-900/30 text-blue-200 border-l-2 border-blue-500'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 border-l-2 border-transparent'
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <FileCode size={16} className={activeFileId === file.id ? 'text-blue-400' : 'text-gray-500'} />
              <span className="truncate">{file.name}</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if(confirm(`Delete ${file.name}?`)) onFileDelete(file.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 hover:text-red-400 rounded transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};