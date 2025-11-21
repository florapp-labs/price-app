'use server';

import { cookies } from 'next/headers';
import { auth as getAuth } from '@/domains/core/auth/auth.server';
import { SessionData } from './auth.types';

/**
 * Obtém a sessão atual do cookie
 * Verifica o token de sessão do Firebase Admin
 */
export async function getSession(): Promise<SessionData | null> {
  const auth = await getAuth();
  const cook = await cookies();
  const sessionCookie = cook.get('session');

  console.log('[Session] Retrieving session from cookie');
  
  if (!sessionCookie?.value) {
    console.error('[Session] No session cookie found');
    return null;
  }

  try {
    // checkRevoked: true garante que tokens revogados sejam rejeitados
    const decodedToken = await auth.verifySessionCookie(sessionCookie.value, true);

    console.log('[Session] Session cookie verified successfully');

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      expires: new Date(decodedToken.exp * 1000).toISOString(),
      // Custom claims (avoid Firestore queries for accountId and planName)
      accountId: decodedToken.accountId as string | undefined,
      planName: decodedToken.planName as 'FREE' | 'PRO' | undefined,
    };
  } catch (error: any) {
    console.error('[Session] Failed to verify session cookie:', error.code || error.message);
    
    // Se o cookie está inválido/expirado, remove ele
    if (error.code === 'auth/session-cookie-expired' || 
        error.code === 'auth/session-cookie-revoked' ||
        error.code === 'auth/invalid-session-cookie') {
      cook.delete('session');
    }
    
    return null;
  }
}

/**
 * Cria o cookie de sessão do Firebase (5 dias)
 * 
 * SECURITY: Este método valida o idToken antes de criar o session cookie.
 * O Firebase Admin SDK verifica:
 * - Assinatura do token (garante que veio do Firebase Auth)
 * - Expiração do token
 * - Revogação do token
 * - Issuer e audience corretos
 * 
 * Só após validação bem-sucedida é que o session cookie é criado.
 * 
 * @param idToken - Token de ID do Firebase (obtido após login client-side)
 */
export async function setSession(idToken: string) {
  const auth = await getAuth();
  const cook = await cookies();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dias em milissegundos

  try {
    // Cria um session cookie a partir do idToken
    // Este cookie será verificado no middleware
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    cook.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge em segundos
      httpOnly: true, // Previne acesso via JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'lax', // Proteção contra CSRF
      path: '/',
    });
    
    console.log('[Session] Session cookie created successfully');
  } catch (error: any) {
    console.error('[Session] Failed to create session cookie:', error.code || error.message);
    throw new Error('Não foi possível criar a sessão.');
  }
}

/**
 * Remove o cookie de sessão
 */
export async function clearSession() {
  const cook = await cookies();
  cook.delete('session');
}
