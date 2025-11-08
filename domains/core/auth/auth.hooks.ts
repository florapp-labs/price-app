"use client";

import { useContext } from 'react';
import { AuthContext } from './auth-context';
import { AuthState } from './auth.types';

/**
 * Hook to access authentication state
 * Must be used within an AuthProvider
 * 
 * @throws Error if used outside AuthProvider
 * @returns Current authentication state with user and account
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, account } = useAuth();
 *   return <div>Hello {user?.displayName}</div>;
 * }
 * ```
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
