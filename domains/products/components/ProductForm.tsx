'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductSupply } from '../types/product.types';
import type { SupplyDocument } from '@/domains/supplies/types/supplies.types';
import type { SettingsDocument } from '@/domains/settings/types/settings.types';
import { calculatePrice, type PricingSupply } from '../pricing/calculatePrice';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

interface ProductFormProps {
  supplies: SupplyDocument[];
  settings: SettingsDocument;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
  cancelUrl?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  currentPrice?: number;
  supplies: ProductSupply[];
}

export function ProductForm({ 
  supplies, 
  settings, 
  onSubmit, 
  submitLabel = 'Salvar',
  cancelUrl = '/products'
}: ProductFormProps) {
  const router = useRouter();
  const { product, setProduct } = useProduct();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate price when supplies change
  useEffect(() => {
    if (product.supplies.length > 0) {
      const pricingSupplies: PricingSupply[] = product.supplies.map((productSupply) => {
        const supply = supplies.find(s => s.id === productSupply.supplyId);
        return {
          unitPrice: supply?.cost || 0,
          quantity: productSupply.quantity,
        };
      });

      const calculation = calculatePrice(pricingSupplies, settings);
      
      setProduct(prev => {
        // Set currentPrice to recommended price if not set yet
        const newCurrentPrice = prev.currentPrice === undefined 
          ? calculation.sellingPrice 
          : prev.currentPrice;
          
        return {
          ...prev,
          price: calculation.sellingPrice,
          currentPrice: newCurrentPrice
        };
      });
    }
  }, [product.supplies, supplies, settings, setProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate at least one supply
    if (product.supplies.length === 0) {
      setError('Adicione pelo menos um material ao produto');
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(product);
      router.push(cancelUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(cancelUrl);
  };

  const addSupply = () => {
    if (supplies.length === 0) {
      setError('Você precisa cadastrar materiais antes de criar um produto');
      return;
    }

    setProduct({
      ...product,
      supplies: [
        ...product.supplies,
        {
          supplyId: supplies[0].id,
          quantity: 1,
        },
      ],
    });
  };

  const removeSupply = (index: number) => {
    setProduct({
      ...product,
      supplies: product.supplies.filter((_, i) => i !== index),
    });
  };

  const updateSupply = (index: number, field: keyof ProductSupply, value: any) => {
    const newSupplies = [...product.supplies];
    newSupplies[index] = {
      ...newSupplies[index],
      [field]: value,
    };
    setProduct({
      ...product,
      supplies: newSupplies,
    });
  };

  // Calculate total cost from supplies
  const calculateTotalCost = () => {
    return product.supplies.reduce((total, productSupply) => {
      const supply = supplies.find(s => s.id === productSupply.supplyId);
      return total + (supply?.cost || 0) * productSupply.quantity;
    }, 0);
  };

  const totalCost = calculateTotalCost();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="Ex: Buquê de Rosas"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            type="text"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            placeholder="Ex: Arranjo com 12 rosas vermelhas"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={product.price.toFixed(2)}
            readOnly
            disabled
            className="bg-muted"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calculator className="h-4 w-4" />
            <span>
              Calculado automaticamente (Custo: R$ {totalCost.toFixed(2)} + Configurações)
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPrice">Preço Atual Praticado (R$)</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            min="0"
            value={product.currentPrice || ''}
            onChange={(e) => setProduct({ ...product, currentPrice: parseFloat(e.target.value) || undefined })}
            placeholder="Digite o preço que você vende atualmente"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Informe o preço que você está cobrando atualmente para comparar com o recomendado
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <Label>Materiais *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSupply}
              disabled={isLoading || supplies.length === 0}
            >
              <Plus className="h-4 w-4" />
              Adicionar Material
            </Button>
          </div>

          {supplies.length === 0 && (
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
              Você precisa cadastrar materiais antes de criar produtos.{' '}
              <a href="/supplies/add" className="underline">
                Cadastrar material
              </a>
            </div>
          )}

          {product.supplies.length === 0 && supplies.length > 0 && (
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md text-center">
              Nenhum material adicionado. Clique em "Adicionar Material" para começar.
            </div>
          )}

          <div className="space-y-3">
            {product.supplies.map((productSupply, index) => {
              const supply = supplies.find(s => s.id === productSupply.supplyId);
              return (
                <div
                  key={index}
                  className="flex items-end gap-3 p-4 border rounded-md bg-muted/30"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`material-${index}`}>Material</Label>
                    <select
                      id={`material-${index}`}
                      value={productSupply.supplyId}
                      onChange={(e) => updateSupply(index, 'supplyId', e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {supplies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - R$ {s.cost.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32 space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={productSupply.quantity}
                      onChange={(e) =>
                        updateSupply(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="w-32 text-right">
                    <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                    <div className="font-mono font-medium">
                      R$ {((supply?.cost || 0) * productSupply.quantity).toFixed(2)}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupply(index)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
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
