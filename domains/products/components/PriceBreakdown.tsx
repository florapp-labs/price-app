'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { calculatePrice, type PricingSupply } from '../pricing/calculatePrice';
import type { SupplyDocument } from '@/domains/supplies/types/supplies.types';
import type { SettingsDocument } from '@/domains/settings/types/settings.types';

interface PriceBreakdownProps {
  supplies: SupplyDocument[];
  settings: SettingsDocument;
  className?: string;
}

export function PriceBreakdown({ supplies, settings, className }: PriceBreakdownProps) {
  const { product } = useProduct();
  
  // Calculate price based on current product supplies
  const calculation = useMemo(() => {
    if (product.supplies.length === 0) {
      return null;
    }
    
    const pricingSupplies: PricingSupply[] = product.supplies.map((productSupply) => {
      const supply = supplies.find(s => s.id === productSupply.supplyId);
      return {
        unitPrice: supply?.cost || 0,
        quantity: productSupply.quantity,
      };
    });
    
    return calculatePrice(pricingSupplies, settings);
  }, [product.supplies, supplies, settings]);
  
  if (!calculation) {
    return null;
  }
  
  const currentPrice = product.currentPrice;
  const hasPriceIssue = currentPrice !== undefined && currentPrice < calculation.sellingPrice;
  const priceDifference = currentPrice !== undefined 
    ? currentPrice - calculation.sellingPrice 
    : 0;

  return (
    <div className={className}>
      <Card className="p-6 space-y-6 sticky top-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Detalhes do Cálculo</h3>
          <p className="text-sm text-muted-foreground">
            Breakdown do preço de venda
          </p>
        </div>

        {/* Price comparison alert */}
        {currentPrice !== undefined && (
          <div className={`p-4 rounded-lg border ${
            hasPriceIssue 
              ? 'bg-destructive/10 border-destructive/50' 
              : 'bg-green-500/10 border-green-500/50'
          }`}>
            <div className="flex items-start gap-3">
              {hasPriceIssue ? (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className={`font-semibold text-sm ${
                  hasPriceIssue ? 'text-destructive' : 'text-green-700'
                }`}>
                  {hasPriceIssue ? 'Preço abaixo do recomendado' : 'Preço adequado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Diferença: <span className={hasPriceIssue ? 'text-destructive' : 'text-green-600'}>
                    R$ {Math.abs(priceDifference).toFixed(2)} 
                    {hasPriceIssue ? ' abaixo' : ' acima'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Price */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">Preço Recomendado</span>
            <span className="text-2xl font-bold text-primary">
              R$ {calculation.sellingPrice.toFixed(2)}
            </span>
          </div>

          {currentPrice !== undefined && (
            <div className="flex items-baseline justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Preço Atual</span>
              <span className="text-xl font-semibold">
                R$ {currentPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Composição de Custos
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materiais</span>
              <span className="font-mono">R$ {calculation.suppliesCost.toFixed(2)}</span>
            </div>

            {calculation.fixedCosts > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custos Fixos</span>
                <span className="font-mono">R$ {calculation.fixedCosts.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Custo Total</span>
              <span className="font-mono">R$ {calculation.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Percentages Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Percentuais Aplicados
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impostos</span>
              <span className="font-mono">{calculation.breakdown.taxRate.toFixed(1)}%</span>
            </div>

            {calculation.breakdown.otherPercentageCosts > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outros Custos %</span>
                <span className="font-mono">{calculation.breakdown.otherPercentageCosts.toFixed(1)}%</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Margem de Lucro</span>
              <span className="font-mono">{calculation.breakdown.profitMargin.toFixed(1)}%</span>
            </div>

            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Total de Percentuais</span>
              <span className="font-mono">{calculation.percentagesTotal.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Formula explanation */}
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
          <p className="font-mono bg-muted p-2 rounded">
            Preço = Custo Total ÷ (1 - Total%)
          </p>
          <p className="font-mono bg-muted p-2 rounded">
            {calculation.sellingPrice.toFixed(2)} = {calculation.totalCost.toFixed(2)} ÷ (1 - {(calculation.percentagesTotal / 100).toFixed(2)})
          </p>
        </div>
      </Card>
    </div>
  );
}
