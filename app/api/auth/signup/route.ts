import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/domains/users/repositories/user.repository';
import { createAccount } from '@/domains/accounts/repositories/account.repository';
import { setSession } from '@/domains/core/auth/session';

/**
 * Signup API route to create a new user, account and session.
 * This endpoint creates an new account and links the user to it.
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const { uid, email, name, idToken } = await request.json();

    if (!uid || !email || !name || !idToken) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // 1. Create Account
    const account = await createAccount({
      name: name, // Use user's name as account name
      planName: 'FREE',
    });

    console.log('[Signup] Account created:', account.id);

    // 2. Create User linked to Account
    await createUser(uid, email, account.id, { name });

    console.log('[Signup] User created:', uid, 'linked to account:', account.id);

    // 3. Create session cookie to grant user access
    await setSession(idToken);

    return NextResponse.json({ 
      success: true,
      accountId: account.id,
      userId: uid,
    });
  } catch (error: any) {
    console.error('[API Signup] Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
