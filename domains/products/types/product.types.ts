import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * Ingredient used in a product
 */
export interface Ingredient {
  materialId: string;
  quantity: number;
  unit: string;
}

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
  price: number;
  
  accountId: string; // ← Account owner (changed from 'owner: uid')
  
  ingredients: Ingredient[];
  needsRecalculation?: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}


