// ==========================================
// API LAYER (FastAPI Integration)
// ==========================================

import { User, DocumentInfo, Conversation, Message, DocStatus } from '../types';
import { Document } from './Documents/documentsModel';
import { getFirebaseToken } from './Authentication/authenticationApi';
import * as documentsAPI from './Documents/documentsapi';
import * as chatAPI from './chat/ChatApi';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get headers with Firebase authentication token
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getFirebaseToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Make authenticated API request
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeaders();
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

/**
 * Test backend connection
 * @returns Object with connection status and details
 */
export const testBackendConnection = async (): Promise<{
  connected: boolean;
  message: string;
  url: string;
  timestamp: string;
}> => {
  const timestamp = new Date().toISOString();
  
  try {
    // Try to reach the backend health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        connected: true,
        message: 'Successfully connected to backend',
        url: API_BASE_URL,
        timestamp,
      };
    } else {
      return {
        connected: false,
        message: `Backend returned status ${response.status}`,
        url: API_BASE_URL,
        timestamp,
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Failed to connect to backend',
      url: API_BASE_URL,
      timestamp,
    };
  }
};

class MockAPI {
  async login(email: string): Promise<{ token: string; user: User }> {
    await delay(800);
    return { token: 'mock-jwt-token', user: { uid: 'u1', display_name: 'Alex Designer', email: email, email_verified: true } };
  }

  async register(username: string, email: string): Promise<{ token: string; user: User }> {
    await delay(1000);
    return { token: 'mock-jwt-token', user: { uid: `u${Date.now()}`, display_name: username, email: email, email_verified: false } };
  }

  /**
   * Get all documents for the current user (using real API)
   */
  async getDocuments(): Promise<DocumentInfo[]> {
    try {
      const response = await documentsAPI.listDocuments();
      // Transform API response to match DocumentInfo type
      return response.documents.map((doc: Document) => ({
        id: doc.id.toString(),
        filename: doc.filename,
        uploadedAt: doc.uploaded_at,
        status: doc.status as DocStatus,
        pageCount: doc.page_count || 0,
        chunkCount: doc.chunk_count || 0,
        size: `${(doc.file_size / 1024 / 1024).toFixed(1)} MB`
      }));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  }

  /**
   * Upload a document (using real API)
   */
  async uploadDocument(file: File): Promise<DocumentInfo> {
    try {
      const response = await documentsAPI.uploadDocument(file);
      return {
        id: response.document_id.toString(),
        filename: response.filename,
        uploadedAt: response.uploaded_at,
        status: response.status as DocStatus,
        size: `${(response.file_size / 1024 / 1024).toFixed(1)} MB`
      };
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  /**
   * Index a document (using real API)
   */
  async indexDocument(id: string, onProgress: (msg: string) => void): Promise<DocumentInfo> {
    try {
      onProgress('Indexing document...');
      const response = await documentsAPI.indexDocument(parseInt(id), {
        max_tokens: 500,
        overlap_tokens: 50
      });
      
      onProgress(`Completed: ${response.pages} pages, ${response.chunks} chunks`);
      
      // Fetch updated document info
      const doc = await documentsAPI.getDocument(parseInt(id));
      return {
        id: doc.id.toString(),
        filename: doc.filename,
        uploadedAt: doc.uploaded_at,
        status: doc.status as DocStatus,
        pageCount: doc.page_count || 0,
        chunkCount: doc.chunk_count || 0,
        size: `${(doc.file_size / 1024 / 1024).toFixed(1)} MB`
      };
    } catch (error) {
      console.error('Failed to index document:', error);
      throw error;
    }
  }

  /**
   * Delete a document (using real API)
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await documentsAPI.deleteDocument(parseInt(id));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  async getConversations(docId: string): Promise<Conversation[]> {
    try {
      const response = await chatAPI.listConversations(parseInt(docId));
      // Transform API response to match Conversation type
      return response.conversations.map(conv => ({
        id: conv.id.toString(),
        documentId: docId,
        title: conv.title,
        lastUpdated: conv.updated_at,
        messages: [] // Messages will be fetched separately when needed
      }));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      return [];
    }
  }

  /**
   * Get full conversation details with all messages
   */
  async getConversationDetails(conversationId: string): Promise<Conversation> {
    try {
      const response = await chatAPI.getConversation(parseInt(conversationId));
      
      // Transform messages
      const messages: Message[] = response.messages.map(msg => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        citations: (msg.citations || msg.citations_json || []).map((c, idx) => ({
          id: c.id || `cit_${msg.id}_${idx}`,
          page: c.page,
          snippet: c.snippet
        }))
      }));
      
      return {
        id: response.id.toString(),
        documentId: response.document_id.toString(),
        title: response.title,
        lastUpdated: response.created_at, // Using created_at as fallback
        messages
      };
    } catch (error) {
      console.error('Failed to fetch conversation details:', error);
      throw error;
    }
  }

  async askQuestion(docId: string, convId: string | null, question: string): Promise<{ conversation: Conversation, response: Message }> {
    try {
      // Ask question using real API
      const response = await chatAPI.askQuestion(
        parseInt(docId),
        question,
        convId ? parseInt(convId) : null
      );
      
      // Transform response
      const conversation: Conversation = {
        id: response.conversation_id.toString(),
        documentId: docId,
        title: question.slice(0, 30) + (question.length > 30 ? '...' : ''),
        lastUpdated: new Date().toISOString(),
        messages: []
      };
      
      const responseMessage: Message = {
        id: `m${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations.map((c, idx) => ({
          id: c.id || `cit_${response.message_id}_${idx}`,
          page: c.page,
          snippet: c.snippet
        })) || [],
        isTyping: false
      };
      
      return { conversation, response: responseMessage };
    } catch (error) {
      console.error('Failed to ask question:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation and all its messages (using real API)
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await chatAPI.deleteConversation(parseInt(conversationId));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }
}

export const api = new MockAPI();
