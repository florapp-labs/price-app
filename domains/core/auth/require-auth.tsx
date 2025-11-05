import { redirect } from 'next/navigation';
import { getUser } from '@/domains/users/repositories/user.repository';

/**
 * Server Component que protege rotas verificando autenticação
 * Usa getUser() que valida o session cookie server-side
 * 
 * Uso:
 * ```tsx
 * export default async function ProtectedLayout({ children }) {
 *   const user = await requireAuth();
 *   return <div>{children}</div>;
 * }
 * ```
 */
export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    console.log('[RequireAuth] No authenticated user, redirecting to sign-in');
    redirect('/login');
  }
  
  return user;
}
