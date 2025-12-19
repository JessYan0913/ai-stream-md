import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { ChartNodeView } from './ChartNodeView';
import { BlockquoteNodeView } from './BlockquoteNodeView';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownConverter';
import { TiptapEditorProps } from '../types';

// Static extension definition to avoid re-creation on render
const createExtensions = () => [
  StarterKit.configure({
    codeBlock: false,
    blockquote: false,
    heading: { levels: [1, 2, 3] },
    dropcursor: { color: '#3b82f6', width: 2 },
  }),
  Typography,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'not-prose pl-2',
    },
  }),
  TaskItem.configure({
    nested: true,
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: { class: 'min-w-full' },
  }),
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({ placeholder: 'Type "/" for commands...' }),
  CodeBlock.extend({
    addNodeView() { return ReactNodeViewRenderer(ChartNodeView); },
  }).configure({ defaultLanguage: 'plaintext' }),
  Blockquote.extend({
    addAttributes() {
      return {
        alertType: {
          default: null,
          parseHTML: element => element.getAttribute('data-alert-type'),
          renderHTML: attributes => attributes.alertType ? { 'data-alert-type': attributes.alertType } : {},
        },
      };
    },
    addNodeView() { return ReactNodeViewRenderer(BlockquoteNodeView); },
  }),
];

const TiptapEditorInternal: React.FC<TiptapEditorProps> = ({ 
  content, 
  onChange, 
  onEditorReady,
  className 
}) => {
  const extensions = useMemo(() => createExtensions(), []);
  
  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: `prose prose-report max-w-none focus:outline-none break-words min-h-[500px] ${className || ''}`,
      },
    },
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Expose editor instance
  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync content from AI or external sources
  useEffect(() => {
    if (editor && !editor.isFocused) {
       const currentMarkdown = htmlToMarkdown(editor.getHTML());
       // Only update if content has materially changed and editor is not focused (to prevent overwriting active typing)
       if (content !== currentMarkdown) {
         editor.commands.setContent(markdownToHtml(content), { emitUpdate: false });
       }
    }
  }, [content, editor]);

  return (
    <div className="tiptap-editor-wrapper relative h-full">
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders from parent
export const TiptapEditor = React.memo(TiptapEditorInternal);