import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * Material (insumo) document in Firestore
 * Each material belongs to an Account through 'accountId'
 * 
 * Current: 1:1 Account-User (user's materials)
 * Future: 1:N Account-Users (shared materials in team)
 */
export interface SupplyDocument {
  id: string;
  accountId: string; // ← Account owner (changed from 'owner: uid')
  
  name: string;
  description?: string;
  cost: number;
    
  createdAt: Timestamp | FieldValue | string;
  updatedAt: Timestamp | FieldValue | string;
}


