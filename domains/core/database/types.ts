import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type Plan = 'FREE' | 'PRO';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'unpaid'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | null;

/**
 * Account document in Firestore
 * 
 * Current: 1:1 with User (single-tenant operation)
 * Future: 1:N with Users (multi-tenant ready)
 * 
 * Note: Timestamps are serialized to ISO strings when passed to Client Components
 */
export interface AccountDocument {
  id: string;
  name: string;
  
  // Subscription data
  planName: Plan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeProductId?: string | null;
  
  createdAt: Timestamp | Date | FieldValue | string | null;
  updatedAt: Timestamp | Date | FieldValue | string | null;
  deletedAt?: Timestamp | Date | string | null;
}

/**
 * User document in Firestore
 * Each user belongs to ONE account (accountId)
 * 
 * Note: Timestamps are serialized to ISO strings when passed to Client Components
 */
export interface UserDocument {
  uid: string;
  email: string;
  name?: string;
  
  accountId: string; // ← Link to Account (1:1 initially, 1:N ready)
  
  createdAt: Timestamp | Date | FieldValue | string | null;
  updatedAt: Timestamp | Date | FieldValue | string | null;
  deletedAt?: Timestamp | Date;
}

