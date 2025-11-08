/**
 * Available features in the application
 */
export enum Feature {
  LABOR_COSTS = 'LABOR_COSTS',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  DATA_EXPORT = 'DATA_EXPORT',
  API_ACCESS = 'API_ACCESS',
  PRODUCTS = 'PRODUCTS',
  MATERIALS = 'MATERIALS',
}

/**
 * Available subscription plans
 */
export type Plan = 'FREE' | 'PRO';

/**
 * Configuration for a subscription plan
 */
export interface PlanConfig {
  name: string;
  description: string;
  features: Feature[];
  quotas: Partial<{
    [key in Feature]: number;
  }>;
}

/**
 * Result of a quota check
 */
export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

