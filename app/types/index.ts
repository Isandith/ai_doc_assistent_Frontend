// ==========================================
// TYPES
// ==========================================

export type User = { 
  uid: string;
  email: string;
  display_name: string;
  email_verified: boolean;
};

export type DocStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

export type DocumentInfo = {
  id: string;
  filename: string;
  uploadedAt: string;
  status: DocStatus;
  pageCount?: number;
  chunkCount?: number;
  size: string;
};

export type Citation = { 
  id: string; 
  page: number; 
  snippet: string 
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isTyping?: boolean;
};

export type Conversation = { 
  id: string; 
  documentId: string; 
  title: string; 
  lastUpdated: string; 
  messages: Message[] 
};

export type Route = 'auth' | 'dashboard' | 'workspace';
