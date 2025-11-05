import { Feature, Plan, planConfig } from './types';

/**
 * Checks if a plan has access to a specific feature
 * @param feature - The feature to check
 * @param plan - The user's plan
 * @returns true if the plan has access to the feature, false otherwise
 */
export function hasFeature(feature: Feature, plan: Plan | null | undefined): boolean {
  if (!plan) {
    return false;
  }

  const config = planConfig[plan];
  if (!config) {
    return false;
  }

  return config.features.includes(feature);
}

