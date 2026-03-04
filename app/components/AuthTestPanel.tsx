'use client';

import { useState } from 'react';
import { useAppContext } from '../lib/context';
import { verifyToken, getCurrentUser } from '../lib/Authentication/authenticationApi';
import { Badge } from './ui';

/**
 * Auth Test Panel - Debug component to test authentication flow
 * This component helps verify the frontend-backend integration
 */
export const AuthTestPanel = () => {
  const { user, token } = useAppContext();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testTokenVerification = async () => {
    if (!token) {
      setTestResult('❌ No token available. Please login first.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyToken(token);
      if (result && result.valid) {
        setTestResult(`✅ Token is valid!\nUser: ${result.user.email}\nUID: ${result.user.uid}`);
      } else {
        setTestResult('❌ Token validation failed');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setTestResult(`✅ Successfully fetched user from backend!\nEmail: ${currentUser.email}\nName: ${currentUser.display_name}\nUID: ${currentUser.uid}`);
      } else {
        setTestResult('❌ Failed to fetch user from backend');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setTestResult('✅ Token copied to clipboard!');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          🔐 Auth Test Panel
        </h3>
        <Badge variant={user ? 'success' : 'destructive'}>
          {user ? 'Authenticated' : 'Not Logged In'}
        </Badge>
      </div>

      {user && (
        <div className="text-xs space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Name:</strong> {user.display_name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>UID:</strong> {user.uid}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Verified:</strong> {user.email_verified ? '✅' : '❌'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={testTokenVerification}
          disabled={isLoading || !token}
          className="w-full px-3 py-2 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test Token Verification'}
        </button>

        <button
          onClick={testGetCurrentUser}
          disabled={isLoading}
          className="w-full px-3 py-2 text-xs rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test Get Current User'}
        </button>

        {token && (
          <button
            onClick={copyToken}
            className="w-full px-3 py-2 text-xs rounded bg-purple-500 text-white hover:bg-purple-600"
          >
            Copy Token to Clipboard
          </button>
        )}
      </div>

      {testResult && (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
          {testResult}
        </div>
      )}

      {!user && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Please login to test authentication
        </p>
      )}
    </div>
  );
};
