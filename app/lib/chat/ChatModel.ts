// ==========================================
// CHAT MODELS/TYPES
// ==========================================

/**
 * Citation information for referenced document content
 */
export interface Citation {
  id?: string;
  page: number;
  snippet: string;
  chunk_id?: number;
}

/**
 * Message in a conversation
 */
export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  citations_json?: Citation[];
  created_at: string;
}

/**
 * Conversation (summary)
 */
export interface Conversation {
  id: number;
  document_id: number;
  user_id?: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

/**
 * Conversation with full details
 */
export interface ConversationDetail extends Conversation {
  messages: Message[];
}

/**
 * Ask question request
 */
export interface AskRequest {
  question: string;
  conversation_id?: number | null;
}

/**
 * Ask question response
 */
export interface AskResponse {
  answer: string;
  citations: Citation[];
  conversation_id: number;
  message_id: number;
}

/**
 * Conversation list response
 */
export interface ConversationListResponse {
  count: number;
  conversations: Conversation[];
}

/**
 * Conversation detail response (same as ConversationDetail)
 */
export type ConversationDetailResponse = ConversationDetail;

/**
 * Search result for retrieval
 */
export interface SearchResult {
  chunk_id: number;
  page_number: number;
  text: string;
  relevance_score?: number;
}

/**
 * Retrieval service request
 */
export interface RetrievalRequest {
  query: string;
  document_id: number;
  top_k?: number;
}
