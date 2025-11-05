import { NextResponse } from 'next/server';
import { auth as getAuth } from '@/domains/core/auth/auth.server';

export async function POST(request: Request) {
  const auth = await getAuth();
  try {
    console.log('Verificando token de autenticação', request);
    const { token } = await request.json();
    if (!token) return NextResponse.json({ valid: false }, { status: 401 });

    // Verifica o token com Firebase Admin
    await auth.verifyIdToken(token);

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
