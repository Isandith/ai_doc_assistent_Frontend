// Authentication Models and Types

/**
 * Firebase User Data
 * Represents the authenticated user from Firebase
 */
export interface FirebaseUserData {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
}

/**
 * Backend User Response
 * Matches the FastAPI backend user structure
 */
export interface BackendUser {
  uid: string;
  email: string;
  display_name: string;
  email_verified: boolean;
}

/**
 * Auth Response
 * Complete authentication response with token and user data
 */
export interface AuthResponse {
  token: string;  // Firebase ID token
  user: BackendUser;
}

/**
 * Register Request
 * Data sent to backend to sync Firebase user
 */
export interface RegisterRequest {
  id_token: string;
  display_name: string;
}

/**
 * Login/Register Result
 * Result from authentication operations
 */
export interface AuthResult {
  success: boolean;
  user?: BackendUser;
  token?: string;
  error?: string;
}

/**
 * Token Verification Request
 */
export interface TokenVerifyRequest {
  id_token: string;
}

/**
 * Token Verification Response
 */
export interface TokenVerifyResponse {
  valid: boolean;
  user: BackendUser;
}
