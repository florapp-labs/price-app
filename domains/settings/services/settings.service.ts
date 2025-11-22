/**
 * Settings Service
 * 
 * Business logic for settings management
 */

'use server';

import {
  createSettings,
  getSettingsByAccountId,
  updateSettings,
  getSettingsById,
} from '../repositories/settings.repository';
import { SettingsDocument, SettingsData } from '../types/settings.types';

/**
 * Gets or creates settings for an account
 * Ensures every account has settings (creates if missing)
 * 
 * @example
 * const settings = await getOrCreateSettings('account-123');
 */
export async function getOrCreateSettings(
  accountId: string
): Promise<SettingsDocument> {
  let settings = await getSettingsByAccountId(accountId);
  
  if (!settings) {
    settings = await createSettings(accountId);
  }
  
  return settings;
}

/**
 * Updates settings for an account
 * Validates data before updating
 * 
 * @example
 * await updateAccountSettings('settings-123', {
 *   taxRate: 15,
 *   profitMargin: 35
 * });
 */
export async function updateAccountSettings(
  settingsId: string,
  data: Partial<SettingsData>
): Promise<void> {
  // Validate numeric values
  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
    throw new Error('Tax rate must be between 0 and 100');
  }
  
  if (data.profitMargin !== undefined && (data.profitMargin < 0 || data.profitMargin > 100)) {
    throw new Error('Profit margin must be between 0 and 100');
  }
  
  if (data.otherFixedCosts !== undefined && data.otherFixedCosts < 0) {
    throw new Error('Other fixed costs cannot be negative');
  }
  
  if (data.otherPercentageCosts !== undefined && (data.otherPercentageCosts < 0 || data.otherPercentageCosts > 100)) {
    throw new Error('Other percentage costs must be between 0 and 100');
  }
  
  await updateSettings(settingsId, data);
}
