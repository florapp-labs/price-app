'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';

interface SignupFormBenefitsProps {
  className?: string;
  benefits?: Array<{ title: string; description: string }>;
}

function SignupFormBenefits({ className = '', benefits }: SignupFormBenefitsProps) {
  const defaultBenefits = [
    {
      title: 'Cálculo Automático',
      description: 'Preços calculados automaticamente com base nos seus insumos e margem'
    },
    {
      title: 'Alertas de Reajuste',
      description: 'Saiba quando seus produtos precisam de reajuste de preço'
    },
    {
      title: 'Dashboard Completo',
      description: 'Visualize todos os seus produtos e margens de lucro em um só lugar'
    },
    {
      title: 'Grátis para Sempre',
      description: 'Sem período de teste, sem cartão de crédito, sem pegadinhas'
    }
  ];

  const items = benefits || defaultBenefits;

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Sparkles className="size-4" />
          100% Gratuito
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
          Comece a precificar melhor hoje
        </h1>
        <p className="text-lg text-muted-foreground">
          Crie sua conta gratuita e tenha acesso a todas as funcionalidades para 
          calcular preços de forma automática e inteligente.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((benefit, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SignupFormBenefits };
export type { SignupFormBenefitsProps };
