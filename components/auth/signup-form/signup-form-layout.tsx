'use client';

import { ReactNode } from 'react';

interface SignupFormLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'compact';
}

function SignupFormLayout({ children, variant = 'default' }: SignupFormLayoutProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div className={`w-full ${isCompact ? 'max-w-md mx-auto' : 'max-w-6xl grid gap-8 lg:grid-cols-2 lg:gap-12 items-center'}`}>
      {children}
    </div>
  );
}

export { SignupFormLayout };
export type { SignupFormLayoutProps };
