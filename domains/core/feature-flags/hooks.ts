'use client';

import { useContext } from 'react';
import { FeatureFlagsContext } from './context';
import { Feature } from './types';

/**
 * Hook to access feature flags functionality
 * 
 * @returns Object with isFeatureAvailable and hasAvailableQuota functions
 * 
 * @example
 * ```tsx
 * function ProductForm() {
 *   const { isFeatureAvailable, hasAvailableQuota } = useFeatureFlags();
 *   const productCount = products.length;
 *   
 *   const canUseLaborCosts = isFeatureAvailable(Feature.LABOR_COSTS);
 *   const canCreateProduct = hasAvailableQuota(Feature.PRODUCTS, productCount);
 *   
 *   return (
 *     <div>
 *       {canUseLaborCosts && <LaborCostInput />}
 *       {canCreateProduct ? (
 *         <CreateButton />
 *       ) : (
 *         <UpgradeMessage />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  
  return {
    isFeatureAvailable: context.isFeatureAvailable,
    hasAvailableQuota: context.hasAvailableQuota,
  };
}

