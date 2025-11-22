/**
 * Pricing Calculation Helper
 * 
 * Centralizes the price calculation logic used across the application
 */

import { SettingsDocument } from '@/domains/settings/types/settings.types';

/**
 * Supply (material/ingredient) used in a product
 */
export interface PricingSupply {
  unitPrice: number;
  quantity: number;
}

/**
 * Result of price calculation
 */
export interface PriceCalculationResult {
  suppliesCost: number;        // Sum of all supplies (materials)
  fixedCosts: number;          // Fixed costs from settings
  totalCost: number;           // suppliesCost + fixedCosts
  percentagesTotal: number;    // Sum of all percentages (tax + other + profit)
  sellingPrice: number;        // Final selling price
  breakdown: {
    taxRate: number;
    otherPercentageCosts: number;
    profitMargin: number;
  };
}

/**
 * Calculates the selling price based on supplies and settings
 * 
 * Formula:
 * 1. Total Cost = Supplies Cost + Fixed Costs
 * 2. Selling Price = Total Cost / (1 - (Tax% + Other% + Profit%))
 * 
 * @param supplies - Array of supplies with unitPrice and quantity
 * @param settings - Settings document with tax, margin, and costs
 * @returns Detailed price calculation result
 * 
 * @example
 * const supplies = [
 *   { unitPrice: 10, quantity: 5 },  // R$ 50
 *   { unitPrice: 20, quantity: 2 }   // R$ 40
 * ];
 * 
 * const settings = {
 *   taxRate: 15,
 *   profitMargin: 30,
 *   otherFixedCosts: 10,
 *   otherPercentageCosts: 5
 * };
 * 
 * const result = calculatePrice(supplies, settings);
 * // result.sellingPrice = 200.00 (example)
 */
export function calculatePrice(
  supplies: PricingSupply[],
  settings: Pick<SettingsDocument, 'taxRate' | 'profitMargin' | 'otherFixedCosts' | 'otherPercentageCosts'>
): PriceCalculationResult {
  // Step 1: Calculate supplies cost
  const suppliesCost = supplies.reduce(
    (sum, supply) => sum + (supply.unitPrice * supply.quantity),
    0
  );

  // Step 2: Add fixed costs
  const fixedCosts = settings.otherFixedCosts;
  const totalCost = suppliesCost + fixedCosts;

  // Step 3: Calculate percentages total
  const percentagesTotal = settings.taxRate + settings.otherPercentageCosts + settings.profitMargin;

  // Step 4: Calculate selling price
  // Selling Price = Total Cost / (1 - Percentages%)
  const percentageDecimal = percentagesTotal / 100;
  const sellingPrice = totalCost / (1 - percentageDecimal);

  return {
    suppliesCost,
    fixedCosts,
    totalCost,
    percentagesTotal,
    sellingPrice,
    breakdown: {
      taxRate: settings.taxRate,
      otherPercentageCosts: settings.otherPercentageCosts,
      profitMargin: settings.profitMargin,
    },
  };
}

/**
 * Calculates selling price with example/fixed supplies cost
 * Useful for previews and examples in the UI
 * 
 * @param suppliesCost - Fixed supplies cost value
 * @param settings - Settings document
 * @returns Detailed price calculation result
 * 
 * @example
 * const settings = { taxRate: 15, profitMargin: 30, otherFixedCosts: 10, otherPercentageCosts: 5 };
 * const result = calculatePriceFromCost(100, settings);
 */
export function calculatePriceFromCost(
  suppliesCost: number,
  settings: Pick<SettingsDocument, 'taxRate' | 'profitMargin' | 'otherFixedCosts' | 'otherPercentageCosts'>
): PriceCalculationResult {
  const fixedCosts = settings.otherFixedCosts;
  const totalCost = suppliesCost + fixedCosts;
  
  const percentagesTotal = settings.taxRate + settings.otherPercentageCosts + settings.profitMargin;
  const percentageDecimal = percentagesTotal / 100;
  const sellingPrice = totalCost / (1 - percentageDecimal);

  return {
    suppliesCost,
    fixedCosts,
    totalCost,
    percentagesTotal,
    sellingPrice,
    breakdown: {
      taxRate: settings.taxRate,
      otherPercentageCosts: settings.otherPercentageCosts,
      profitMargin: settings.profitMargin,
    },
  };
}
