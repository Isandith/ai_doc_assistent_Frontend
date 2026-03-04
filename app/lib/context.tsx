"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Route } from '../types';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  onAuthStateChange,
  getCurrentUser
} from './Authentication/authenticationApi';

// ==========================================
// APP CONTEXT (Global State Management)
// ==========================================

export type AppState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  route: Route;
  navigate: (route: Route) => void;
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  activeConvId: string | null;
  setActiveConvId: (id: string | null) => void;
  isAuthLoading: boolean;
};

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [route, setRoute] = useState<Route>('auth');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Monitor Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch backend user data
        try {
          const backendUser = await getCurrentUser();
          if (backendUser) {
            setUser(backendUser);
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            setRoute('dashboard');
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        setRoute('auth');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setRoute('dashboard');
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const result = await registerUser(email, password, username);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setRoute('dashboard');
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      setRoute('auth');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigate = (newRoute: Route) => setRoute(newRoute);

  const contextValue: AppState = {
    theme, 
    toggleTheme, 
    user, 
    token,
    login, 
    register, 
    logout, 
    route, 
    navigate,
    activeDocId, 
    setActiveDocId, 
    activeConvId, 
    setActiveConvId,
    isAuthLoading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
