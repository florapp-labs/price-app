# Feature Flags

Sistema centralizado de controle de funcionalidades e quotas por plano de assinatura.

## 📁 Estrutura

```
feature-flags/
├── types.ts          # Types, enums e mapeamentos
├── config.ts         # Configuração central (single source of truth)
├── server.ts         # API server-side (Server Components e Actions)
├── context.tsx       # React Context Provider
├── hooks.ts          # Hook único para Client Components
└── index.ts          # Exports públicos
```

## 🎯 API Pública

### **Server-Side** (Server Components e Server Actions)

```tsx
import { isFeatureAvailable, hasAvailableQuota, Feature } from '@/domains/core/feature-flags/server';

// Verificar feature
const canUseLaborCosts = await isFeatureAvailable(Feature.LABOR_COSTS);

// Verificar quota
const canCreateProduct = await hasAvailableQuota(Feature.PRODUCTS, currentCount);
```

### **Client-Side** (Client Components)

```tsx
'use client';
import { useFeatureFlags, Feature } from '@/domains/core/feature-flags';

function ProductForm() {
  const { isFeatureAvailable, hasAvailableQuota } = useFeatureFlags();
  
  const canUseLaborCosts = isFeatureAvailable(Feature.LABOR_COSTS);
  const canCreateProduct = hasAvailableQuota(Feature.PRODUCTS, products.length);
  
  return (
    <div>
      {canUseLaborCosts && <LaborCostInput />}
      {canCreateProduct ? <CreateButton /> : <UpgradeMessage />}
    </div>
  );
}
```

---

## 📘 Exemplos de Uso

### Server Component

```tsx
import { isFeatureAvailable, hasAvailableQuota, Feature } from '@/domains/core/feature-flags/server';

async function ProductPage() {
  const hasLaborCosts = await isFeatureAvailable(Feature.LABOR_COSTS);
  const canCreateProduct = await hasAvailableQuota(Feature.PRODUCTS, currentCount);
  
  return (
    <div>
      {hasLaborCosts && <LaborCostField />}
      {!canCreateProduct && <UpgradeMessage />}
    </div>
  );
}
```

### Server Action

```tsx
'use server';

import { isFeatureAvailable, hasAvailableQuota, Feature } from '@/domains/core/feature-flags/server';

export async function createProduct(data: FormData) {
  // Validar feature
  const hasLaborCosts = await isFeatureAvailable(Feature.LABOR_COSTS);
  if (!hasLaborCosts && data.get('laborCost')) {
    throw new Error('Feature não disponível no seu plano');
  }
  
  // Validar quota
  const productCount = await getProductCount();
  if (!await hasAvailableQuota(Feature.PRODUCTS, productCount)) {
    throw new Error('Limite de produtos atingido. Faça upgrade para PRO.');
  }
  
  // Criar produto...
}
```

### Client Component

```tsx
'use client';

import { useFeatureFlags, Feature } from '@/domains/core/feature-flags';

function ProductForm({ products }) {
  const { isFeatureAvailable, hasAvailableQuota } = useFeatureFlags();
  
  return (
    <div>
      {isFeatureAvailable(Feature.LABOR_COSTS) && (
        <LaborCostInput />
      )}
      
      <button disabled={!hasAvailableQuota(Feature.PRODUCTS, products.length)}>
        Criar Produto
      </button>
    </div>
  );
}
```

---

## ⚙️ Setup Inicial

Adicione o `FeatureFlagsProvider` no layout raiz:

```tsx
// app/layout.tsx
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { FeatureFlagsProvider } from '@/domains/core/feature-flags';

export default async function RootLayout({ children }) {
  const userWithAccount = await getUserWithAccount();
  
  return (
    <html>
      <body>
        <FeatureFlagsProvider planName={userWithAccount?.account?.planName ?? null}>
          {children}
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}
```

---

## � Configuração

### Adicionar Nova Feature

1. **Adicionar enum** em `types.ts`:
```typescript
export enum Feature {
  LABOR_COSTS = 'LABOR_COSTS',
  NEW_FEATURE = 'NEW_FEATURE', // ← Nova feature
  PRODUCTS = 'PRODUCTS',
  MATERIALS = 'MATERIALS',
}
```

2. **Mapear quota** (se aplicável) em `types.ts`:
```typescript
export const FEATURE_QUOTA_MAP: Partial<Record<Feature, Quota>> = {
  [Feature.PRODUCTS]: Quota.PRODUCTS,
  [Feature.NEW_FEATURE]: Quota.NEW_QUOTA, // ← Se consumir quota
};
```

3. **Adicionar ao plano** em `config.ts`:
```typescript
PRO: {
  features: [
    Feature.LABOR_COSTS,
    Feature.NEW_FEATURE, // ← Adicionar aqui
  ],
}
```

### Adicionar Nova Quota

1. **Adicionar enum** em `types.ts`:
```typescript
export enum Quota {
  PRODUCTS = 'PRODUCTS',
  NEW_QUOTA = 'NEW_QUOTA', // ← Nova quota
}
```

