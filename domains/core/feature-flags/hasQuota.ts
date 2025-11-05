import { Quota, Plan, planConfig } from './types';

/**
 * Checks if current quota usage is below the limit allowed by the plan
 * @param quota - The quota to check
 * @param plan - The user's plan
 * @param currentUsage - The current quota usage
 * @returns true if there's still available space, false otherwise
 */
export function hasQuota(
  quota: Quota,
  plan: Plan | null | undefined,
  currentUsage: number
): boolean {
  if (!plan) {
    return false;
  }

  const config = planConfig[plan];
  if (!config) {
    return false;
  }

  const limit = config.quotas[quota];
  return currentUsage < limit;
}

