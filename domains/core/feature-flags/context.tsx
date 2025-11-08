'use client';

import React, { createContext, useMemo, ReactNode } from 'react';
import { Feature, Plan } from './types';
import { PLAN_CONFIG } from './config';

/**
 * Feature flags context state
 */
interface FeatureFlagsState {
  planName: Plan;
  isFeatureAvailable: (feature: Feature) => boolean;
  hasAvailableQuota: (feature: Feature, currentUsage: number) => boolean;
}

/**
 * React Context for feature flags
 */
export const FeatureFlagsContext = createContext<FeatureFlagsState | undefined>(undefined);

/**
 * Internal: Check if a plan has access to a feature
 */
function _isFeatureEnabled(feature: Feature, plan: Plan): boolean {
  return PLAN_CONFIG[plan]?.features.includes(feature) ?? false;
}

/**
 * Internal: Check if quota is available for a feature
 */
function _hasQuota(feature: Feature, plan: Plan, currentUsage: number): boolean { 
  const limit = PLAN_CONFIG[plan]?.quotas[feature];
  return limit ? currentUsage < limit : false;
}

/**
 * Feature Flags Provider Component
 * Wraps the app to provide feature flags state to all children
 * 
 * @param planName - User's current plan. Default is PLAN_CONFIG['FREE']
 * @param children - Child components
 * 
 * @example
 * ```tsx
 * <FeatureFlagsProvider planName={account?.planName ?? null}>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export const FeatureFlagsProvider: React.FC<{ 
  planName: Plan; 
  children: ReactNode;
}> = ({ planName, children }) => {
  const value = useMemo<FeatureFlagsState>(
    () => ({
      planName,
      isFeatureAvailable: (feature: Feature) => _isFeatureEnabled(feature, planName),
      hasAvailableQuota: (feature: Feature, usage: number) => _hasQuota(feature, planName, usage),
    }),
    [planName]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
