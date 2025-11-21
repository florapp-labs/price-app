'use client';

import { CardContent } from '@/components/ui/card';

function SignupFormFooter() {
  return (
    <CardContent className="pt-0">
      <div className="pt-6 border-t">
        <p className="text-xs text-center text-muted-foreground">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="#" className="underline hover:text-foreground">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="underline hover:text-foreground">
            Política de Privacidade
          </a>
        </p>
      </div>
    </CardContent>
  );
}

export { SignupFormFooter };
