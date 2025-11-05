"use client";

import React, { createContext, useContext } from 'react';
import { UserDocument, AccountDocument } from '@/domains/core/database/types';

export interface AuthState {
  user: UserDocument | null;
  account: AccountDocument | null;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

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
