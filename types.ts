export type ChartType = 'bar' | 'line' | 'area' | 'pie';

export interface ChartData {
  type: ChartType;
  title?: string;
  data: Record<string, string | number>[];
  xAxisKey: string;
  dataKeys: string[]; // Supports multiple lines/bars
  colors?: string[];
}

export interface AiMessage {
  role: 'user' | 'model';
  text: string;
}

export interface EditorState {
  content: string;
  isProcessing: boolean;
  error: string | null;
}

export interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onEditorReady: (editor: any) => void;
  className?: string;
}