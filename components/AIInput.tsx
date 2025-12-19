import React, { useState, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface AIInputProps {
  onSend: (prompt: string) => void;
  isProcessing: boolean;
}

export const AIInput: React.FC<AIInputProps> = ({ onSend, isProcessing }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!prompt.trim() || isProcessing) return;
    onSend(prompt);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-50 flex justify-center">
      <div className="w-full max-w-2xl pointer-events-auto">
        <div className={`
          relative flex items-center gap-3 p-2 pl-4 rounded-2xl shadow-2xl transition-all duration-300 border backdrop-blur-xl
          ${isProcessing 
            ? 'bg-white/95 border-blue-300 shadow-blue-500/20' 
            : 'bg-white/90 border-slate-200 hover:border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'}
        `}>
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors duration-300
            ${isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}
          `}>
            <Sparkles size={16} className={isProcessing ? 'animate-spin' : ''} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-500 text-sm font-medium h-10 min-w-0 outline-none"
            placeholder={isProcessing ? "Generating content..." : "Ask AI to write, edit, or insert a chart..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isProcessing}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isProcessing}
            className={`
              p-2.5 rounded-xl transition-all duration-200 shrink-0
              ${prompt.trim() && !isProcessing 
                ? 'bg-slate-900 text-white shadow-lg hover:bg-black hover:scale-105 active:scale-95' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
            `}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};