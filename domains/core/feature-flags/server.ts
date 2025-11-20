import { cache } from 'react';
import { getSession } from '@/domains/core/auth/auth.session';
import { Feature, Plan } from './types';
import { PLAN_CONFIG } from './config';

// ============================================
// INTERNAL PURE FUNCTIONS
// ============================================

/**
 * Internal: Check if a plan has access to a feature
 */
function _isFeatureEnabled(feature: Feature, plan: Plan | null): boolean {
  if (!plan) return false;
  return PLAN_CONFIG[plan]?.features.includes(feature) ?? false;
}

/**
 * Internal: Check if quota is available for a feature
 */
function _hasQuota(feature: Feature, plan: Plan | null, currentUsage: number): boolean {
  if (!plan) return false;
    
  const limit = PLAN_CONFIG[plan]?.quotas[feature];
  return limit ? currentUsage < limit : false;
}

/**
 * Internal: Get current user's plan with request-level cache
 */
const _getPlan = cache(async (): Promise<Plan> => {
  const session = await getSession();
  // If claims are missing (e.g., user just signed up and hasn't refreshed token),
  // fall back to a safe default. This avoids DB queries from this layer.
  return (session?.planName ?? 'FREE') as Plan;
});

// ============================================
// PUBLIC SERVER-SIDE API
// ============================================

/**
 * Check if the current user's plan has access to a feature
 * 
 * @param feature - The feature to check
 * @returns true if the feature is available
 * 
 * @example Server Component
 * ```tsx
 * import { isFeatureAvailable } from '@/domains/core/feature-flags/server';
 * 
 * async function ProductForm() {
 *   const canUseLaborCosts = await isFeatureAvailable(Feature.LABOR_COSTS);
 *   
 *   return (
 *     <div>
 *       {canUseLaborCosts && <LaborCostInput />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example Server Action
 * ```tsx
 * 'use server';
 * 
 * export async function createProduct(data: FormData) {
 *   if (!await isFeatureAvailable(Feature.LABOR_COSTS) && data.get('laborCost')) {
 *     throw new Error('Labor costs feature not available');
 *   }
 *   
 *   // Create product...
 * }
 * ```
 */
export async function isFeatureAvailable(feature: Feature): Promise<boolean> {
  const plan = await _getPlan();
  return _isFeatureEnabled(feature, plan);
}

/**
 * Check if the current user has quota available for a feature
 * 
 * @param feature - The feature to check quota for
 * @param currentUsage - The current usage count
 * @returns true if quota is available
 * 
 * @example Server Action
 * ```tsx
 * 'use server';
 * 
 * export async function createProduct(data: FormData) {
 *   const productCount = await getProductCount();
 *   
 *   if (!await hasAvailableQuota(Feature.PRODUCTS, productCount)) {
 *     throw new Error('Product limit reached. Upgrade to Pro.');
 *   }
 *   
 *   // Create product...
 * }
 * ```
 */
export async function hasAvailableQuota(feature: Feature, currentUsage: number): Promise<boolean> {
  const plan = await _getPlan();
  return _hasQuota(feature, plan, currentUsage);
}


/** * Get the remaining quota available for a feature
 * 
 * @param feature - The feature to check quota for
 */
export async function remainingQuotaAvailable(feature: Feature): Promise<number> {
  const plan = await _getPlan();
  if (!plan) return 0;

  return PLAN_CONFIG[plan]?.quotas[feature] ?? 0;
}

/**
 * Return the raw configured quota limit for a feature (alias for remainingQuotaAvailable without usage computation)
 * Provided to align with previous API usage (getQuota) in some pages.
 */
export async function getQuota(feature: Feature): Promise<number> {
  return remainingQuotaAvailable(feature);
}