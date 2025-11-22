'use server';

import { Database } from '@/domains/core/database/firestore.client';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { SupplyDocument } from '../types/supplies.types';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';

const SUPPLIES_COLLECTION = 'supplies';

/**
 * Helper: Serialize Firestore Timestamp to plain object
 * Converts Timestamp objects to Date strings for client serialization
 */
function serializeSupply(data: any): SupplyDocument {
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as SupplyDocument;
}

/**
 * Creates a new supply for the authenticated user's account
 */
export async function createSupply(
  data: Omit<SupplyDocument, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>
): Promise<SupplyDocument> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const docRef = db.collection(SUPPLIES_COLLECTION).doc();
  
  const supplyData = {
    ...data,
    accountId: account.id, // ← Supply belongs to account
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(supplyData);

  return {
    id: docRef.id,
    ...supplyData,
  } as SupplyDocument;
}

/**
 * Gets a supply by ID
 * Validates that supply belongs to user's account
 */
export async function getSupplyById(id: string): Promise<SupplyDocument | null> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return null;
  }

  const { account } = userAccount;

  const db = await Database();
  const doc = await db.collection(SUPPLIES_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const supply = doc.data() as SupplyDocument;

  // Validate account ownership
  if (supply.accountId !== account.id) {
    console.warn(
      `[Security] Account ${account.id} tried to access supply ${id} owned by account ${supply.accountId}`
    );
    return null;
  }

  return serializeSupply({
    ...supply,
    id: doc.id,
  });
}

/**
 * Updates a supply
 * Validates account ownership before updating
 */
export async function updateSupply(
  id: string,
  data: Partial<Omit<SupplyDocument, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const supplyRef = db.collection(SUPPLIES_COLLECTION).doc(id);
  const supplyDoc = await supplyRef.get();
  if (!supplyDoc.exists) {
    throw new Error('Supply not found');
  }

  const supply = supplyDoc.data() as SupplyDocument;

  if (supply.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to update this supply'
    );
  }

  await supplyRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export interface SuppliesListResult {
  supplies: SupplyDocument[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

/**
 * Gets supplies for the authenticated user's account with cursor-based pagination
 * 
 * @param pageSize - Number of supplies per page (default: 10)
 * @param cursor - Cursor for pagination (supply ID to start after)
 * 
 * @example
 * const result = await getSupplies(10);
 * // { supplies: [...], hasMore: true, nextCursor: 'supply-123', total: 25 }
 * 
 * const nextPage = await getSupplies(10, result.nextCursor);
 * // Returns next 10 supplies
 */
export async function getSupplies(
  pageSize: number = 10,
  cursor?: string
): Promise<SuppliesListResult> {
  // 1. Get authenticated user and account
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return { supplies: [], hasMore: false, total: 0 };
  }

  const { account } = userAccount;

  const db = await Database();

  // 2. Count total supplies for the account
  const countSnapshot = await db
    .collection(SUPPLIES_COLLECTION)
    .where('accountId', '==', account.id)
    .count()
    .get();
  
  const total = countSnapshot.data().count;

  // 3. Build query with pagination
  let query = db
    .collection(SUPPLIES_COLLECTION)
    .where('accountId', '==', account.id)
    .orderBy('createdAt', 'desc')
    .limit(pageSize + 1); // +1 to check if there are more results

  // If cursor provided, start after that document
  if (cursor) {
    const cursorDoc = await db.collection(SUPPLIES_COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();

  // 4. Process results
  const supplies = snapshot.docs
    .slice(0, pageSize) // Take only pageSize items
    .map(doc => serializeSupply({
      id: doc.id,
      ...doc.data(),
    }));

  // 5. Determine if there are more results
  const hasMore = snapshot.docs.length > pageSize;
  const nextCursor = hasMore ? supplies[supplies.length - 1]?.id : undefined;

  return {
    supplies,
    hasMore,
    nextCursor,
    total,
  };
}

/**
 * Lists all supplies for the authenticated user's account
 */
export async function listSupplies(): Promise<SupplyDocument[]> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return [];
  }

  const { account } = userAccount;

  const db = await Database();
  const snapshot = await db
    .collection(SUPPLIES_COLLECTION)
    .where('accountId', '==', account.id) // ← Filter by account
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => serializeSupply({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Deletes a supply
 * Validates account ownership before deleting
 */
export async function deleteSupply(id: string): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const supplyRef = db.collection(SUPPLIES_COLLECTION).doc(id);

  const supplyDoc = await supplyRef.get();
  if (!supplyDoc.exists) {
    throw new Error('Supply not found');
  }

  const supply = supplyDoc.data() as SupplyDocument;

  if (supply.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to delete this supply'
    );
  }

  await supplyRef.delete();
}