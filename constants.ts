import { VirtualFile } from './types';

export const INITIAL_FILES: VirtualFile[] = [
  {
    id: 'main-py',
    name: 'main.py',
    language: 'python',
    content: `import sys

def greet(name):
    return f"Hello, {name}! Welcome to PyPad AI."

print(greet("Student"))
print(f"Python version: {sys.version}")

# Try creating a list comprehension
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")
`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'utils-py',
    name: 'math_utils.py',
    language: 'python',
    content: `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

# Example usage (printed when run)
if __name__ == "__main__":
    print(f"Fibonacci(6) = {fibonacci(6)}")
    print(f"Factorial(5) = {factorial(5)}")
`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const WELCOME_MESSAGE = `
Welcome to PyPad AI! 🐍
-----------------------------------
- This is a client-side Python environment.
- Code runs directly in your browser using WebAssembly.
- Files are saved automatically to your browser storage.
- Use the AI Assistant for code explanations and debugging.

Ready to code?
`;