2. **Adicionar limites** em `config.ts`:
```typescript
FREE: {
  quotas: {
    [Quota.NEW_QUOTA]: 10, // ← Limite FREE
  },
},
PRO: {
  quotas: {
    [Quota.NEW_QUOTA]: 100, // ← Limite PRO
  },
}
```

---

## 🏗️ Arquitetura

### Princípios

1. **API minimalista**: Apenas 2 métodos server + 1 hook client
2. **Zero duplicação**: Lógica pura reutilizada em client e server
3. **Cache automático**: `cache()` do React garante 1 consulta ao DB por request
4. **Type-safe**: TypeScript garante uso correto

### Fluxo de Dados

```
Server-Side:
┌─────────────────────────────────────┐
│ isFeatureAvailable(Feature.X)       │
│ hasAvailableQuota(Feature.X, usage) │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌──────────────┐
       │ _getPlan()   │ ← cache() do React
       │ (1x/request) │
       └──────┬───────┘
              │
              ▼
     ┌────────────────┐
     │ Firestore DB   │
     └────────────────┘

Client-Side:
┌────────────────────────────────────┐
│ useFeatureFlags()                  │
│ ├─ isFeatureAvailable(Feature.X)  │
│ └─ hasAvailableQuota(Feature.X, n) │
└──────────────┬─────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │ FeatureFlagsContext │ ← Injetado no layout
    │ (planName)          │
    └──────────────────────┘
```

---

## 📊 Features vs Quotas

### Features (Booleanas)
Funcionalidades habilitadas ou desabilitadas por plano:
- `LABOR_COSTS`: Cálculo de mão de obra
- `ADVANCED_REPORTS`: Relatórios avançados
- `DATA_EXPORT`: Exportação de dados
- `API_ACCESS`: Acesso à API

### Quotas (Numéricas)
Limites quantitativos por plano:
- `PRODUCTS`: Quantidade máxima de produtos
- `MATERIALS`: Quantidade máxima de materiais

### Mapeamento Feature → Quota
Algumas features consomem quotas específicas:
```typescript
FEATURE_QUOTA_MAP = {
  [Feature.PRODUCTS]: Quota.PRODUCTS,   // Criar produto consome quota
  [Feature.MATERIALS]: Quota.MATERIALS, // Criar material consome quota
}
```

     ┌────────────────┐
     │ Firestore DB   │
     └────────────────┘

Client-Side:
┌────────────────────────────────────┐
│ useFeatureFlags()                  │
│ ├─ isFeatureAvailable(Feature.X)  │
│ └─ hasQuotaAvailable(Feature.X, n) │
└──────────────┬─────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │ FeatureFlagsContext │ ← Injetado no layout
    │ (planName)          │
    └──────────────────────┘
```

---

## 📊 Features vs Quotas

### Features (Booleanas)
Funcionalidades habilitadas ou desabilitadas por plano:
- `LABOR_COSTS`: Cálculo de mão de obra
- `ADVANCED_REPORTS`: Relatórios avançados
- `DATA_EXPORT`: Exportação de dados
- `API_ACCESS`: Acesso à API

### Quotas (Numéricas)
Limites quantitativos por plano:
- `PRODUCTS`: Quantidade máxima de produtos
- `MATERIALS`: Quantidade máxima de materiais

### Mapeamento Feature → Quota
Algumas features consomem quotas específicas:
```typescript
FEATURE_QUOTA_MAP = {
  [Feature.PRODUCTS]: Quota.PRODUCTS,   // Criar produto consome quota
  [Feature.MATERIALS]: Quota.MATERIALS, // Criar material consome quota
}
```
- `useQuota(quota, current)` → `QuotaCheckResult` - Verifica quota e retorna info completa

### Server-side

- `checkFeature(feature)` → `Promise<boolean>` - Verifica feature do usuário autenticado
- `checkQuotaUsage(quota, current)` → `Promise<QuotaCheckResult>` - Verifica quota do usuário autenticado

### Pure Functions

- `hasFeature(feature, plan)` → `boolean` - Verifica feature de um plano específico
- `hasQuota(quota, plan, current)` → `boolean` - Verifica quota de um plano específico
- `checkQuota(quota, plan, current)` → `QuotaCheckResult` - Info detalhada de quota

### Types

```typescript
interface QuotaCheckResult {
  allowed: boolean;   // Se pode realizar a ação
  current: number;    // Uso atual
  limit: number;      // Limite do plano
  remaining: number;  // Quanto falta até o limite
}
```

## ✅ Princípios

- **Single source of truth**: Toda configuração em `config.ts`
- **Separation of concerns**: Cada arquivo tem uma responsabilidade clara
- **Type-safe**: TypeScript em tudo
- **Simple API**: Apenas o essencial, sem over-engineering
- **Context-aware**: Hooks usam AuthContext automaticamente
