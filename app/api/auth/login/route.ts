import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/domains/users/repositories/user.repository';
import { auth as getAuth } from '@/domains/core/auth/auth.server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify user exists in Firestore
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // NOTE: Firebase Admin SDK doesn't support password verification
    // We'll create a custom token that the client can exchange for an ID token
    const auth = await getAuth();
    const customToken = await auth.createCustomToken(user.uid);
    
    // Return custom token to client
    // Client will use this to authenticate and get an ID token
    return NextResponse.json({ 
      success: true, 
      customToken 
    });
  } catch (error: any) {
    console.error('[API Login] Error:', error);
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}
