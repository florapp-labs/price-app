# 🔐 Fluxo de Autenticação

Este documento descreve o fluxo completo de autenticação na aplicação.

---

## 📋 Visão Geral

A autenticação utiliza **Firebase Auth** (client-side) para validar credenciais e **Session Cookies** (server-side) para manter sessões persistentes.

### Princípios de Segurança

✅ **Validação de senha acontece 100% no Firebase Auth** (client-side)  
✅ **Backend apenas cria session cookies** a partir de idTokens válidos  
✅ **Session cookies são httpOnly** (proteção contra XSS)  
✅ **Tokens são verificados antes de criar session** (Firebase Admin SDK)  
✅ **Sem custom tokens** (eliminando vetores de ataque)

---

## 🔄 Fluxo de Login

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │ Firebase Auth│         │   Backend   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. signInWithPassword()                       │
       │──────────────────────>│                        │
       │                       │                        │
       │  2. Valida email/senha                         │
       │                       │                        │
       │  3. Retorna idToken   │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │  4. POST /api/auth/session { idToken }         │
       │────────────────────────────────────────────────>│
       │                       │                        │
       │                       │  5. Verifica idToken   │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │  6. idToken válido     │
       │                       │────────────────────────>│
       │                       │                        │
       │  7. Session cookie criado (5 dias)             │
       │<────────────────────────────────────────────────│
       │                       │                        │
       │  8. Redirect /dashboard                        │
       │                       │                        │
```

### Código de Exemplo (Login)

```typescript
// pages/login/page.tsx (client-side)
import { signInWithPassword } from '@/domains/core/auth/firebase-auth.client';

async function handleLogin(email: string, password: string) {
  try {
    // 1. Firebase Auth valida credenciais
    const idToken = await signInWithPassword(email, password);
    
    // 2. Envia idToken para backend criar session cookie
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      // 3. Session cookie foi criado, redireciona
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login falhou:', error);
  }
}
```

---

## 📝 Fluxo de Cadastro (Signup)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │ Firebase Auth│         │   Backend   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. signUpWithPassword()                       │
       │──────────────────────>│                        │
       │                       │                        │
       │  2. Cria conta no Auth                         │
       │                       │                        │
       │  3. Retorna uid + idToken                      │
       │<──────────────────────│                        │
       │                       │                        │
       │  4. POST /api/auth/signup { uid, email, name, idToken }
       │────────────────────────────────────────────────>│
       │                       │                        │
       │                       │  5. Verifica idToken   │
       │                       │<───────────────────────│
       │                       │                        │
       │  6. Cria documento Firestore (users/{uid})     │
       │                       │                        │
       │  7. Cria session cookie (5 dias)               │
       │<────────────────────────────────────────────────│
       │                       │                        │
       │  8. Redirect /dashboard                        │
       │                       │                        │
```

### Código de Exemplo (Signup)

```typescript
// pages/signup/page.tsx (client-side)
import { signUpWithPassword } from '@/domains/core/auth/firebase-auth.client';

async function handleSignup(email: string, password: string, name: string) {
  try {
    // 1. Firebase Auth cria conta
    const { uid, idToken } = await signUpWithPassword(email, password, name);
    
    // 2. Backend cria documento Firestore e session cookie
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email, name, idToken })
    });
    
    if (response.ok) {
      // 3. Usuário criado e logado, redireciona
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Cadastro falhou:', error);
  }
}
```

---

## 🔒 Proteção de Rotas

### Client-Side (Middleware)

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

**Importante**: Middleware apenas verifica a **presença** do cookie (Edge Runtime não suporta Firebase Admin SDK).

### Server-Side (Validação Real)

```typescript
// layouts ou pages (Server Components)
import { requireAuth } from '@/domains/core/auth/require-auth';

export default async function DashboardLayout() {
  // Valida session cookie no Firebase Admin SDK
  const user = await requireAuth();
  
  return <div>Dashboard do {user.name}</div>;
}
```

---

## 🚪 Logout

```typescript
// Qualquer componente client-side
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}
```

O endpoint `/api/auth/logout` apenas deleta o session cookie:

```typescript
// app/api/auth/logout/route.ts
import { clearSession } from '@/domains/core/auth/session';

export async function POST() {
  await clearSession();
  return Response.json({ success: true });
}
```

---

## 🔑 Estrutura de Arquivos

```
domains/core/auth/
├── firebase-auth.client.ts  # Firebase Auth SDK (client-side)
│   ├── signInWithPassword()
│   └── signUpWithPassword()
│
├── auth.server.ts           # Firebase Admin SDK (server-side)
│   └── auth() → retorna instância do Firebase Admin Auth
│
├── session.ts               # Gerenciamento de session cookies
│   ├── setSession()         # Cria cookie (verifica idToken)
│   ├── getSession()         # Lê e valida cookie
│   └── clearSession()       # Remove cookie
│
├── require-auth.tsx         # HOC para proteger Server Components
│   └── requireAuth()        # Valida sessão ou redireciona
│
└── auth-context.tsx         # React Context para estado do usuário
    └── AuthProvider
```

---

## ⚠️ Anti-Patterns (O que NÃO fazer)

### ❌ Validar senha no backend

```typescript
// ERRADO - Backend não deve validar senhas
export async function POST(request: Request) {
  const { email, password } = await request.json();
  // Firebase Admin SDK não tem método para validar senha!
}
```

**Correto**: Validação de senha acontece no client com Firebase Auth.

---

### ❌ Usar custom tokens para login

```typescript
// ERRADO - Custom tokens bypassam validação de senha
const customToken = await auth.createCustomToken(uid);
```

**Correto**: Custom tokens só devem ser usados para casos especiais (ex: migração de sistemas).

---

### ❌ Confiar em uid/email da request

```typescript
// ERRADO - Client pode mandar qualquer uid
const { uid, email } = await request.json();
await createUser(uid, email); // ← Vulnerabilidade!
```

**Correto**: Extrair uid/email do idToken verificado.

---

## 🧪 Como Testar

### 1. Login
```bash
# No browser console
await fetch('/api/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: 'SEU_ID_TOKEN_AQUI' })
})
```

### 2. Verificar Session Cookie
```bash
# No browser console
document.cookie
# Deve mostrar: session=...
```

### 3. Testar Expiração
```bash
# Session cookie expira em 5 dias
# Após expiração, usuário será redirecionado para /login
```

---

## 📚 Referências

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
