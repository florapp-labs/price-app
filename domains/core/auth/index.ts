/**
 * Authentication Module
 * 
 * Centralizes all authentication-related functionality:
 * - Client-side auth (Firebase Auth SDK)
 * - Server-side auth (Firebase Admin SDK)
 * - Session management (cookies)
 * - Auth guards and middleware
 * - Auth context and hooks
 * 
 * @module domains/core/auth
 */

// Types
export type { AuthState, SessionData, AuthCredentials, SignUpResult, WithAuthProps } from './auth.types';

// Client-side authentication
export { signInWithPassword, signUpWithPassword } from './auth.client';

// Server-side authentication
export { auth } from './auth.server';

// Session management
export { getSession, setSession, clearSession } from './auth.session';

// Auth guard
export { withAuth } from './auth.hoc';

// React context and hooks
export { AuthContext, AuthProvider } from './auth-context';
export { useAuth } from './auth.hooks';
