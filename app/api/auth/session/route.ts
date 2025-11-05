import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/domains/core/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Create session cookie from ID token
    await setSession(idToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
