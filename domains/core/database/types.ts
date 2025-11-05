import { FieldValue, Timestamp } from 'firebase-admin/firestore';

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
 * Current: 1:1 with User (single-tenant operation)
 * Future: 1:N with Users (multi-tenant ready)
 */
export interface AccountDocument {
  id: string;
  name: string;
  
  // Subscription data
  planName: Plan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  
  createdAt: Timestamp | Date | FieldValue;
  updatedAt: Timestamp | Date | FieldValue;
  deletedAt?: Timestamp | Date;
}

/**
 * User document in Firestore
 * Each user belongs to ONE account (accountId)
 */
export interface UserDocument {
  uid: string;
  email: string;
  name?: string;
  
  accountId: string; // ← Link to Account (1:1 initially, 1:N ready)
  
  createdAt: Timestamp | Date | FieldValue;
  updatedAt: Timestamp | Date | FieldValue;
  deletedAt?: Timestamp | Date;
}

