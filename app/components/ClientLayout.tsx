"use client";

import React from 'react';
import { Header } from './Header';
import { Router } from './Router';
import { useAppContext } from '../lib/context';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();

  // If user is not logged in, show the auth screen which is the children (page.tsx)
  // Otherwise, use the Router to show the appropriate screen
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-950 selection:bg-indigo-500/30">
      <Header />
      <main className="flex-1 flex flex-col relative">
        {user ? <Router /> : children}
      </main>
    </div>
  );
};
