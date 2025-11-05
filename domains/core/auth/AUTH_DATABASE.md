# 🔗 Autenticação + Banco de Dados

Este documento explica como o Firebase Auth se relaciona com o Firestore e como fazer queries filtradas por usuário.

---

## 🎯 Conceito Principal

```
Firebase Auth (uid)  ←→  Firestore (document ID)
     usuario123           users/usuario123
                          products/produto-abc (owner: usuario123)
                          materials/material-xyz (owner: usuario123)
```

**Regra de Ouro**: O `uid` do Firebase Auth é usado como **chave estrangeira** em todos os documentos do usuário.

---

## 📊 Estrutura do Banco de Dados

```
firestore/
├── users/
│   └── {uid}/                    ← uid do Firebase Auth como ID do documento
│       ├── email: string
│       ├── name: string
│       ├── planName: 'FREE' | 'PRO'
│       └── createdAt: timestamp
│
├── products/
│   └── {productId}/
│       ├── name: string
│       ├── price: number
│       └── owner: string         ← uid do Firebase Auth
│
└── materials/
    └── {materialId}/
        ├── name: string
        ├── cost: number
        └── owner: string         ← uid do Firebase Auth
```

---

## 🔐 Fluxo: Autenticação → Session → UID → Queries

### 1️⃣ **Login/Signup cria documento do usuário**

```typescript
// app/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  const { uid, email, name, idToken } = await request.json();
  
  // 1. Cria documento no Firestore usando uid do Firebase Auth
  await createUser(uid, email, { name });
  //    ↑ users/{uid}
  
  // 2. Cria session cookie
  await setSession(idToken);
  
  return NextResponse.json({ success: true });
}
```

**Resultado**: 
- Firebase Auth tem usuário com `uid: "abc123"`
- Firestore tem documento em `users/abc123`

---

### 2️⃣ **Session Cookie armazena o UID**

```typescript
// domains/core/auth/session.ts
export async function getSession(): Promise<SessionData | null> {
  const sessionCookie = cookies().get('session');
  
  const decodedToken = await auth.verifySessionCookie(sessionCookie.value);
  
  return {
    uid: decodedToken.uid,     // ← UID extraído do token
    email: decodedToken.email,
    expires: new Date(decodedToken.exp * 1000).toISOString(),
  };
}
```

**Resultado**: 
- Cookie criptografado contém `uid: "abc123"`
- `getSession()` retorna o uid do usuário logado

---

### 3️⃣ **getUser() busca dados do usuário no Firestore**

```typescript
// domains/users/repositories/user.repository.ts
export async function getUser(): Promise<UserDocument | null> {
  // 1. Pega o uid da session
  const session = await getSession();
  if (!session) return null;
  
  // 2. Busca documento do usuário no Firestore
  return await getUserByUid(session.uid);
  //                         ↑ users/{uid}
}
```

**Uso prático**:

```typescript
// Qualquer Server Component ou Server Action
import { getUser } from '@/domains/users/repositories/user.repository';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Olá, {user.name}!</div>;
}
```

---

## 📦 Exemplo Completo: Produtos por Usuário

### **Estrutura de Dados**

```typescript
// domains/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  owner: string;           // ← uid do Firebase Auth
  ingredients: Ingredient[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### **1. Criar Produto (Server Action)**

```typescript
// domains/products/repositories/product.repository.ts
'use server';

import { getUser } from '@/domains/users/repositories/user.repository';
import { Database } from '@/domains/core/database/firestore.client';

