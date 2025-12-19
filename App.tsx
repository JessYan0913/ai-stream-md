import React, { useState, useCallback } from 'react';
import { TiptapEditor } from './components/TiptapEditor';
import { Toolbar } from './components/Toolbar';
import { AIInput } from './components/AIInput';
import { FileText, Download, Share } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { useAIEditor } from './hooks/useAIEditor';

const INITIAL_DOC = `# 2025 Platform Sales Analysis

> [!NOTE]
> This report aims to summarize and analyze the e-commerce platform's sales performance for the year 2025 (Jan-Dec).

## 1. Report Overview
2025 was a year full of challenges and opportunities for this e-commerce platform. Through deep analysis of sales data, user behavior, and market trends, this report details the overall performance.

## 2. Key Sales Indicators
In 2025, the platform achieved significant growth across various metrics.

| Metric | 2024 (YoY) | 2025 (Current) | Growth |
| :--- | :--- | :--- | :--- |
| **Total GMV** | ¥9.6 billion | ¥12.0 billion | **+25%** |
| **Active Users** | 42.3 million | 50.1 million | **+18.4%** |
| **AOV** | ¥248 | ¥250 | **+0.8%** |

> [!TIP]
> Focus on user retention strategies for Q3 2026 based on the AOV data.

These figures indicate the platform maintained strong momentum in market competition. 

## 3. Monthly Sales Trend
Sales showed a steady upward trend throughout the year, with outstanding performance during holidays and promotions.

\`\`\`chart
{
  "type": "area",
  "title": "2025 Monthly Sales Trend",
  "xAxisKey": "month",
  "dataKeys": ["sales"],
  "colors": ["#3b82f6"],
  "data": [
    { "month": "Jan", "sales": 800 },
    { "month": "Feb", "sales": 950 },
    { "month": "Mar", "sales": 1100 },
    { "month": "Apr", "sales": 1050 },
    { "month": "May", "sales": 1300 },
    { "month": "Jun", "sales": 1600 },
    { "month": "Jul", "sales": 1400 },
    { "month": "Aug", "sales": 1500 },
    { "month": "Sep", "sales": 1700 },
    { "month": "Oct", "sales": 1800 },
    { "month": "Nov", "sales": 2400 },
    { "month": "Dec", "sales": 2100 }
  ]
}
\`\`\`
`;

const App: React.FC = () => {
  const [content, setContent] = useState<string>(INITIAL_DOC);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  // Use custom hook for AI logic
  const { isProcessing, requestEdit } = useAIEditor(content, setContent, editorInstance);

  // Memoized handlers
  const handleEditorChange = useCallback((newMarkdown: string) => {
    setContent(newMarkdown);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report_2025.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-32">
      
      {/* Top Header - Sticky */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
               <FileText size={18} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col justify-center">
               <span className="font-serif font-bold tracking-tight text-lg text-slate-800 leading-none">MDX AI</span>
               <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none mt-0.5">Editor</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition-transform active:scale-95">
              <Share size={14} /> Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-[850px] mx-auto pt-8 px-4 sm:px-6">
        
        {/* Toolbar - Sticky relative to Main */}
        <Toolbar editor={editorInstance} />

        {/* The "Paper" */}
        <div className="bg-white shadow-[0_2px_40px_-5px_rgba(0,0,0,0.05)] border border-slate-200/60 rounded-xl min-h-[calc(100vh-200px)] flex flex-col transition-shadow hover:shadow-[0_8px_40px_-5px_rgba(0,0,0,0.08)]">
          <div className="flex-grow px-8 py-12 md:px-16 cursor-text" onClick={() => editorInstance?.commands.focus()}>
            <TiptapEditor 
              content={content} 
              onChange={handleEditorChange}
              onEditorReady={setEditorInstance}
            />
          </div>
          
          <div className="py-6 border-t border-slate-50 text-center">
             <span className="text-slate-300 text-xs font-medium uppercase tracking-widest">End of Document</span>
          </div>
        </div>
      </main>

      {/* AI Input - Fixed Bottom */}
      <AIInput 
        onSend={requestEdit} 
        isProcessing={isProcessing} 
      />

    </div>
  );
};

export default App;