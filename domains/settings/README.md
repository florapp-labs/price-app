# 🔧 Settings Domain

## Visão Geral

O domínio **Settings** gerencia as configurações globais de precificação da conta. Essas configurações são usadas como parâmetros base no cálculo automático do preço de venda dos produtos.

**Relacionamento:** 1:1 com Account (cada conta tem exatamente um documento de configurações)

---

## Estrutura

```
domains/settings/
├── types/
│   └── settings.types.ts      # Tipos TypeScript
├── repositories/
│   └── settings.repository.ts # Acesso ao Firestore
├── services/
│   └── settings.service.ts    # Lógica de negócio
└── components/                # (vazio - UI está em app/)
```

---

## Tipos de Dados

### `SettingsDocument`

Documento armazenado no Firestore:

```typescript
interface SettingsDocument {
  id: string;
  accountId: string; // Link para Account
  
  // Impostos
  taxRate: number; // Percentual (ex: 15 = 15%)
  
  // Margem de lucro
  profitMargin: number; // Percentual (ex: 30 = 30%)
  
  // Mão de obra
  laborCost: number; // Valor ou percentual
  laborCostType: 'FIXED' | 'PERCENTAGE';
  
  // Embalagem
  packagingCost: number; // Valor ou percentual
  packagingCostType: 'FIXED' | 'PERCENTAGE';
  
  // Outros custos (opcional)
  otherCosts?: number; // Valor fixo
  otherCostsDescription?: string;
  
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}
```

---

## Parâmetros de Configuração

### 1. **Taxa de Impostos** (`taxRate`)
- **Tipo:** Percentual (0-100%)
- **Uso:** Aplicado sobre o custo direto dos insumos
- **Exemplo:** 15% = impostos calculados sobre o custo total dos materiais

### 2. **Margem de Lucro** (`profitMargin`)
- **Tipo:** Percentual (0-100%)
- **Uso:** Aplicado sobre o custo total (insumos + impostos + custos adicionais)
- **Exemplo:** 30% = lucro de 30% sobre o custo total

### 3. **Custo de Mão de Obra** (`laborCost`)
- **Tipo:** Valor fixo (R$) ou Percentual (%)
- **Configuração:** `laborCostType` define se é FIXED ou PERCENTAGE
- **Uso:** 
  - FIXED: valor adicionado a cada produto
  - PERCENTAGE: percentual aplicado sobre o custo total

### 4. **Custo de Embalagem** (`packagingCost`)
- **Tipo:** Valor fixo (R$) ou Percentual (%)
- **Configuração:** `packagingCostType` define se é FIXED ou PERCENTAGE
- **Uso:**
  - FIXED: valor adicionado a cada produto
  - PERCENTAGE: percentual aplicado sobre o custo total

### 5. **Outros Custos** (`otherCosts`) - Opcional
- **Tipo:** Valor fixo (R$)
- **Descrição:** Campo livre para descrever o que representa (frete, cartão, etc.)
- **Uso:** Valor adicionado diretamente ao custo de cada produto

---

## Fluxo de Criação

As configurações são criadas **automaticamente** durante o signup:

```
1. Usuário se cadastra
2. Account é criada
3. Settings são criadas com valores padrão (taxRate: 0%, profitMargin: 30%, etc.)
4. User é criado e linkado ao Account
```

**Código:** Ver `app/api/auth/signup/route.ts`

---

## API Endpoints

### `GET /api/settings`
Retorna as configurações da conta do usuário autenticado.

**Resposta:**
```json
{
  "id": "settings-123",
  "accountId": "account-456",
  "taxRate": 15,
  "profitMargin": 30,
  "laborCost": 50,
  "laborCostType": "FIXED",
  "packagingCost": 5,
  "packagingCostType": "PERCENTAGE",
  "otherCosts": 10,
  "otherCostsDescription": "Frete",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### `PUT /api/settings`
Atualiza as configurações da conta do usuário autenticado.

**Body:**
```json
{
  "taxRate": 18,
  "profitMargin": 35,
  "laborCost": 60,
  "laborCostType": "FIXED"
}
```

**Validações:**
- `taxRate` e `profitMargin`: 0-100%
- `laborCost`, `packagingCost`, `otherCosts`: não negativos

---

## Página de Edição

**Rota:** `/settings`

A página permite editar todos os parâmetros de configuração através de um formulário interativo:

- Campos numéricos para percentuais e valores
- Toggle para alternar entre valor fixo e percentual (mão de obra e embalagem)
- Feedback visual de salvamento com mensagens de sucesso/erro
- Validação client-side e server-side

**Código:** `app/(private)/settings/page.tsx`

---

## Uso no Cálculo de Preço

Estas configurações serão usadas pela lógica de precificação em `domains/products/pricing/`:

```typescript
// Pseudocódigo
const materialsCost = calculateMaterialsCost(product);
const taxCost = materialsCost * (settings.taxRate / 100);
const laborCost = settings.laborCostType === 'FIXED' 
  ? settings.laborCost 
  : materialsCost * (settings.laborCost / 100);
const packagingCost = settings.packagingCostType === 'FIXED'
  ? settings.packagingCost
  : materialsCost * (settings.packagingCost / 100);

const totalCost = materialsCost + taxCost + laborCost + packagingCost + settings.otherCosts;
const sellingPrice = totalCost * (1 + settings.profitMargin / 100);
```

---

## Próximos Passos

- [ ] Integrar settings no cálculo de preço dos produtos
- [ ] Adicionar histórico de alterações (audit log)
- [ ] Permitir múltiplos perfis de configuração (ex: varejo vs atacado)
