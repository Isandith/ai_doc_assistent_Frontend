// ==========================================
// DOCUMENTS API CLIENT
// ==========================================

import { Document } from './documentsModel';
import { fetchWithAuth } from '../api';

/**
 * Get Firebase auth token for API requests
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { getFirebaseToken } = await import('../Authentication/authenticationApi');
    return await getFirebaseToken();
  } catch (e) {
    console.error('Failed to get auth token:', e);
    return null;
  }
};

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
 * Response types matching FastAPI models
 */
export interface DocumentUploadResponse {
  document_id: number;
  filename: string;
  file_size: number;
  status: string;
  uploaded_at: string;
}

export interface IndexingResponse {
  status: string;
  document_id: number;
  pages: number;
  chunks: number;
  indexed_at: string;
  message: string;
}

export interface DocumentListResponse {
  count: number;
  documents: Document[];
}

export interface IndexingRequest {
  max_tokens?: number;
  overlap_tokens?: number;
}

/**
 * Upload a PDF document
 * @param file - PDF file to upload
 * @returns Upload response with document details
 */
export const uploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files are allowed');
  }

  // Validate file size (20MB)
  const maxFileSize = 20 * 1024 * 1024;
  if (file.size > maxFileSize) {
    throw new Error('File size exceeds maximum allowed size of 20MB');
  }

  if (file.size === 0) {
    throw new Error('Empty file');
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', file);

  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Note: Don't set Content-Type for FormData - browser will set it with boundary

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * Index a document (extract text, chunk, and store)
 * @param documentId - ID of the document to index
 * @param options - Optional indexing parameters
 * @returns Indexing response with processing details
 */
export const indexDocument = async (
  documentId: number,
  options?: IndexingRequest
): Promise<IndexingResponse> => {
  const indexingRequest: IndexingRequest = {
    max_tokens: options?.max_tokens || 500,
    overlap_tokens: options?.overlap_tokens || 50,
  };

  const response = await fetchWithAuth(`/documents/${documentId}/index`, {
    method: 'POST',
    body: JSON.stringify(indexingRequest),
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
 * List all documents for current user
 * @returns List of documents
 */
export const listDocuments = async (): Promise<DocumentListResponse> => {
  const response = await fetchWithAuth('/documents', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * Get details of a specific document
 * @param documentId - ID of the document
 * @returns Document details
 */
export const getDocument = async (documentId: number): Promise<Document> => {
  const response = await fetchWithAuth(`/documents/${documentId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }

  return response.json();
};

/**
 * Delete a document
 * @param documentId - ID of the document to delete
 */
export const deleteDocument = async (documentId: number): Promise<void> => {
  const response = await fetchWithAuth(`/documents/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response);
    throw new Error(errorMsg);
  }
};

/**
 * Upload and index a document in sequence
 * @param file - PDF file to upload
 * @param indexingOptions - Optional indexing parameters
 * @returns Upload and indexing response
 */
export const uploadAndIndexDocument = async (
  file: File,
  indexingOptions?: IndexingRequest
): Promise<{
  upload: DocumentUploadResponse;
  indexing: IndexingResponse;
}> => {
  try {
    // Step 1: Upload the document
    const uploadResponse = await uploadDocument(file);
    console.log('Document uploaded:', uploadResponse);

    // Step 2: Index the document
    const indexingResponse = await indexDocument(
      uploadResponse.document_id,
      indexingOptions
    );
    console.log('Document indexed:', indexingResponse);

    return {
      upload: uploadResponse,
      indexing: indexingResponse,
    };
  } catch (error) {
    console.error('Upload and indexing failed:', error);
    throw error;
  }
};
