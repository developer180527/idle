import { PyodideInterface } from '../types';

let pyodideInstance: PyodideInterface | null = null;
let isInitializing = false;

type OutputCallback = (text: string) => void;

export const initializePyodide = async (
  onStdout: OutputCallback,
  onStderr: OutputCallback
): Promise<PyodideInterface> => {
  if (pyodideInstance) return pyodideInstance;
  if (isInitializing) {
    // Wait for existing initialization
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
      if (pyodideInstance) return pyodideInstance;
    }
  }

  isInitializing = true;

  try {
    if (!window.loadPyodide) {
      throw new Error("Pyodide script not loaded. Check index.html");
    }

    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });

    // Configure standard streams
    pyodide.setStdout({ batched: (text) => onStdout(text) });
    pyodide.setStderr({ batched: (text) => onStderr(text) });

    // Load common packages useful for teaching
    // await pyodide.loadPackage(['numpy', 'pandas']); // Optional: Makes load slower, enable if needed

    pyodideInstance = pyodide;
    return pyodide;
  } finally {
    isInitializing = false;
  }
};

export const getPyodide = (): PyodideInterface | null => pyodideInstance;

export const resetContext = async () => {
  if (!pyodideInstance) return;
  // Basic reset of globals - in a real IDE we might reload the worker
  pyodideInstance.runPython(`
    globals().clear()
  `);
};