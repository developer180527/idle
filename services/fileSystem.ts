import { VirtualFile, FileSystem } from '../types';
import { INITIAL_FILES } from '../constants';

const STORAGE_KEY = 'pypad_vfs_v1';

export const loadFileSystem = (): FileSystem => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load file system:", e);
  }

  // Initialize with defaults if empty
  const initialFS: FileSystem = {};
  INITIAL_FILES.forEach(file => {
    initialFS[file.id] = file;
  });
  return initialFS;
};

export const saveFileSystem = (fs: FileSystem) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {
    console.error("Failed to save file system:", e);
  }
};

export const createNewFile = (name: string): VirtualFile => {
  return {
    id: `file-${Date.now()}`,
    name: name.endsWith('.py') ? name : `${name}.py`,
    content: '# New Python File\n',
    language: 'python',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};