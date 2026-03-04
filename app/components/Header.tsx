"use client";

import React from 'react';
import { BookOpen, Moon, Sun, LogOut } from 'lucide-react';
import { useAppContext } from '../lib/context';

export const Header = () => {
  const { user, theme, toggleTheme, logout, navigate } = useAppContext();

  if (!user) return null;

  return (
    <header className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 sticky top-0">
      <div 
        className="flex items-center gap-2 font-bold text-lg cursor-pointer group"
        onClick={() => navigate('dashboard')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
          Lumina Docs
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center uppercase">
            {user.display_name.charAt(0)}
          </div>
          <span className="hidden lg:block text-gray-700 dark:text-gray-300">{user.display_name}</span>
        </div>
        <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1" title="Log out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
