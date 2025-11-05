'use server';
// core/firebase/firebase.client.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

/**
 * Garante que o código só rode no ambiente server-side.
 * Se for chamado no cliente, lança erro imediatamente.
 */
function ensureServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin só pode ser usado no servidor.');
  }
}

/**
 * Inicializa o Firebase Admin App com a conta de serviço.
 * Usa cache interno do SDK para evitar múltiplas inicializações.
 */
export async function firebaseApp(): Promise<App> {
  ensureServerEnv();

  const existingApps = getApps();
  if (existingApps.length) return existingApps[0];

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error('Variável FIREBASE_ADMIN_SERVICE_ACCOUNT não configurada.');
  }

  let serviceAccount: Record<string, any>;
  try {
    serviceAccount = JSON.parse(atob(serviceAccountJson));
  } catch {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT não é um JSON válido.');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}