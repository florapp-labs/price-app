/**
 * Firebase Auth Client SDK
 * 
 * FLUXO DE AUTENTICAÇÃO SEGURO:
 * 1. Client chama signInWithPassword() ou signUpWithPassword()
 * 2. Firebase Auth valida credenciais e retorna idToken
 * 3. Client envia idToken para POST /api/auth/session
 * 4. Backend verifica idToken e cria session cookie (5 dias)
 * 5. Session cookie é usado para autenticação em requisições subsequentes
 * 
 * IMPORTANTE: 
 * - Autenticação (validação de senha) acontece 100% no Firebase Auth
 * - Backend apenas cria session cookie a partir de idToken válido
 * - Não há custom tokens ou validação de senha no backend
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let app: FirebaseApp;
let auth: Auth;

/**
 * Initialize Firebase Client SDK
 */
function initializeFirebaseClient() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  }
  return { app, auth };
}

/**
 * Sign in with email and password
 * Returns idToken to be sent to backend
 */
export async function signInWithPassword(email: string, password: string): Promise<string> {
  const { auth } = initializeFirebaseClient();
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return await userCred.user.getIdToken();
}

/**
 * Sign up with email and password
 * Returns uid and idToken
 */
export async function signUpWithPassword(email: string, password: string, displayName?: string): Promise<import('./auth.types').SignUpResult> {
  const { auth } = initializeFirebaseClient();
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCred.user) {
    const { updateProfile } = await import('firebase/auth');
    await updateProfile(userCred.user, { displayName });
  }
  
  const idToken = await userCred.user.getIdToken();
  return { uid: userCred.user.uid, idToken };
}
