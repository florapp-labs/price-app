// ============================================
// PUBLIC API
// ============================================

// Types (for type safety)
export { Feature } from './types';
export type { Plan } from './types';

// Server-side (use in Server Components and Server Actions)
export { isFeatureAvailable, hasAvailableQuota } from './server';

// Client-side (use in Client Components)
export { useFeatureFlags } from './hooks';
export { FeatureFlagsProvider } from './context';

// ============================================
// INTERNAL (for configuration/advanced usage)
// ============================================
export { PLAN_CONFIG } from './config';


