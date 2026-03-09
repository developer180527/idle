import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '../services/geminiService';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { Button } from './Button';

interface AIAssistantProps {
  currentCode: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ currentCode, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I\'m your coding assistant. Ask me to explain the code or help fix a bug.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await askGemini(input, currentCode);
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response
    }]);
    setIsLoading(false);
  };

  const quickActions = [
    "Explain this code",
    "Find bugs",
    "Optimize",
    "Add comments"
  ];

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full shadow-2xl z-20 absolute right-0 top-0 bottom-0 md:relative md:shadow-none">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
        <h3 className="text-gray-200 font-semibold flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" /> AI Assistant
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200 border border-gray-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm ml-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {quickActions.map(action => (
                <button
                    key={action}
                    onClick={() => { setInput(action); handleSend(); }} // Actually send it immediately for better UX? Or just fill input. Let's fill input.
                    className="whitespace-nowrap px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-purple-300 transition-colors"
                >
                    {action}
                </button>
            ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your code..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};