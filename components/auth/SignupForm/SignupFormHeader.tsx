'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SignupFormHeaderProps {
  title?: string;
  description?: string;
}

function SignupFormHeader({ 
  title = 'Criar conta gratuita', 
  description = 'Preencha os dados abaixo para começar' 
}: SignupFormHeaderProps) {
  return (
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

export { SignupFormHeader };
export type { SignupFormHeaderProps };
