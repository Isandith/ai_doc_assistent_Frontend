// ==========================================
// CHAT API CLIENT
// ==========================================

import { fetchWithAuth } from '../api';
import {
  AskRequest,
  AskResponse,
  ConversationListResponse,
  ConversationDetailResponse,
} from './ChatModel';

/**

 * Helper function to safely extract error message from API response
 */
const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      if (typeof error.detail === 'string') {
        return error.detail;
      }
      if (error.message) {
        return error.message;
      }
    }
  } catch {
    // If JSON parsing fails, continue to fallback
  }

  const text = await response.text();
  return text || `HTTP ${response.status}: ${response.statusText}`;
};

/**
 * Ask a question about a document
 * @param documentId - ID of the document to ask about
 * @param question - The question to ask
 * @param conversationId - Optional conversation ID. Leave empty to create new conversation
 * @returns Answer with citations and conversation ID
 */
export const askQuestion = async (
  documentId: number,
  question: string,
  conversationId?: number | null
): Promise<AskResponse> => {
  const request: AskRequest = {
    question,
    ...(conversationId !== undefined && { conversation_id: conversationId }),
  };

  const response = await fetchWithAuth(`/chat/documents/${documentId}/ask`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * List all conversations for a document
 * @param documentId - ID of the document
 * @returns List of conversations
 */
export const listConversations = async (
  documentId: number
): Promise<ConversationListResponse> => {
  const response = await fetchWithAuth(`/chat/documents/${documentId}/conversations`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * Get conversation details with all messages
 * @param conversationId - ID of the conversation
 * @returns Conversation with messages
 */
export const getConversation = async (
  conversationId: number
): Promise<ConversationDetailResponse> => {
  const response = await fetchWithAuth(`/chat/conversations/${conversationId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * Delete a conversation and all its messages
 * @param conversationId - ID of the conversation to delete
 */
export const deleteConversation = async (conversationId: number): Promise<void> => {
  const response = await fetchWithAuth(`/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }
};

/**
 * Create a new conversation and ask an initial question
 * @param documentId - ID of the document
 * @param question - Initial question
 * @returns Answer with new conversation ID
 */
export const startConversation = async (
  documentId: number,
  question: string
): Promise<AskResponse> => {
  return askQuestion(documentId, question, null);
};

/**
 * Continue a conversation by asking another question
 * @param documentId - ID of the document
 * @param conversationId - ID of the conversation
 * @param question - The question to ask
 * @returns Answer with conversation ID
 */
export const continueConversation = async (
  documentId: number,
  conversationId: number,
  question: string
): Promise<AskResponse> => {
  return askQuestion(documentId, question, conversationId);
};
