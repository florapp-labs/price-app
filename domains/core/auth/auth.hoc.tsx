import { redirect } from 'next/navigation';
import { getUser } from '@/domains/users/repositories/user.repository';
import { UserDocument } from '@/domains/core/database/types';

/**
 * Higher-Order Component (HOC) for protecting server-side pages
 * Validates session cookie and ensures user is authenticated before rendering
 * 
 * Flow:
 * 1. Checks session cookie via getUser()
 * 2. If no valid session, redirects to /login
 * 3. If authenticated, passes user as prop to the wrapped component
 * 
 * @param Component - Page component to protect
 * @returns Protected page component with user prop
 * 
 * @example
 * ```tsx
 * async function DashboardPage({ user }: { user: UserDocument }) {
 *   return <div>Welcome {user.displayName}</div>;
 * }
 * 
 * export default withAuth(DashboardPage);
 * ```
 */
export function withAuth<P extends { user: UserDocument }>(
  Component: React.ComponentType<P>
) {
  return async function ProtectedPage(props: Omit<P, 'user'>) {
    const user = await getUser();
    
    if (!user) {
      console.log('[withAuth] No authenticated user, redirecting to /login');
      redirect('/login');
    }
    
    return <Component {...(props as P)} user={user} />;
  };
}