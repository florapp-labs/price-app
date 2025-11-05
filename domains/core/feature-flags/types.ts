export enum Feature {
  LABOR_COSTS = 'LABOR_COSTS',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  DATA_EXPORT = 'DATA_EXPORT',
  API_ACCESS = 'API_ACCESS',
}

export enum Quota {
  PRODUCTS = 'PRODUCTS',
  MATERIALS = 'MATERIALS',
}

export type Plan = 'FREE' | 'PRO';

export interface PlanConfig {
  features: Feature[];
  quotas: {
    [key in Quota]: number;
  };
}

export const planConfig: Record<Plan, PlanConfig> = {
  FREE: {
    features: [],
    quotas: {
      [Quota.PRODUCTS]: 10,
      [Quota.MATERIALS]: 20,
    },
  },
  PRO: {
    features: [
      Feature.LABOR_COSTS,
      Feature.ADVANCED_REPORTS,
      Feature.DATA_EXPORT,
      Feature.API_ACCESS,
    ],
    quotas: {
      [Quota.PRODUCTS]: 500,
      [Quota.MATERIALS]: 1000,
    },
  },
};

