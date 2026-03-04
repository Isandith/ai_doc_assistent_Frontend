'use client';

import { useState, useEffect } from 'react';
import { testBackendConnection } from '../lib/api';
import { testFirebaseConnection } from '../lib/Authentication/firebase';
import { Badge } from './ui';

interface ConnectionResult {
  connected: boolean;
  message: string;
  timestamp: string;
  url?: string;
}

export const ConnectionStatus = () => {
  const [backendStatus, setBackendStatus] = useState<ConnectionResult | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<ConnectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnections = async () => {
    setIsLoading(true);
    
    // Test Firebase
    const fbStatus = testFirebaseConnection();
    setFirebaseStatus(fbStatus);
    
    // Test Backend
    const beStatus = await testBackendConnection();
    setBackendStatus(beStatus);
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Test connections on component mount
    const runTests = async () => {
      await testConnections();
    };
    runTests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Connection Status
        </h3>
        <button
          onClick={testConnections}
          disabled={isLoading}
          className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Retest'}
        </button>
      </div>

      <div className="space-y-2">
        {/* Firebase Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Firebase:</span>
          <div className="flex items-center gap-2">
            <Badge variant={firebaseStatus?.connected ? 'success' : 'destructive'}>
              {firebaseStatus?.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
        {firebaseStatus && (
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">
            {firebaseStatus.message}
          </p>
        )}

        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Backend:</span>
          <div className="flex items-center gap-2">
            <Badge variant={backendStatus?.connected ? 'success' : 'destructive'}>
              {backendStatus?.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
        {backendStatus && (
          <div className="text-xs text-gray-500 dark:text-gray-400 pl-2">
            <p>{backendStatus.message}</p>
            {backendStatus.url && (
              <p className="mt-1">URL: {backendStatus.url}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
