'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SupplyDocument } from '../types/supplies.types';

interface SupplyFormProps {
  supply?: SupplyDocument;
  onSubmit: (data: SupplyFormData) => Promise<void>;
  submitLabel?: string;
}

export interface SupplyFormData {
  name: string;
  description?: string;
  cost: number;
}

export function SupplyForm({ supply, onSubmit, submitLabel = 'Salvar' }: SupplyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SupplyFormData>({
    name: supply?.name || '',
    description: supply?.description || '',
    cost: supply?.cost || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      router.push('/supplies');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplies');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Material *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Rosa Vermelha"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Rosa colombiana de primeira qualidade"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Custo (R$) *</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Custo unitário do material
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
