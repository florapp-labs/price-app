# 🔐 Authentication Module

Módulo centralizado de autenticação da aplicação, responsável por gerenciar login, sessão e proteção de rotas.

## 📁 Estrutura

```
domains/core/auth/
├── index.ts              # Barrel export - ponto de entrada do módulo
├── auth.types.ts         # TypeScript types e interfaces
├── auth.hooks.ts         # React hooks (useAuth)
├── auth-context.tsx      # React Context e Provider
├── auth.client.ts        # Client-side auth (Firebase Auth SDK)
├── auth.server.ts        # Server-side auth (Firebase Admin SDK)
├── auth.session.ts       # Session management (cookies)
├── auth.hoc.tsx          # Higher-Order Component para proteção de rotas
└── README.md             # Este arquivo
```

## 🎯 Responsabilidades

### auth.types.ts
Define todos os tipos TypeScript do módulo:
- `AuthState`: Estado global de autenticação (user + account)
- `SessionData`: Dados armazenados no cookie de sessão
- `AuthCredentials`: Credenciais de login
- `SignUpResult`: Resultado do cadastro

### auth.hooks.ts
Exporta hooks React para consumo do estado de autenticação:
- `useAuth()`: Acessa user e account do contexto

### auth-context.tsx
Provê estado de autenticação via React Context:
- `AuthContext`: Context API do React
- `AuthProvider`: Provider component que envolve a aplicação

### auth.client.ts
Funções de autenticação client-side (Firebase Auth SDK):
- `signInWithPassword()`: Login com email/senha
- `signUpWithPassword()`: Cadastro com email/senha

### auth.server.ts
Instância do Firebase Admin Auth para uso server-side:
- `auth()`: Retorna instância do Firebase Admin Auth
- Usado para verificar tokens, criar session cookies, gerenciar usuários

### auth.session.ts
Gerenciamento de sessão via cookies (Server Actions):
- `getSession()`: Obtém sessão atual do cookie
- `setSession()`: Cria cookie de sessão (5 dias)
- `clearSession()`: Remove cookie de sessão

### auth.hoc.tsx
Higher-Order Component para proteção de rotas:
- `withAuth()`: HOC que envolve páginas server-side e injeta dados do usuário autenticado
- Valida sessão automaticamente e redireciona para login se não autenticado
- Passa `user` e `account` como props para a página protegida

## 🔄 Fluxo de Autenticação

### Login
1. **Client**: Usuário submete email/senha
2. **Client**: `signInWithPassword()` valida credenciais no Firebase Auth
3. **Client**: Firebase retorna `idToken`
4. **Client**: Envia `idToken` para `POST /api/auth/login`
5. **Server**: `setSession()` verifica token e cria session cookie (5 dias)
6. **Client**: Cookie é armazenado automaticamente pelo browser

### Verificação de Sessão
1. **Server**: `withAuth()` HOC ou middleware verifica cookie
2. **Server**: `getSession()` valida session cookie via Firebase Admin
3. **Server**: Retorna dados do usuário ou redireciona para login

### Logout
1. **Client**: Requisição para `POST /api/auth/logout`
2. **Server**: `clearSession()` remove cookie de sessão
3. **Client**: Redirecionado para login

## 📦 Como Usar

### Proteção de rotas com HOC (Recomendado)
```tsx
import { withAuth } from '@/domains/core/auth';
import { UserDocument, AccountDocument } from '@/domains/core/database/types';

interface DashboardPageProps {
  user: UserDocument;
  account: AccountDocument;
}

async function DashboardPage({ user, account }: DashboardPageProps) {
  return (
    <div>
      <h1>Welcome {user.displayName}</h1>
      <p>Email: {user.email}</p>
      <p>Plano: {account.planName}</p>
    </div>
  );
}

export default withAuth(DashboardPage);
```

### Acessar estado de autenticação (Client Component)
```tsx
'use client';
import { useAuth } from '@/domains/core/auth';

export function UserProfile() {
  const { user, account } = useAuth();
  
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>Plano: {account?.planName}</p>
    </div>
  );
}
```

### Login (Client Component)
```tsx
'use client';
import { signInWithPassword } from '@/domains/core/auth';

async function handleLogin(email: string, password: string) {
  try {
    const idToken = await signInWithPassword(email, password);
    
    // Envia token para criar sessão
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    
    if (res.ok) {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Verificar sessão (Server Action)
```tsx
'use server';
import { getSession } from '@/domains/core/auth';

export async function getCurrentUser() {
  const session = await getSession();
  return session?.uid || null;
}
```

## 🔒 Segurança

- **Session cookies são httpOnly**: Protege contra XSS
- **Tokens verificados server-side**: Firebase Admin valida assinatura
- **Session cookies expiram em 5 dias**: Reduz janela de ataque
- **Revogação de tokens**: Firebase Admin verifica se token foi revogado
- **HTTPS em produção**: Cookies marcados como secure
- **SameSite=lax**: Proteção contra CSRF

## 🎨 Convenções

- **Nomenclatura**: Todos arquivos seguem padrão `auth.[tipo].[extensão]`
- **Documentação**: JSDoc em todas funções públicas
- **Idioma**: Código e comentários em inglês, docs em português
- **Exports**: Sempre usar barrel export (`index.ts`)

## 🔗 Dependências

- `firebase/auth`: SDK client-side do Firebase Auth
- `firebase-admin/auth`: SDK server-side do Firebase Admin
- `next/headers`: Acesso a cookies no Next.js
- `@/domains/core/database/types`: Tipos de User e Account
- `@/domains/users/repositories`: Repositório de usuários
