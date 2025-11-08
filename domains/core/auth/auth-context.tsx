"use client";

import React, { createContext } from 'react';
import { AuthState } from './auth.types';
import { UserDocument, AccountDocument } from '@/domains/core/database/types';

/**
 * React Context for authentication state
 * Provides user and account information throughout the app
 */
export const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps the app to provide auth state to all children
 * 
 * @param user - Authenticated user document or null
 * @param account - User's account document or null
 * @param children - Child components
 * 
 * @example
 * ```tsx
 * <AuthProvider user={user} account={account}>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ 
  user: UserDocument | null; 
  account: AccountDocument | null;
  children: React.ReactNode;
}> = ({ user, account, children }) => {
  return (
    <AuthContext.Provider value={{ user, account }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
