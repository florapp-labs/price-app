'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageContent from "@/components/ui/PageContent/PageContent";
import { PageHeader, PageTitle } from "@/components/ui/PageHeader";
import { Save, Loader2, Calculator } from "lucide-react";
import { SettingsDocument } from '@/domains/settings/types/settings.types';
import { calculatePriceFromCost } from '@/domains/products/pricing/calculatePrice';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    taxRate: 0,
    profitMargin: 30,
    otherFixedCosts: 0,
    otherPercentageCosts: 0,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Update form with loaded data
      setFormData({
        taxRate: data.taxRate,
        profitMargin: data.profitMargin,
        otherFixedCosts: data.otherFixedCosts || 0,
        otherPercentageCosts: data.otherPercentageCosts || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSuccessMessage('Configurações salvas com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  if (loading) {
    return (
      <>
        <PageHeader>
          <PageTitle>Configurações</PageTitle>
        </PageHeader>
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Configurações</PageTitle>
      </PageHeader>

      <div className="flex gap-6 relative">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-500/15 text-green-700 dark:text-green-400 px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}

          {/* Tax Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Impostos e Taxas</CardTitle>
              <CardDescription>
                Configure a taxa de impostos aplicada aos produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Taxa de Impostos (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => handleNumberChange('taxRate', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Percentual de impostos aplicado sobre o custo dos insumos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card>
            <CardHeader>
              <CardTitle>Margem de Lucro</CardTitle>
              <CardDescription>
                Configure a margem de lucro desejada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.profitMargin}
                  onChange={(e) => handleNumberChange('profitMargin', e.target.value)}
                  placeholder="30.00"
                />
                <p className="text-sm text-muted-foreground">
                  Percentual de lucro aplicado sobre o custo total
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Other Fixed Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Outros Custos Fixos</CardTitle>
              <CardDescription>
                Custos fixos adicionados a cada produto (ex: embalagem, mão de obra)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otherFixedCosts">Valor (R$)</Label>
                <Input
                  id="otherFixedCosts"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.otherFixedCosts}
                  onChange={(e) => handleNumberChange('otherFixedCosts', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Valor fixo em R$ adicionado ao custo de cada produto
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Other Percentage Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Outros Custos Percentuais</CardTitle>
              <CardDescription>
                Custos percentuais aplicados sobre o valor total (ex: taxas de cartão, comissões)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otherPercentageCosts">Percentual (%)</Label>
                <Input
                  id="otherPercentageCosts"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.otherPercentageCosts}
                  onChange={(e) => handleNumberChange('otherPercentageCosts', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Percentual aplicado sobre o custo total do produto
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
          </form>
        </div>

        {/* Floating Sidebar - Formula */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-6">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Fórmula de Cálculo</CardTitle>
                </div>
                <CardDescription>
                  Como o preço de venda é calculado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">1. Custo dos Insumos</div>
                  <div className="text-muted-foreground pl-4">
                    Σ (quantidade × preço unitário)
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">2. Custos Fixos</div>
                  <div className="text-muted-foreground pl-4">
                    + R$ {formData.otherFixedCosts.toFixed(2)}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-1 pt-2 border-t">
                  <div className="font-semibold text-foreground">3. Custo Total</div>
                  <div className="text-muted-foreground pl-4">
                    Insumos + Custos Fixos
                  </div>
                </div>

                {/* Step 4 */}
                <div className="space-y-1 pt-2 border-t">
                  <div className="font-semibold text-foreground">4. Percentuais Aplicados</div>
                  <div className="text-muted-foreground pl-4 space-y-1">
                    <div>Impostos: {formData.taxRate}%</div>
                    <div>Outros Custos: {formData.otherPercentageCosts}%</div>
                    <div>Margem de Lucro: {formData.profitMargin}%</div>
                    <div className="pt-1 border-t">
                      Total: {(formData.taxRate + formData.otherPercentageCosts + formData.profitMargin).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="space-y-1 pt-2 border-t">
                  <div className="font-semibold text-primary">5. Preço de Venda</div>
                  <div className="text-muted-foreground pl-4">
                    Custo Total ÷ (1 - {(formData.taxRate + formData.otherPercentageCosts + formData.profitMargin).toFixed(2)}%)
                  </div>
                </div>

                {/* Example */}
                <div className="pt-3 border-t space-y-2">
                  <div className="font-semibold text-foreground text-xs uppercase tracking-wide">
                    Exemplo
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    {(() => {
                      const exampleCost = 100;
                      const calculation = calculatePriceFromCost(exampleCost, formData);
                      
                      return (
                        <>
                          <div>Insumos: R$ {exampleCost.toFixed(2)}</div>
                          <div>Custos Fixos: + R$ {calculation.fixedCosts.toFixed(2)}</div>
                          <div className="pt-1 border-t font-semibold text-foreground">
                            Custo Total: R$ {calculation.totalCost.toFixed(2)}
                          </div>
                          <div className="pt-1">
                            Percentuais: {calculation.percentagesTotal.toFixed(2)}%
                          </div>
                          <div className="font-semibold text-primary">
                            Preço de Venda: R$ {calculation.sellingPrice.toFixed(2)}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
