import React, { useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough,
  List, 
  ListOrdered,
  CheckSquare, 
  Code, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  BarChart2,
  Undo,
  Redo,
  Table as TableIcon,
  ChevronDown,
  Info,
  Lightbulb,
  AlertTriangle,
  XCircle,
  Quote,
  Minus
} from 'lucide-react';
import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => forceUpdate({});
    
    // Subscribe to editor updates
    editor.on('transaction', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  // Helper for applying commands
  const run = (cmd: (chain: any) => any) => cmd(editor.chain().focus()).run();

  const setHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'p') run(chain => chain.setParagraph());
    else if (['h1', 'h2', 'h3'].includes(value)) run(chain => chain.toggleHeading({ level: parseInt(value.replace('h', '')) }));
  };

  const setAlertType = (type: string | null) => {
    if (type === 'quote') run(chain => chain.setBlockquote().updateAttributes('blockquote', { alertType: null }));
    else run(chain => chain.setBlockquote().updateAttributes('blockquote', { alertType: type }));
  };

  const insertChart = () => {
    run(chain => chain.setCodeBlock({ language: 'chart' }).insertContent(
`{
  "type": "bar",
  "title": "New Chart",
  "xAxisKey": "name",
  "dataKeys": ["value"],
  "data": [
    { "name": "A", "value": 100 },
    { "name": "B", "value": 200 }
  ]
}`));
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      run(chain => chain.extendMarkRange('link').unsetLink());
      return;
    }

    // update
    run(chain => chain.extendMarkRange('link').setLink({ href: url }));
  };

  const Button = ({ onClick, isActive, icon: Icon, title, disabled = false }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-200 
        ${disabled ? 'opacity-30 cursor-not-allowed text-slate-400' : 
          isActive 
            ? 'bg-slate-200 text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
    >
      <Icon size={16} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="sticky top-14 z-40 mx-auto w-full max-w-[850px] mb-6 pt-4 transition-all">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-xl px-2 py-2 flex items-center gap-1 transition-all flex-wrap">
        
        {/* Group 1: History */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-100">
          <Button onClick={() => run(c => c.undo())} disabled={!(editor.can() as any).undo()} icon={Undo} title="Undo" />
          <Button onClick={() => run(c => c.redo())} disabled={!(editor.can() as any).redo()} icon={Redo} title="Redo" />
        </div>

        {/* Group 2: Styles */}
        <div className="flex items-center gap-2 px-2 border-r border-slate-100">
          <div className="relative group">
            <select 
              onChange={setHeading} 
              className="appearance-none bg-transparent hover:bg-slate-50 text-slate-700 text-sm font-bold rounded px-2 py-1 pr-6 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
            >
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          </div>
        </div>

        {/* Group 3: Formatting */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-100">
          <Button onClick={() => run(c => c.toggleBold())} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
          <Button onClick={() => run(c => c.toggleItalic())} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
          <Button onClick={() => run(c => c.toggleStrike())} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
          <Button onClick={() => run(c => c.toggleCode())} isActive={editor.isActive('code')} icon={Code} title="Inline Code" />
          <Button onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
        </div>

        {/* Group 4: Alignment */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-100 hidden sm:flex">
          <Button onClick={() => run(c => c.setTextAlign('left'))} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" />
          <Button onClick={() => run(c => c.setTextAlign('center'))} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Align Center" />
          <Button onClick={() => run(c => c.setTextAlign('right'))} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" />
          <Button onClick={() => run(c => c.setTextAlign('justify'))} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} title="Align Justify" />
        </div>

        {/* Group 5: Lists */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-100">
          <Button onClick={() => run(c => c.toggleBulletList())} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
          <Button onClick={() => run(c => c.toggleOrderedList())} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
          <Button onClick={() => run(c => c.toggleTaskList())} isActive={editor.isActive('taskList')} icon={CheckSquare} title="Task List" />
        </div>

        {/* Group 6: Inserts */}
        <div className="flex items-center gap-0.5 pl-2">
           {/* Smart Alert Dropdown */}
          <div className="relative group">
            <button className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`} title="Insert Alert">
              <Quote size={16} strokeWidth={2.5} />
              <ChevronDown size={10} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden hidden group-hover:block z-50 p-1">
              <button onClick={() => setAlertType('quote')} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors">
                <Quote size={14} /> Quote
              </button>
              <button onClick={() => setAlertType('note')} className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors">
                <Info size={14} /> Note
              </button>
              <button onClick={() => setAlertType('tip')} className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2 transition-colors">
                <Lightbulb size={14} /> Tip
              </button>
              <button onClick={() => setAlertType('warning')} className="w-full text-left px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2 transition-colors">
                <AlertTriangle size={14} /> Warning
              </button>
              <button onClick={() => setAlertType('caution')} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
                <XCircle size={14} /> Caution
              </button>
            </div>
          </div>

          <Button onClick={() => run(c => c.toggleCodeBlock())} isActive={editor.isActive('codeBlock')} icon={Code} title="Code Block" />
          <Button onClick={() => (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} isActive={editor.isActive('table')} icon={TableIcon} title="Insert Table" />
          <Button onClick={insertChart} isActive={false} icon={BarChart2} title="Insert Chart" />
          <Button onClick={() => run(c => c.setHorizontalRule())} icon={Minus} title="Horizontal Rule" />
        </div>
      </div>
    </div>
  );
};