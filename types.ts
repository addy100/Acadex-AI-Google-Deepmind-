export interface GradingBreakdown {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface GradingResult {
  studentName: string;
  totalScore: number;
  maxTotalScore: number;
  summaryFeedback: string;
  transcription: string;
  breakdown: GradingBreakdown[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingChunks?: GroundingChunk[];
}

export enum AppState {
  SETUP = 'SETUP',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS'
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PLANX = 'PLANX',
  GRADX = 'GRADX',
  CHATX = 'CHATX',
  PULSEX = 'PULSEX'
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
  mimeType: string;
}

export interface Student {
  id: string;
  name: string;
  topic: string;
  status: 'Pending' | 'Reviewed';
}

export interface HistoryItem {
  id: string;
  date: string;
  testName: string;
  studentName: string;
  score: number;
  maxScore: number;
  result: GradingResult;
}