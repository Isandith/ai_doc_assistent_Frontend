"use client";

import React from 'react';
import { useAppContext } from '../lib/context';
import { AuthScreen } from './AuthScreen';
import { DashboardScreen } from './DashboardScreen';
import { WorkspaceScreen } from './WorkspaceScreen';

export const Router = () => {
  const { route } = useAppContext();

  switch (route) {
    case 'auth':
      return <AuthScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'workspace':
      return <WorkspaceScreen />;
    default:
      return <AuthScreen />;
  }
};
