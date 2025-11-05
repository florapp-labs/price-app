/**
 * Accounts Repository
 * 
 * Manages account documents in Firestore
 * Currently 1:1 with User (single-tenant)
 * Ready for multi-tenant expansion (1:N)
 */

'use server';

import { Database } from '@/domains/core/database/firestore.client';
import { FieldValue } from 'firebase-admin/firestore';
import { AccountDocument } from '@/domains/core/database/types';

const ACCOUNTS_COLLECTION = 'accounts';

/**
 * Creates a new account
 * Called during user signup (1:1 relationship initially)
 * 
 * @example
 * const account = await createAccount({
 *   name: 'John Doe',
 *   planName: 'FREE'
 * });
 */
export async function createAccount(data: {
  name: string;
  planName?: 'FREE' | 'PRO';
}): Promise<AccountDocument> {
  const db = await Database();
  const accountRef = db.collection(ACCOUNTS_COLLECTION).doc();

  const accountData = {
    name: data.name,
    planName: data.planName || 'FREE',
    subscriptionStatus: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await accountRef.set(accountData);

  return {
    id: accountRef.id,
    ...accountData,
  } as AccountDocument;
}

/**
 * Gets an account by ID
 * 
 * @example
 * const account = await getAccountById('account-123');
 */
export async function getAccountById(
  accountId: string
): Promise<AccountDocument | null> {
  const db = await Database();
  const accountDoc = await db
    .collection(ACCOUNTS_COLLECTION)
    .doc(accountId)
    .get();

  if (!accountDoc.exists) {
    return null;
  }

  return {
    id: accountDoc.id,
    ...accountDoc.data(),
  } as AccountDocument;
}

/**
 * Updates an account
 * Used for subscription updates (Stripe webhooks)
 * 
 * @example
 * await updateAccount('account-123', {
 *   planName: 'PRO',
 *   stripeCustomerId: 'cus_...',
 *   stripeSubscriptionId: 'sub_...'
 * });
 */
export async function updateAccount(
  accountId: string,
  data: Partial<Omit<AccountDocument, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = await Database();

  await db
    .collection(ACCOUNTS_COLLECTION)
    .doc(accountId)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Deletes an account (soft delete)
 * Also should delete/archive all related data (materials, products, etc.)
 */
export async function deleteAccount(accountId: string): Promise<void> {
  const db = await Database();

  await db
    .collection(ACCOUNTS_COLLECTION)
    .doc(accountId)
    .update({
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}
