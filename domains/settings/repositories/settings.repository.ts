/**
 * Settings Repository
 * 
 * Manages settings documents in Firestore
 * 1:1 relationship with Account
 */

'use server';

import { Database } from '@/domains/core/database/firestore.client';
import { FieldValue } from 'firebase-admin/firestore';
import { SettingsDocument, SettingsData } from '../types/settings.types';

const SETTINGS_COLLECTION = 'settings';

/**
 * Creates default settings for a new account
 * Called during account creation (1:1 relationship)
 * 
 * @example
 * const settings = await createSettings('account-123');
 */
export async function createSettings(accountId: string): Promise<SettingsDocument> {
  const db = await Database();
  const settingsRef = db.collection(SETTINGS_COLLECTION).doc();

  const settingsData = {
    accountId,
    taxRate: 0, // 0%
    profitMargin: 30, // 30%
    otherFixedCosts: 0, // R$ 0.00
    otherPercentageCosts: 0, // 0%
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await settingsRef.set(settingsData);

  return {
    id: settingsRef.id,
    ...settingsData,
  } as SettingsDocument;
}

/**
 * Serializes settings data for Client Components
 */
function serializeSettings(settings: any): SettingsDocument {
  return {
    ...settings,
    createdAt: settings.createdAt?.toDate?.().toISOString?.() ?? null,
    updatedAt: settings.updatedAt?.toDate?.().toISOString?.() ?? null,
  } as SettingsDocument;
}

/**
 * Gets settings by account ID
 * 
 * @example
 * const settings = await getSettingsByAccountId('account-123');
 */
export async function getSettingsByAccountId(
  accountId: string
): Promise<SettingsDocument | null> {
  const db = await Database();
  const querySnapshot = await db
    .collection(SETTINGS_COLLECTION)
    .where('accountId', '==', accountId)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return serializeSettings({
    id: doc.id,
    ...doc.data(),
  });
}

/**
 * Updates settings
 * 
 * @example
 * await updateSettings('settings-123', {
 *   taxRate: 15,
 *   profitMargin: 35
 * });
 */
export async function updateSettings(
  settingsId: string,
  data: Partial<SettingsData>
): Promise<void> {
  const db = await Database();
  
  await db
    .collection(SETTINGS_COLLECTION)
    .doc(settingsId)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Gets settings by ID
 * 
 * @example
 * const settings = await getSettingsById('settings-123');
 */
export async function getSettingsById(
  settingsId: string
): Promise<SettingsDocument | null> {
  const db = await Database();
  const settingsDoc = await db
    .collection(SETTINGS_COLLECTION)
    .doc(settingsId)
    .get();

  if (!settingsDoc.exists) {
    return null;
  }

  return serializeSettings({
    id: settingsDoc.id,
    ...settingsDoc.data(),
  });
}
