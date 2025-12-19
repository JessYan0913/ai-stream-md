import React, { useMemo, useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { ChartRenderer } from './ChartRenderer';
import { ChartVisualEditor } from './ChartVisualEditor';
import { ChartData } from '../types';
import { Eye, Code, BarChart2, Edit3 } from 'lucide-react';

type ViewMode = 'preview' | 'visual-edit' | 'json-edit';

// Consolidated ChartNodeView Component
export const ChartNodeView: React.FC<any> = ({ node, updateAttributes, editor, getPos }) => {
  const isChart = node.attrs.language === 'chart';
  const [mode, setMode] = useState<ViewMode>('preview');

  const chartConfig: ChartData | null = useMemo(() => {
    if (!isChart) return null;
    try {
      const textContent = node.textContent;
      return JSON.parse(textContent);
    } catch (e) {
      return null;
    }
  }, [node.textContent, isChart]);

  const handleSave = (newConfig: ChartData) => {
    if (editor && typeof getPos === 'function') {
        const jsonString = JSON.stringify(newConfig, null, 2);
        const pos = getPos();
        
        // Replace the content of the node safely
        editor.chain().focus().command(({ tr, dispatch }: any) => {
            if (dispatch) {
                const start = pos + 1;
                const end = pos + 1 + node.content.size;
                tr.insertText(jsonString, start, end);
                return true;
            }
            return false;
        }).run();
        
        setMode('preview');
    }
  };

  if (!isChart) {
    return (
      <NodeViewWrapper className="code-block my-4 relative group">
         <div className="absolute right-2 top-2 px-2 py-1 text-xs text-slate-400 bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {node.attrs.language || 'text'}
        </div>
        <pre className="bg-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-200">
          <NodeViewContent />
        </pre>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="chart-block-wrapper my-8 relative border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 rounded-t-xl">
        <div className="flex items-center gap-2 text-slate-600">
          <BarChart2 size={16} className="text-blue-500"/>
          <span className="text-xs font-semibold uppercase tracking-wider">Interactive Chart</span>
        </div>
        
        <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
            <button 
              onClick={() => setMode('preview')}
              className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${mode === 'preview' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eye size={14} /> Preview
            </button>
            <button 
              onClick={() => setMode('visual-edit')}
              className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${mode === 'visual-edit' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={14} /> Edit Data
            </button>
            <button 
              onClick={() => setMode('json-edit')}
              className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${mode === 'json-edit' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Code size={14} /> JSON
            </button>
        </div>
      </div>

      <div className="relative">
        
        {/* Preview Mode */}
        {mode === 'preview' && (
          <div className="p-6 bg-white rounded-b-xl overflow-x-auto">
            <div className="min-w-[500px]">
              {chartConfig ? (
                <ChartRenderer config={chartConfig} className="border-none shadow-none p-0 my-0" />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <BarChart2 size={24} className="mb-2 opacity-50"/>
                  <span className="text-sm">Invalid Chart JSON</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Edit Mode */}
        {mode === 'visual-edit' && chartConfig && (
            <ChartVisualEditor 
                initialConfig={chartConfig}
                onCancel={() => setMode('preview')}
                onSave={handleSave}
            />
        )}
        
        {/* JSON Edit Mode (and helper for Tiptap state) */}
        <div className={mode === 'json-edit' ? 'block' : 'hidden'}>
           <pre className="bg-[#f8fafc] m-0 p-6 text-sm font-mono text-slate-700 overflow-x-auto border-t border-slate-100 rounded-b-xl">
             <NodeViewContent />
           </pre>
        </div>
      </div>
    </NodeViewWrapper>
  );
};