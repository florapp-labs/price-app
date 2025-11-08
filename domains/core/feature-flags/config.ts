import { Feature, Plan, PlanConfig } from './types';

export enum PLAN {
  FREE = 'FREE',
  PRO = 'PRO',
}

/**
 * Plan configurations
 * 
 * Single source of truth for all plan capabilities.
 * Defines which features and quotas each plan has access to.
 */
export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  [PLAN.FREE]: {
    name: 'Free',
    description: 'Perfect to get started',
    features: [
      Feature.MATERIALS
    ],
    quotas: {
      [Feature.PRODUCTS]: 10,
      [Feature.MATERIALS]: 20,
    },
  },
  [PLAN.PRO]: {
    name: 'Pro',
    description: 'For growing businesses',
    features: [
      Feature.LABOR_COSTS,
      Feature.ADVANCED_REPORTS,
      Feature.DATA_EXPORT,
      Feature.API_ACCESS,
    ],
    quotas: {
      [Feature.PRODUCTS]: 500,
      [Feature.MATERIALS]: 1000,
    },
  },
};

