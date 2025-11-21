'use server';

import { UserDocument, AccountDocument } from '@/domains/core/database/types';
import { FieldValue } from 'firebase-admin/firestore';
import { getSession } from '@/domains/core/auth/auth.session';
import { Database } from '@/domains/core/database/firestore.client';
import { getAccountById } from '@/domains/accounts/repositories/account.repository';

const USERS_COLLECTION = 'users';

function serializeUser(user: any) {
  return {
    ...user,
    createdAt: user.createdAt?.toDate?.().toISOString?.() ?? null,
    updatedAt: user.updatedAt?.toDate?.().toISOString?.() ?? null,
  };
}

/**
 * Gets a user by UID
 */
export async function getUserByUid(uid: string): Promise<UserDocument | null> {
  console.log(`[User] Fetching user by UID: ${uid}`);
  const db = await Database();
  const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
  
  if (!userDoc.exists) {
    console.error(`[User] No user found with UID: ${uid}`);
    return null;
  }

  return {
    uid: userDoc.id,
    ...serializeUser(userDoc.data()),
  } as UserDocument;
}

/**
 * Creates a new user document in Firestore
 * User must be linked to an existing account (accountId is required)
 */
export async function createUser(
  uid: string,
  email: string,
  accountId: string,
  data?: Partial<UserDocument>
): Promise<UserDocument> {
  const db = await Database();

  const userData: Omit<UserDocument, 'uid'> = {
    email,
    accountId, // ← Link to account (required)
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    ...data,
  };

  console.log('Creating user with data:', userData);

  await db.collection(USERS_COLLECTION).doc(uid).set(userData);

  return {
    uid,
    ...userData,
  } as UserDocument;
}

/**
 * Updates a user document in Firestore
 */
export async function updateUser(
  uid: string,
  data: Partial<UserDocument>
): Promise<void> {
  const db = await Database();

  await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Gets user by email (for verification)
 */
export async function getUserByEmail(
  email: string
): Promise<UserDocument | null> {
  const db = await Database();

  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    uid: doc.id,
    ...doc.data(),
  } as UserDocument;
}

/**
 * Gets the current user from session
 */
export async function getUser(): Promise<UserDocument | null> {
  const session = await getSession();
  if (!session) {
    console.error('[User] No active session found');
    return null;
  }

  return await getUserByUid(session.uid);
}

/**
 * Gets current user WITH account data
 * 
 * This is the preferred method for most operations
 * Returns both user and account in a single call
 * 
 * Current: 1:1 relationship (single-tenant operation)
 * Future: Ready for multi-tenant expansion
 * 
 * @example
 * const data = await getUserWithAccount();
 * if (!data) return null;
 * 
 * const { user, account } = data;
 * console.log(user.email, account.planName);
 */
export async function getUserWithAccount(): Promise<{
  user: UserDocument;
  account: AccountDocument;
}> {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  const account = await getAccountById(user.accountId);
  if (!account) {
    console.error(
      `[getUserWithAccount] User ${user.uid} has invalid accountId: ${user.accountId}`
    );
    throw new Error('Account not found. Data integrity issue.');
  }

  return { user, account };
}

