'use client';

import { CheckCircle2 } from 'lucide-react';

interface SignupFormMobileBenefitsProps {
  benefits?: string[];
}

function SignupFormMobileBenefits({ benefits }: SignupFormMobileBenefitsProps) {
  const defaultBenefits = [
    'Cálculo automático de preços',
    'Alertas de reajuste',
    '100% gratuito para sempre'
  ];

  const items = benefits || defaultBenefits;

  return (
    <div className="mt-6 lg:hidden space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">O que você ganha:</p>
      {items.map((benefit, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span>{benefit}</span>
        </div>
      ))}
    </div>
  );
}

export { SignupFormMobileBenefits };
export type { SignupFormMobileBenefitsProps };
