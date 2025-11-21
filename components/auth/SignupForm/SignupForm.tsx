'use client';

import { useState, ReactNode } from 'react';
import axios from 'axios';
import { signUpWithPassword } from '@/domains/core/auth/auth.client';
import { SignupFormContext } from './context';

interface SignupFormProps {
  children: ReactNode;
  redirectTo?: string;
}

function SignupForm({ children, redirectTo = '/dashboard' }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { uid, idToken } = await signUpWithPassword(email, password, name);
      await axios.post('/api/auth/signup', { uid, email, name, idToken });
      
      setSuccess(true);
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupFormContext.Provider
      value={{
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        error,
        setError,
        success,
        setSuccess,
        loading,
        setLoading,
        redirectTo,
        handleSubmit,
      }}
    >
      <div className="w-full">{children}</div>
    </SignupFormContext.Provider>
  );
}

export { SignupForm };
export type { SignupFormProps };
