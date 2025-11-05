import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export type Plan = 'FREE' | 'PRO';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'unpaid'
  | 'past_due'
  | null;

/**
 * Account document in Firestore
 * 
 * Current state: 1:1 relationship with User (single-tenant operation)
 * Future ready: 1:N relationship (multi-tenant expansion)
 * 
 * Each account can have:
 * - One subscription (Stripe)
 * - One plan (FREE or PRO)
 * - Multiple users (future)
 * - Multiple materials, products, settings
 */
export interface AccountDocument {
  id: string;
  name: string; // User's name initially, company name in the future
  
  // Subscription data (moved from User)
  planName: Plan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  deletedAt?: Timestamp | Date;
}
