'use server';

import { Database } from '@/domains/core/database/firestore.client';
import { FieldValue } from 'firebase-admin/firestore';
import { MaterialDocument } from '../types/material.types';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';

const MATERIALS_COLLECTION = 'materials';

/**
 * Creates a new material for the authenticated user's account
 */
export async function createMaterial(
  data: Omit<MaterialDocument, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>
): Promise<MaterialDocument> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const docRef = db.collection(MATERIALS_COLLECTION).doc();
  
  const materialData = {
    ...data,
    accountId: account.id, // ← Material belongs to account
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(materialData);

  return {
    id: docRef.id,
    ...materialData,
  } as MaterialDocument;
}

/**
 * Gets a material by ID
 * Validates that material belongs to user's account
 */
export async function getMaterialById(id: string): Promise<MaterialDocument | null> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return null;
  }

  const { account } = userAccount;

  const db = await Database();
  const doc = await db.collection(MATERIALS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const material = doc.data() as MaterialDocument;

  // Validate account ownership
  if (material.accountId !== account.id) {
    console.warn(
      `[Security] Account ${account.id} tried to access material ${id} owned by account ${material.accountId}`
    );
    return null;
  }

  return {
    ...material,
    id: doc.id,
  };
}

/**
 * Updates a material
 * Validates account ownership before updating
 */
export async function updateMaterial(
  id: string,
  data: Partial<Omit<MaterialDocument, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const materialRef = db.collection(MATERIALS_COLLECTION).doc(id);

  const materialDoc = await materialRef.get();
  if (!materialDoc.exists) {
    throw new Error('Material not found');
  }

  const material = materialDoc.data() as MaterialDocument;

  if (material.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to update this material'
    );
  }

  await materialRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Lists all materials for the authenticated user's account
 */
export async function listMaterials(): Promise<MaterialDocument[]> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    return [];
  }

  const { account } = userAccount;

  const db = await Database();
  const snapshot = await db
    .collection(MATERIALS_COLLECTION)
    .where('accountId', '==', account.id) // ← Filter by account
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MaterialDocument[];
}

/**
 * Deletes a material
 * Validates account ownership before deleting
 */
export async function deleteMaterial(id: string): Promise<void> {
  const userAccount = await getUserWithAccount();
  if (!userAccount) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const { account } = userAccount;

  const db = await Database();
  const materialRef = db.collection(MATERIALS_COLLECTION).doc(id);

  const materialDoc = await materialRef.get();
  if (!materialDoc.exists) {
    throw new Error('Material not found');
  }

  const material = materialDoc.data() as MaterialDocument;

  if (material.accountId !== account.id) {
    throw new Error(
      'Forbidden: You do not have permission to delete this material'
    );
  }

  await materialRef.delete();
}