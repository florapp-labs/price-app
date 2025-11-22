import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Settings document in Firestore
 * 
 * 1:1 relationship with Account
 * Stores global parameters used for product pricing calculation
 * 
 * Note: Timestamps are serialized to ISO strings when passed to Client Components
 */
export interface SettingsDocument {
  id: string;
  accountId: string; // Link to Account (1:1 relationship)
  
  // Tax configuration
  taxRate: number; // Percentage (e.g., 15 = 15%)
  
  // Profit margin
  profitMargin: number; // Percentage (e.g., 30 = 30%)
  
  // Other costs
  otherFixedCosts: number; // Fixed value in R$
  otherPercentageCosts: number; // Percentage (e.g., 5 = 5%)
  
  createdAt: Timestamp | Date | FieldValue | string | null;
  updatedAt: Timestamp | Date | FieldValue | string | null;
}

/**
 * Settings data for creating or updating
 */
export interface SettingsData {
  taxRate: number;
  profitMargin: number;
  otherFixedCosts: number;
  otherPercentageCosts: number;
}
