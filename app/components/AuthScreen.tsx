"use client";

import React, { useState } from 'react';
import { BookOpen, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../lib/context';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const AuthScreen = () => {
  const { login, register } = useAppContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      if (isLoginMode) {
        result = await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setIsLoading(false);
          return;
        }
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
          }
        result = await register(username, email, password);
      }
      
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    if (!isLoginMode) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {isLoginMode ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {isLoginMode ? 'Sign in to your AI Document Assistant' : 'Sign up to start chatting with your PDFs'}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                {error.includes('already registered') && !isLoginMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setError('');
                    }}
                    className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline focus:outline-none"
                  >
                    Switch to Login →
                  </button>
                )}
                {error.includes('No account found') && isLoginMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setError('');
                    }}
                    className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline focus:outline-none"
                  >
                    Create an Account →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <Input 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required={!isLoginMode}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required 
              minLength={6}
              disabled={isLoading}
            />
            {!isLoginMode && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 6 characters
              </p>
            )}
          </div>

          {!isLoginMode && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required={!isLoginMode}
                minLength={6}
                disabled={isLoading}
              />
            </div>
          )}

          <Button variant="gradient" className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLoginMode ? (
              <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" /> Sign Up</>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 dark:border-zinc-800 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button" 
              onClick={toggleMode}
              disabled={isLoading}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
