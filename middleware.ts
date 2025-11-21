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
  // Tenta obter o cookie via API de cookies
  let sessionCookie = req.cookies.get('session')?.value;

  // Fallback: parse manual do header bruto (defensivo caso comportamento mude no Edge)
  if (!sessionCookie) {
    const raw = req.headers.get('cookie') || '';
    const match = raw.match(/(?:^|;\s*)session=([^;]+)/);
    if (match) {
      sessionCookie = match[1];
      console.log('[Auth Middleware] Session obtido via parse manual do header');
    }
  }

  // Se ainda não encontrado, faz log detalhado para diagnóstico
  if (!sessionCookie) {
    const allCookies = req.cookies.getAll();
    console.log('[Auth Middleware] Session cookie ausente. Cookies recebidos:', allCookies.map(c => c.name));
    console.log('[Auth Middleware] Header bruto de Cookie:', req.headers.get('cookie'));
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

