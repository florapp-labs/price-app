'use server'

import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from '../firebase/firebase.client';

/**
 * Get Firebase Admin Auth instance
 * Used for server-side authentication operations
 * 
 * Features:
 * - Verify ID tokens
 * - Create session cookies
 * - Manage users
 * - Revoke tokens
 * 
 * @returns Firebase Admin Auth instance
 */
const auth = async () => getAuth(await firebaseApp());

export { auth };
