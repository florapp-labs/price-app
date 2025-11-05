import { getUser, createUser } from '@/domains/users/repositories/user.repository';
import { NextRequest } from 'next/server';
import { auth as getAuth } from '@/domains/core/auth/auth.server';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}

/**
 * POST /api/user - Cria um documento de usuário no Firestore após sign-up
 * IMPORTANTE: Valida o idToken do Firebase antes de criar o documento
 * Isso previne que alguém crie documentos de usuário arbitrários
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, name } = body;

    if (!idToken) {
      return Response.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    // Verifica o idToken do Firebase para garantir que é um usuário válido
    const auth = await getAuth();
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error('[API User] Invalid idToken:', error.code || error.message);
      return Response.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { uid, email } = decodedToken;

    if (!email) {
      return Response.json(
        { error: 'Email not found in token' },
        { status: 400 }
      );
    }

    // Cria o documento do usuário no Firestore
    await createUser(uid, email, { name: name || null });

    console.log('[API User] User document created successfully for:', uid);
    return Response.json({ success: true, uid });
  } catch (error: any) {
    console.error('[API User] Error creating user document:', error);
    return Response.json(
      { error: 'Failed to create user document' },
      { status: 500 }
    );
  }
}
