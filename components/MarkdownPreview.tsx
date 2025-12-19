import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartRenderer } from './ChartRenderer';
import { ChartData } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
}

// Helper to detect alerts in blockquotes
const getAlertConfig = (text: string) => {
  if (text.startsWith('[!NOTE]')) return { type: 'note', icon: <Info className="w-5 h-5 text-blue-500" />, title: 'Note', class: 'bg-blue-50 border-blue-500 text-blue-900' };
  if (text.startsWith('[!TIP]')) return { type: 'tip', icon: <Lightbulb className="w-5 h-5 text-green-500" />, title: 'Tip', class: 'bg-green-50 border-green-500 text-green-900' };
  if (text.startsWith('[!WARNING]')) return { type: 'warning', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, title: 'Warning', class: 'bg-amber-50 border-amber-500 text-amber-900' };
  if (text.startsWith('[!IMPORTANT]')) return { type: 'important', icon: <CheckCircle className="w-5 h-5 text-purple-500" />, title: 'Important', class: 'bg-purple-50 border-purple-500 text-purple-900' };
  if (text.startsWith('[!CAUTION]')) return { type: 'caution', icon: <XCircle className="w-5 h-5 text-red-500" />, title: 'Caution', class: 'bg-red-50 border-red-500 text-red-900' };
  return null;
};

// Helper to strip the [!NOTE] tag from the children elements
const cleanChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    // If it's a paragraph (common immediate child of blockquote)
    if (React.isValidElement(child) && child.type === 'p') {
       const props = child.props as any;
       const content = props.children;
       
       if (typeof content === 'string') {
          // Replace start of string
          const newText = content.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/, '');
          return React.cloneElement(child, { ...props, children: newText });
       } else if (Array.isArray(content)) {
          // Check first element of array
          const first = content[0];
          if (typeof first === 'string') {
            const newFirst = first.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/, '');
            return React.cloneElement(child, { 
              ...props, 
              children: [newFirst, ...content.slice(1)] 
            });
          }
       }
    }
    // If it's a direct text node (rare in blockquote but possible)
    if (typeof child === 'string') {
        return child.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/, '');
    }
    
    return child;
  });
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none prose-p:leading-7 prose-headings:font-bold prose-headings:text-slate-800 prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-a:text-blue-600 prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && language === 'chart') {
              try {
                const config: ChartData = JSON.parse(codeString);
                return <ChartRenderer config={config} />;
              } catch (e) {
                return (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm font-mono">
                    <strong>Error rendering chart:</strong> Invalid JSON configuration.
                  </div>
                );
              }
            }

            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={oneLight}
                language={language}
                PreTag="div"
                customStyle={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  margin: '1.5em 0',
                  fontSize: '0.9em',
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className ? className : 'bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono'}>
                {children}
              </code>
            );
          },
          // Custom Blockquote for Alerts
          blockquote({ children, ...props }) {
             // Extract plain text to check for Alert Type
             let textContent = '';
             React.Children.forEach(children, child => {
                if (React.isValidElement(child)) {
                   const childProps = child.props as any;
                   if (childProps.children) {
                      if (typeof childProps.children === 'string') {
                         textContent += childProps.children;
                      } else if (Array.isArray(childProps.children)) {
                         childProps.children.forEach((c: any) => {
                             if (typeof c === 'string') textContent += c;
                         });
                      }
                   }
                }
             });

             const config = getAlertConfig(textContent.trim());

             if (config) {
               // We render a specific div for alerts, and strip the marker from the content
               const cleanedContent = cleanChildren(children);
               
               return (
                 <div className={`my-6 rounded-lg border-l-4 p-4 ${config.class}`} role="alert">
                   <div className="flex items-center gap-2 font-bold mb-2">
                     {config.icon}
                     <span>{config.title}</span>
                   </div>
                   <div className="text-sm opacity-90 pl-7 blockquote-content">
                     {cleanedContent}
                   </div>
                 </div>
               );
             }

             return (
               <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-6 italic text-slate-600 bg-slate-50/50 rounded-r-lg">
                 {children}
               </blockquote>
             );
          },
          table({ children }) {
             return (
               <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
                 <table className="min-w-full divide-y divide-slate-200 bg-white">
                   {children}
                 </table>
               </div>
             );
          },
          thead({ children }) {
            return <thead className="bg-slate-50">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-t border-slate-100">{children}</td>;
          },
          hr({ children }) {
            return <hr className="my-8 border-slate-200" />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};