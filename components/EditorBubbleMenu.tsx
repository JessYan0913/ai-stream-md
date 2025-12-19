import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Trash2,
  Minus
} from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!editor.isActive('table')) {
      setPosition(null);
      return;
    }

    const { from } = editor.state.selection;
    
    // Get viewport coordinates of the cursor
    const coords = editor.view.coordsAtPos(from);
    
    // Position menu 50px above the cursor line
    setPosition({
      top: coords.top - 50,
      left: coords.left
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Listen to editor state changes
    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', updatePosition);
    editor.on('focus', updatePosition);
    editor.on('transaction', updatePosition);

    // Listen to scroll events to keep the menu attached (capture phase for inner scrollers)
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Initial check
    updatePosition();

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('blur', updatePosition);
      editor.off('focus', updatePosition);
      editor.off('transaction', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [editor, updatePosition]);

  if (!editor || !position) return null;

  return (
    <div 
      className="fixed z-50 flex items-center gap-1 p-1 bg-white border border-slate-200 shadow-xl rounded-lg -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
    >
      <button 
        onClick={() => (editor.chain().focus() as any).addRowBefore().run()} 
        className="p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" 
        title="Insert Row Before"
      >
        <ArrowUp size={16}/>
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).addRowAfter().run()} 
        className="p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" 
        title="Insert Row After"
      >
        <ArrowDown size={16}/>
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).addColumnBefore().run()} 
        className="p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" 
        title="Insert Column Before"
      >
        <ArrowLeft size={16}/>
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).addColumnAfter().run()} 
        className="p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" 
        title="Insert Column After"
      >
        <ArrowRight size={16}/>
      </button>
      
      <div className="w-px h-4 bg-slate-200 mx-1" />
      
      <button 
        onClick={() => (editor.chain().focus() as any).deleteRow().run()} 
        className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors" 
        title="Delete Row"
      >
        <Trash2 size={16}/>
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).deleteColumn().run()} 
        className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors" 
        title="Delete Column"
      >
        <div className="relative">
             <Trash2 size={16}/>
             {/* Small visual cue to differentiate column delete */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-current opacity-30 rotate-90" />
        </div>
      </button>
    </div>
  );
};