import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Using process.env.API_KEY as strictly required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert technical writer and data visualization assistant.
Your goal is to help the user write Markdown/MDX documents.

RULES:
1. Return ONLY the Markdown content. Do not add conversational filler like "Here is the document".
2. You can generate charts by using a special code block syntax.
   To render a chart, use a code block with the language identifier "chart".
   Inside the block, provide a valid JSON object with the following structure:
   {
     "type": "bar" | "line" | "area" | "pie",
     "title": "Chart Title",
     "xAxisKey": "name",
     "dataKeys": ["value1", "value2"],
     "data": [
       { "name": "Jan", "value1": 400, "value2": 240 },
       { "name": "Feb", "value1": 300, "value2": 139 }
     ]
   }
3. If the user asks to "edit" or "change" the document, use the provided context to rewrite the relevant parts or the whole document as requested.
4. Keep formatting clean and professional.
`;

export const streamDocumentEdit = async (
  currentContent: string,
  userPrompt: string,
  onChunk: (text: string) => void
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a context-aware prompt
    const fullPrompt = `
    CURRENT DOCUMENT CONTENT:
    """
    ${currentContent}
    """

    USER INSTRUCTION:
    ${userPrompt}

    Based on the current document, generate the updated document content. 
    If the document is empty, generate new content based on the instruction.
    `;

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};