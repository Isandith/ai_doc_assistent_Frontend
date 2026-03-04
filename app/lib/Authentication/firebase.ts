// Firebase Configuration and Initialization
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDF9tZlsUhOt_x805zV09h-wvfcwRe2nrA",
  authDomain: "ai-doc-assistant-2d2cf.firebaseapp.com",
  projectId: "ai-doc-assistant-2d2cf",
  storageBucket: "ai-doc-assistant-2d2cf.firebasestorage.app",
  messagingSenderId: "746134951700",
  appId: "1:746134951700:web:67f65818e4a9c67c111401",
  measurementId: "G-JDW0N3NL9E"
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics;

if (typeof window !== "undefined") {
  // Only initialize on client-side
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  analytics = getAnalytics(app);
}

/**
 * Test Firebase connection
 * @returns Object with Firebase connection status
 */
export const testFirebaseConnection = (): {
  connected: boolean;
  message: string;
  timestamp: string;
} => {
  const timestamp = new Date().toISOString();
  
  try {
    if (typeof window === "undefined") {
      return {
        connected: false,
        message: 'Firebase only available on client-side',
        timestamp,
      };
    }
    
    const isInitialized = getApps().length > 0;
    const hasAuth = auth !== undefined && auth !== null;
    
    if (isInitialized && hasAuth) {
      return {
        connected: true,
        message: 'Firebase initialized successfully',
        timestamp,
      };
    } else {
      return {
        connected: false,
        message: 'Firebase initialization incomplete',
        timestamp,
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Firebase connection test failed',
      timestamp,
    };
  }
};

export { app, auth, analytics };
