import React, { useMemo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Info, Lightbulb, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const BlockquoteNodeView: React.FC<any> = ({ node }) => {
  // We now rely on the 'alertType' attribute which is extracted during parsing
  // This means the text content inside NodeViewContent is CLEAN (no [!NOTE] tag)
  const alertType = node.attrs.alertType;

  if (alertType) {
    const config = {
      note: { icon: <Info className="w-5 h-5" />, title: 'Note', class: 'alert-note' },
      tip: { icon: <Lightbulb className="w-5 h-5" />, title: 'Tip', class: 'alert-tip' },
      warning: { icon: <AlertTriangle className="w-5 h-5" />, title: 'Warning', class: 'alert-warning' },
      important: { icon: <CheckCircle className="w-5 h-5" />, title: 'Important', class: 'alert-tip' }, // Reusing tip style for important for now
      caution: { icon: <XCircle className="w-5 h-5" />, title: 'Caution', class: 'alert-error' },
    }[alertType as string] || { icon: <Info className="w-5 h-5" />, title: 'Note', class: 'alert-note' };

    return (
      <NodeViewWrapper className={`alert-block ${config.class} flex flex-col gap-2 my-6`}>
        <div className="flex items-center gap-2 font-serif font-bold select-none opacity-90 text-sm uppercase tracking-wide">
          {config.icon}
          <span>{config.title}</span>
        </div>
        <div className="pl-0 opacity-90 leading-relaxed text-slate-700">
          <NodeViewContent />
        </div>
      </NodeViewWrapper>
    );
  }

  // Default Blockquote style for standard quotes
  return (
    <NodeViewWrapper className="my-8 pl-6 border-l-4 border-slate-300 italic text-slate-600 bg-white py-2 font-serif text-lg">
      <NodeViewContent />
    </NodeViewWrapper>
  );
};