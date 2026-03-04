// ==========================================
// DOCUMENTS MODELS/TYPES
// ==========================================

/**
 * User model
 */
export interface User {
  id?: number;
  firebase_uid: string;
  email: string;
  display_name: string;
  created_at?: string;
}

/**
 * Document status types
 */
export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

/**
 * Document model
 */
export interface Document {
  id: number;
  owner_id: number;
  filename: string;
  storage_path: string;
  file_size: number;
  status: DocumentStatus;
  page_count?: number;
  chunk_count?: number;
  uploaded_at: string;
  indexed_at?: string;
}

/**
 * Page model
 */
export interface Page {
  id?: number;
  document_id: number;
  page_number: number;
  text: string;
  character_count: number;
}

/**
 * Chunk model
 */
export interface Chunk {
  id?: number;
  document_id: number;
  page_number: number;
  chunk_index: number;
  text: string;
  token_count: number;
}

/**
 * Document upload response
 */
export interface DocumentUploadResponse {
  document_id: number;
  filename: string;
  file_size: number;
  status: DocumentStatus;
  uploaded_at: string;
}

/**
 * Document list response
 */
export interface DocumentListResponse {
  count: number;
  documents: Document[];
}

/**
 * Indexing request
 */
export interface IndexingRequest {
  max_tokens?: number;
  overlap_tokens?: number;
}

/**
 * Indexing response
 */
export interface IndexingResponse {
  status: string;
  document_id: number;
  pages: number;
  chunks: number;
  indexed_at: string;
  message: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  skip?: number;
  limit?: number;
}

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  document_id?: number;
  limit?: number;
}

/**
 * Search result
 */
export interface SearchResult {
  chunk_id: number;
  document_id: number;
  document_title: string;
  page_number: number;
  text: string;
  relevance_score: number;
}
