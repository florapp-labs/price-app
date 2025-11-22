import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * Supply (material) used in a product
 */
export interface ProductSupply {
  supplyId: string;
  quantity: number;
}

/**
 * @deprecated Use ProductSupply instead
 */
export type Ingredient = ProductSupply;

/**
 * Product document in Firestore
 * Each product belongs to an Account through 'accountId'
 * 
 * Current: 1:1 Account-User (user's products)
 * Future: 1:N Account-Users (shared products in team)
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // Recommended selling price (auto-calculated)
  currentPrice?: number; // Current user-defined selling price
  
  accountId: string; // ← Account owner (changed from 'owner: uid')
  
  supplies: ProductSupply[];
  needsRecalculation?: boolean;
  createdAt: Timestamp | FieldValue | string;
  updatedAt: Timestamp | FieldValue | string;
}


