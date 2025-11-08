import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/domains/core/auth/auth.session';
import { clearSession } from '@/domains/core/auth/auth.session';

/**
 * Logout Route - DELETE /api/auth/session
 * Deletes the current user session.
 * @returns Deletion confirmation
 */
export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Logout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
