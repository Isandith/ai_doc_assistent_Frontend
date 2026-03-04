import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { DocStatus } from '../../types';

type BadgeVariant = 'success' | 'destructive' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  status?: DocStatus;
  variant?: BadgeVariant;
}

export const Badge = ({ children, status, variant }: BadgeProps) => {
  const styles = {
    uploaded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    indexed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    default: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-zinc-700",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
  };
  
  const styleKey = variant || status || 'default';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[styleKey]}`}>
      {(status === 'indexed' || variant === 'success') && <CheckCircle className="w-3 h-3 mr-1" />}
      {status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {children}
    </span>
  );
};
