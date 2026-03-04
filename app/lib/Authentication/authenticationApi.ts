// Firebase Authentication API
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  UserCredential
} from "firebase/auth";
import { auth } from "./firebase";
import {
  AuthResult,
  BackendUser,
  RegisterRequest,
  TokenVerifyRequest,
  TokenVerifyResponse
} from "./authenticationModel";

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get Firebase ID Token from current user
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    return null;
  }
};

/**
 * Sync Firebase user with backend
 * Called after successful Firebase authentication
 */
const syncUserWithBackend = async (
  firebaseUser: FirebaseUser,
  displayName?: string
): Promise<BackendUser> => {
  const idToken = await firebaseUser.getIdToken();
  
  const payload: RegisterRequest = {
    id_token: idToken,
    display_name: displayName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User"
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to sync with backend" }));
    throw new Error(errorData.detail || "Backend sync failed");
  }

  const data = await response.json();
  return data.user as BackendUser;
};

/**
 * Register new user with Firebase and sync to backend
 * 
 * FLOW:
 * 1. Create user in Firebase with email/password
 * 2. Update Firebase profile with display name
 * 3. Get Firebase ID token
 * 4. Send token to backend to create local user record
 * 5. Return user data with token
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> => {
  try {
    // Step 1: Create Firebase user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Step 2: Update display name in Firebase
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }

    // Step 3 & 4: Get token and sync with backend
    const backendUser = await syncUserWithBackend(userCredential.user, displayName);
    const token = await userCredential.user.getIdToken();

    return {
      success: true,
      user: backendUser,
      token: token,
    };
  } catch (error: unknown) {
    // Handle Firebase errors
    const firebaseError = error as { code?: string; message?: string };
    let errorMessage = "Registration failed";
    
    if (firebaseError.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please login instead.";
    } else if (firebaseError.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (firebaseError.code === "auth/weak-password") {
      errorMessage = "Password is too weak (minimum 6 characters)";
    } else if (firebaseError.message) {
      errorMessage = firebaseError.message;
      // Only log non-user errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Registration error:", error);
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Login existing user with Firebase
 * 
 * FLOW:
 * 1. Sign in to Firebase with email/password
 * 2. Get Firebase ID token
 * 3. Fetch user data from backend using token
 * 4. Return user data with token
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    // Step 1: Sign in with Firebase
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Step 2: Get Firebase ID token
    const token = await userCredential.user.getIdToken();

    // Step 3: Get user data from backend
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data from backend");
    }

    const backendUser: BackendUser = await response.json();

    return {
      success: true,
      user: backendUser,
      token: token,
    };
  } catch (error: unknown) {
    // Handle Firebase errors
    const firebaseError = error as { code?: string; message?: string };
    let errorMessage = "Login failed";
    
    if (firebaseError.code === "auth/user-not-found") {
      errorMessage = "No account found with this email. Please sign up first.";
    } else if (firebaseError.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (firebaseError.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (firebaseError.code === "auth/user-disabled") {
      errorMessage = "This account has been disabled";
    } else if (firebaseError.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password";
    } else if (firebaseError.message) {
      errorMessage = firebaseError.message;
      // Only log non-user errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Login error:", error);
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

/**
 * Get current authenticated user from backend
 */
export const getCurrentUser = async (): Promise<BackendUser | null> => {
  try {
    const token = await getFirebaseToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

/**
 * Verify Firebase token with backend
 */
export const verifyToken = async (token: string): Promise<TokenVerifyResponse | null> => {
  try {
    const payload: TokenVerifyRequest = {
      id_token: token,
    };

    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

/**
 * Monitor authentication state changes
 * 
 * Usage:
 * const unsubscribe = onAuthStateChange((user) => {
 *   if (user) {
 *     // User is signed in
 *   } else {
 *     // User is signed out
 *   }
 * });
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
