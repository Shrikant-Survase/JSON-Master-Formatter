export interface JsonHistoryItem {
  id: string;
  content: string;
  timestamp: number;
  name?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  indentSize: 2 | 4;
  autoFormatOnPaste: boolean;
  showLineNumbers: boolean;
  wordWrap: 'on' | 'off';
}

export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}
