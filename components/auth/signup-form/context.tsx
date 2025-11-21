'use client';

import { createContext, useContext } from 'react';

export interface SignupFormContextValue {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  success: boolean;
  setSuccess: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  redirectTo: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const SignupFormContext = createContext<SignupFormContextValue | null>(null);

export function useSignupForm() {
  const context = useContext(SignupFormContext);
  if (!context) {
    throw new Error('SignupForm compound components must be used within SignupForm');
  }
  return context;
}
