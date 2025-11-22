import { NextRequest } from 'next/server';
import { getOrCreateSettings } from '@/domains/settings/services/settings.service';
import { updateSettings } from '@/domains/settings/repositories/settings.repository';
import { getSession } from '@/domains/core/auth/auth.session';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';

/**
 * GET /api/settings
 * Gets settings for the current user's account
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with account
    const { user, account } = await getUserWithAccount();

    // Get or create settings
    const settings = await getOrCreateSettings(account.id);
    
    return Response.json(settings);
  } catch (error: any) {
    console.error('[API Settings] Failed to load settings:', error);
    return Response.json(
      { error: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Updates settings for the current user's account
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with account
    const { user, account } = await getUserWithAccount();

    // Get current settings
    const settings = await getOrCreateSettings(account.id);

    // Parse request body
    const data = await request.json();

    // Update settings
    await updateSettings(settings.id, data);

    // Get updated settings
    const updatedSettings = await getOrCreateSettings(account.id);
    
    return Response.json(updatedSettings);
  } catch (error: any) {
    console.error('[API Settings] Failed to update settings:', error);
    return Response.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