export async function createProduct(data: {
  name: string;
  price: number;
  ingredients: Ingredient[];
}) {
  // 1. Pega usuário autenticado da session
  const user = await getUser();
  if (!user) throw new Error('Não autenticado');
  
  const db = await Database();
  
  // 2. Cria produto com owner = uid do usuário
  const productRef = db.collection('products').doc();
  
  await productRef.set({
    ...data,
    owner: user.uid,                    // ← Relaciona produto ao usuário
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  
  return { id: productRef.id };
}
```

---

### **2. Listar Produtos do Usuário**

```typescript
// domains/products/repositories/product.repository.ts
export async function getProducts(): Promise<Product[]> {
  // 1. Pega usuário autenticado
  const user = await getUser();
  if (!user) return [];
  
  const db = await Database();
  
  // 2. Query filtrando por owner = uid
  const snapshot = await db
    .collection('products')
    .where('owner', '==', user.uid)    // ← Filtra apenas produtos do usuário
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
}
```

---

### **3. Atualizar/Deletar com Validação de Ownership**

```typescript
// domains/products/repositories/product.repository.ts
export async function updateProduct(
  productId: string,
  data: Partial<Product>
) {
  const user = await getUser();
  if (!user) throw new Error('Não autenticado');
  
  const db = await Database();
  const productRef = db.collection('products').doc(productId);
  
  // 1. Busca produto
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error('Produto não encontrado');
  }
  
  // 2. Valida ownership
  const product = productDoc.data() as Product;
  if (product.owner !== user.uid) {
    throw new Error('Você não tem permissão para editar este produto');
  }
  
  // 3. Atualiza
  await productRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
```

---

## 🛡️ Security Rules do Firestore

Para garantir segurança no client-side, configure as regras do Firestore:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Usuário pode ler apenas seu próprio documento
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Apenas admin pode criar/atualizar (via backend)
      allow write: if false;
    }
    
    // Products collection
    match /products/{productId} {
      // Usuário pode ler apenas seus próprios produtos
      allow read: if request.auth != null 
                  && resource.data.owner == request.auth.uid;
      
      // Usuário pode criar produtos com seu uid como owner
      allow create: if request.auth != null 
                    && request.resource.data.owner == request.auth.uid;
      
      // Usuário pode atualizar apenas seus produtos
      allow update: if request.auth != null 
                    && resource.data.owner == request.auth.uid;
      
      // Usuário pode deletar apenas seus produtos
      allow delete: if request.auth != null 
                    && resource.data.owner == request.auth.uid;
    }
    
    // Materials collection (mesma lógica)
    match /materials/{materialId} {
      allow read, write: if request.auth != null 
                         && resource.data.owner == request.auth.uid;
    }
  }
}
```

---

## 🔄 Fluxo Completo: Criar Produto

```
┌─────────────────┐
│  User Interface │
└────────┬────────┘
         │
         │ 1. Usuário clica "Criar Produto"
         ↓
┌────────────────────────────┐
│  Server Action             │
│  createProduct()           │
└────────┬───────────────────┘
         │
         │ 2. const user = await getUser()
         ↓
┌────────────────────────────┐
│  getUser()                 │
│  ├─ getSession()           │ ← Lê session cookie
│  │   └─ uid: "abc123"      │
│  └─ getUserByUid(uid)      │ ← Busca users/abc123
└────────┬───────────────────┘
         │
         │ 3. Retorna { uid, email, name, planName }
         ↓
┌────────────────────────────┐
│  createProduct()           │
│  ├─ owner: user.uid        │ ← Define owner = "abc123"
│  └─ products/{newId}       │ ← Cria documento
└────────┬───────────────────┘
         │
         │ 4. Produto criado!
         ↓
┌────────────────────────────┐
│  Firestore                 │
│  products/produto-xyz      │
│    ├─ name: "Buquê Rosa"  │
│    ├─ price: 150.00        │
│    └─ owner: "abc123"      │ ← Relacionado ao usuário
└────────────────────────────┘
```

---

## 🎓 Padrões Recomendados

### ✅ **DO: Sempre use `getUser()` para pegar o usuário autenticado**

```typescript
export async function createProduct(data: ProductInput) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');
  
  // ... resto da lógica
  await db.collection('products').doc().set({
    ...data,
    owner: user.uid,  // ← Correto
  });
}
```

---

### ✅ **DO: Valide ownership antes de operações sensíveis**

```typescript
export async function deleteProduct(productId: string) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');
  
  const product = await getProductById(productId);
  
  // Valida que o produto pertence ao usuário
  if (product.owner !== user.uid) {
    throw new Error('Forbidden: Not your product');
  }
  
  await db.collection('products').doc(productId).delete();
}
```

---

### ❌ **DON'T: Nunca confie em uid vindo do client**

```typescript
// ❌ ERRADO - Client pode mentir sobre o uid
export async function createProduct(data: ProductInput, userId: string) {
  await db.collection('products').doc().set({
    ...data,
    owner: userId,  // ← VULNERABILIDADE! Client controla o userId
  });
}

// ✅ CORRETO - Sempre pega do server
export async function createProduct(data: ProductInput) {
  const user = await getUser();  // ← Pega da session (server-side)
  // ...
}
```

---

### ✅ **DO: Use queries filtradas por owner**

```typescript
// Lista TODOS os produtos (❌ ERRADO se app é multi-tenant)
const allProducts = await db.collection('products').get();

// Lista apenas produtos do usuário (✅ CORRETO)
const userProducts = await db
  .collection('products')
  .where('owner', '==', user.uid)
  .get();
```

---

## 🧪 Exemplo de Teste

```typescript
// test/products.test.ts
import { createProduct, getProducts } from '@/domains/products/repositories/product.repository';
import { getUser } from '@/domains/users/repositories/user.repository';

describe('Products Repository', () => {
  it('should create product with current user as owner', async () => {
    // Mock session
    jest.spyOn(sessionModule, 'getSession').mockResolvedValue({
      uid: 'test-user-123',
      email: 'test@example.com',
      expires: '2025-12-31',
    });
    
    // Create product
    const product = await createProduct({
      name: 'Test Product',
      price: 100,
    });
    
    // Verify owner is set correctly
    expect(product.owner).toBe('test-user-123');
  });
  
  it('should only return products owned by current user', async () => {
    const products = await getProducts();
    
    // All products should have owner = current user uid
    products.forEach(product => {
      expect(product.owner).toBe('test-user-123');
    });
  });
});
```

---

## 📝 Resumo

1. **UID do Firebase Auth** = Chave primária do usuário
2. **Session Cookie** armazena o UID criptografado
3. **getUser()** extrai UID da session e busca dados no Firestore
4. **owner field** relaciona documentos ao usuário (chave estrangeira)
5. **Queries sempre filtram** por `owner == user.uid`
6. **Nunca confiar** em UID vindo do client

**Fluxo mental**:
```
Session → UID → Query filtrada por owner
```

---

## 🔗 Arquivos Relacionados

- `domains/core/auth/session.ts` - Gerencia session cookies
- `domains/users/repositories/user.repository.ts` - Funções de usuário
- `domains/core/database/types.ts` - Tipos do banco de dados
