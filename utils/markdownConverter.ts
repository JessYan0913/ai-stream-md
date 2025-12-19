import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Configure Turndown (HTML to Markdown)
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*', // Use asterisks for italics to match user preference
});

// Use GFM plugin for tables and other GitHub flavors
turndownService.use(gfm);

// Custom rule for charts (keep them as code blocks)
turndownService.addRule('chart', {
  filter: (node) => {
    return node.nodeName === 'PRE' && node.getAttribute('data-language') === 'chart';
  },
  replacement: (content, node) => {
    // Attempt to extract the code content
    const code = node.textContent || '';
    return '\n```chart\n' + code + '\n```\n';
  }
});

// Custom rule for Alerts (converting data-alert-type back to > [!TAG])
turndownService.addRule('alert', {
  filter: (node) => {
    return node.nodeName === 'BLOCKQUOTE' && node.hasAttribute('data-alert-type');
  },
  replacement: (content, node) => {
    const type = (node as HTMLElement).getAttribute('data-alert-type') || 'NOTE';
    const tag = type.toUpperCase();
    
    // The content usually comes with newlines, we need to ensure the tag is the first thing
    // Turndown automatically adds '>' to blockquotes, we just need to prepend the text
    // But Turndown's blockquote replacement is internal. We are overriding it.
    
    // We need to split content by lines and prepend > to lines that don't have it? 
    // Actually, Turndown handles the '>' prefixing for blockquotes automatically IF we let it.
    // But since we are intercepting, we might just prepend the tag to the first line of content.
    
    return `> [!${tag}]\n${content}`; 
    // Turndown might process the content string recursively. 
    // However, if we just return this string, Turndown's default blockquote handler might NOT run. 
    // Wait, by defining a rule for BLOCKQUOTE, we REPLACE the default blockquote handler.
    // So we need to handle the '>' prefixing ourselves if we take over.
    
    const lines = content.trim().split('\n');
    const quotedLines = lines.map(line => `> ${line}`).join('\n');
    return `> [!${tag}]\n${quotedLines}\n\n`;
  }
});

export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  // 1. Parse standard Markdown to HTML
  let html = marked.parse(markdown) as string;

  // 2. Post-process HTML to identify Alerts and convert them to attributes
  // Pattern: <blockquote><p>[!NOTE] ...</p></blockquote>
  // We use regex to find these patterns in the HTML string and inject attributes
  
  // Regex explanation:
  // <blockquote>\s*<p>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]
  
  const alertRegex = /(<blockquote>\s*<p>)\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/gi;
  
  html = html.replace(alertRegex, (match, p1, p2) => {
    // p1 is "<blockquote><p>"
    // p2 is the tag e.g. "NOTE"
    // We modify the blockquote to have data-alert-type
    return `<blockquote data-alert-type="${p2.toLowerCase()}"><p>`;
  });

  return html;
};

export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  return turndownService.turndown(html);
};