'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignupForm } from './context';

function SignupFormFields() {
  const { name, setName, email, setEmail, password, setPassword, loading } = useSignupForm();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome completo</Label>
        <Input
          id="signup-name"
          type="text"
          required
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 8 caracteres
        </p>
      </div>
    </>
  );
}

export { SignupFormFields };
