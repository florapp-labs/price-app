import { UserDocument, AccountDocument } from '@/domains/core/database/types';

/**
 * Authentication state shared across the application
 * Contains the authenticated user and their associated account
 */
export interface AuthState {
  user: UserDocument | null;
  account: AccountDocument | null;
  /** True when a valid user is present */
  isAuthenticated: boolean;
}

/**
 * Session data stored in cookie
 * Extracted from Firebase session token
 * 
 * Includes custom claims (accountId, planName) to avoid Firestore queries
 */
export interface SessionData {
  uid: string;
  email: string;
  expires: string;
  accountId?: string;
  planName?: 'FREE' | 'PRO';
}

/**
 * Firebase authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Result from sign up operation
 */
export interface SignUpResult {
  uid: string;
  idToken: string;
}

/**
 * Props injected by withAuth HOC
 * Use this type to ensure your page component receives the correct props
 * 
 * @example
 * ```tsx
 * import type { WithAuthProps } from '@/domains/core/auth';
 * 
 * async function DashboardPage({ user }: WithAuthProps) {
 *   return <div>Hello {user.displayName}</div>;
 * }
 * 
 * export default withAuth(DashboardPage);
 * ```
 */
export interface WithAuthProps {
  user: UserDocument;
}
