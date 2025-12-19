import { useState, useCallback } from 'react';
import { streamDocumentEdit } from '../services/geminiService';
import { Editor } from '@tiptap/react';

export const useAIEditor = (
  content: string, 
  setContent: (newContent: string) => void,
  editorInstance: Editor | null
) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const requestEdit = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    const originalContent = content;
    let accumulatedText = "";

    try {
      await streamDocumentEdit(content, prompt, (chunkText) => {
        accumulatedText += chunkText;
        setContent(accumulatedText);
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate content.");
      setContent(originalContent);
    } finally {
      setIsProcessing(false);
      // Re-focus editor after generation
      editorInstance?.commands.focus();
    }
  }, [content, isProcessing, setContent, editorInstance]);

  return {
    isProcessing,
    requestEdit
  };
};