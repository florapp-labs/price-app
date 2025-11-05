import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware básico apenas para verificar a presença do cookie
 * A validação real acontece server-side nas páginas/layouts
 * 
 * Edge Runtime não suporta Firebase Admin SDK (precisa de Node.js APIs)
 * Por isso só verificamos se o cookie existe, não validamos aqui
 */
export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  
  // Se não há session cookie, redireciona para login
  if (!sessionCookie) {
    console.log('[Auth Middleware] No session cookie, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Cookie existe, continua - validação real será feita server-side
  return NextResponse.next();
}

/**
 * Protege todas as rotas /dashboard
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};

