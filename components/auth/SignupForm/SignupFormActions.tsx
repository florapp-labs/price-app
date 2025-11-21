'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useSignupForm } from './context';

interface SignupFormActionsProps {
  buttonText?: string;
  showLoginLink?: boolean;
}

function SignupFormActions({ 
  buttonText = 'Criar conta grátis',
  showLoginLink = true 
}: SignupFormActionsProps) {
  const { loading } = useSignupForm();

  return (
    <>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          'Criando conta...'
        ) : (
          <>
            {buttonText}
            <ArrowRight className="ml-2 size-4" />
          </>
        )}
      </Button>

      {showLoginLink && (
        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link 
            href="/login" 
            className="font-semibold text-primary hover:underline"
          >
            Fazer login
          </Link>
        </div>
      )}
    </>
  );
}

export { SignupFormActions };
export type { SignupFormActionsProps };
