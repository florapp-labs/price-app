/**
 * Firebase Custom Claims Management
 * 
 * Custom claims allow storing small amounts of data directly in the user's token.
 * This avoids querying Firestore for frequently-accessed data like accountId and planName.
 * 
 * IMPORTANT: Claims are cached in the token until it expires or is refreshed.
 * After updating claims, users may need to refresh their token to see changes.
 */

'use server';

import { auth as getAuth } from '@/domains/core/auth/auth.server';

export interface UserClaims {
  accountId: string;
  planName: 'FREE' | 'PRO';
}

/**
 * Sets custom claims for a user
 * Call this after creating a user or when account data changes
 * 
 * @example
 * await setUserClaims(uid, { accountId: 'acc_123', planName: 'FREE' });
 */
export async function setUserClaims(uid: string, claims: UserClaims): Promise<void> {
  const auth = await getAuth();
  
  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log(`[Claims] Set claims for user ${uid}:`, claims);
  } catch (error: any) {
    console.error('[Claims] Failed to set custom claims:', error.code || error.message);
    throw new Error('Failed to set user claims');
  }
}

/**
 * Gets current custom claims for a user
 * Useful for debugging or verification
 */
export async function getUserClaims(uid: string): Promise<UserClaims | null> {
  const auth = await getAuth();
  
  try {
    const user = await auth.getUser(uid);
    const claims = user.customClaims as UserClaims | undefined;
    
    if (!claims || !claims.accountId || !claims.planName) {
      return null;
    }
    
    return claims;
  } catch (error: any) {
    console.error('[Claims] Failed to get custom claims:', error.code || error.message);
    return null;
  }
}

/**
 * Updates only the planName claim
 * Used when subscription status changes (Stripe webhook)
 * 
 * @example
 * await updatePlanClaim(uid, 'PRO');
 */
export async function updatePlanClaim(uid: string, planName: 'FREE' | 'PRO'): Promise<void> {
  const auth = await getAuth();
  
  try {
    // Get existing claims first to preserve accountId
    const user = await auth.getUser(uid);
    const existingClaims = (user.customClaims || {}) as Partial<UserClaims>;
    
    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      planName,
    });
    
    console.log(`[Claims] Updated plan claim for user ${uid}: ${planName}`);
  } catch (error: any) {
    console.error('[Claims] Failed to update plan claim:', error.code || error.message);
    throw new Error('Failed to update plan claim');
  }
}
