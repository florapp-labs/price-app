'use client';

import { ReactNode } from 'react';
import { CardContent } from '@/components/ui/card';
import { useSignupForm } from './context';

interface SignupFormFormProps {
  children: ReactNode;
  className?: string;
}

function SignupFormForm({ children, className = '' }: SignupFormFormProps) {
  const { handleSubmit } = useSignupForm();

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        {children}
      </form>
    </CardContent>
  );
}

export { SignupFormForm };
export type { SignupFormFormProps };
