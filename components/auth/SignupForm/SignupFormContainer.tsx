'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface SignupFormContainerProps {
  children: ReactNode;
  className?: string;
}

function SignupFormContainer({ children, className = '' }: SignupFormContainerProps) {
  return (
    <Card className={`border-2 ${className}`}>
      {children}
    </Card>
  );
}

export { SignupFormContainer };
export type { SignupFormContainerProps };
