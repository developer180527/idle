export interface VirtualFile {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

export type FileSystem = Record<string, VirtualFile>;

export interface LogEntry {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'info';
  content: string;
  timestamp: number;
}

export enum EditorTheme {
  VS_DARK = 'vs-dark',
  LIGHT = 'light',
}

export interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>;
  runPython: (code: string) => any;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  loadPackage: (packages: string[]) => Promise<void>;
  globals: any;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}