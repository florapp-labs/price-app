# 🧮 Precificação Inteligente — MicroSaaS para lojistas

## 🌱 Visão geral

Este projeto é um **micro-SaaS** voltado a **lojistas e floriculturas** que constroem **produtos compostos** (kits, boxes, cestas, arranjos).  
Objetivo principal: **calcular automaticamente o preço de venda** com base em insumos, impostos, margem de lucro e custos configuráveis, e **alertar produtos que precisam de reajuste** quando insumos mudam de preço.

Principais requisitos de design:
- Simplicidade e autonomia (rodar sem operação manual).  
- Modularidade (recursos vendáveis como add-ons).  
- Escalabilidade para crescer do MVP a uma plataforma maior.

---

## 🧩 Principais funcionalidades

- **Cálculo automático de preço de venda**  
  - Preço derivado da composição de insumos + custos variáveis + impostos + margem.

- **Detecção de necessidade de reajuste**  
  - Produtos que usam insumos atualizados são destacados na listagem.

- **Controle de funcionalidades e quotas por plano**  
  - Funcionalidades (ex: dashboard de análise) são disponibilizadas de acordo com o plano de assinatura.
  - Quotas (ex: máximo de produtos) também são controladas por plano.

- **Versão gratuita + upgrade via Stripe** 
  - Free: funcionalidades e quotas limitadas.  
  - PRO: módulos desbloqueados após pagamento.

- **Dashboard de acompanhamento**  
  - Lista de produtos, produtos com necessidade de reajuste, e ações de recalculo.

---

## ⚙️ Arquitetura — visão geral

A arquitetura foi desenhada para ser prática e simples, mas seguindo boas práticas de projeto e desenvolvimento:

### **Next.js + Vercel**
- **Responsabilidade:** Motor geral da aplicação. Monolito Api (BFF) + UI.
- **Motivo:** suporte nativo a Next.js, deploys rápidos, preview links e fácil escalabilidade.  
- **Resumo:** app shell que orquestra módulos, consome Firebase/Stripe e serve a UI principal.

### **Firebase Auth**
- **Responsabilidade:** autenticação (email/password, Google, etc.) e sessão persistente.  
- **Motivo:** login rápido e confiável sem backend customizado.  
- **Resumo:** garante que cada usuário seja identificado e persistido antes de gravar dados no DB.

### **Firestore (Firebase DB)**
- **Responsabilidade:** armazenamento de dados principais — usuários, planos, quotas, insumos, produtos, etc.  
- **Motivo:** NoSQL em tempo real, fácil integração com frontend e escalável.  
- **Resumo:** fonte única de verdade para planos/quotas e para composição (products → ingredients → insumos).


### **Stripe — planos e upgrades**
**Responsabilidade:** gerenciar planos pagos, cobranças e upgrades. 
**Integração:** via webhooks que atualizam o status da assinatura no Firestore.  
**Fluxo:**
1. Usuário sempre começa no plano **Free**, com quotas e recursos limitados.  
2. Ao assinar o **Plano Pro** no Stripe Checkout, o webhook atualiza o campo relacionado ao plano, no documento do usuário na base de dados.
3. A aplicação detecta a mudança e libera automaticamente as features e quotas premium.

### **React Context**
**Responsabilidade:** armazenar e sincronizar o estado da aplicação no frontend.  
**Uso:** manter sessão, plano do usuário e flags de funcionalidades (`hasFeature`, `hasQuota`).  

---

## 📁 Estrutura de Domínios

A aplicação está organizada em **domínios auto-contidos**, onde cada domínio centraliza TUDO relacionado a ele: lógica de negócio, acesso a dados, tipos, e componentes específicos.

### **Princípio de Organização**

Cada domínio está localizado em `domains/[nome-do-dominio]/` e contém:
- **repositories/**: Acesso a dados (Firestore queries)
- **services/**: Lógica de negócio
- **types/**: Tipos TypeScript específicos do domínio
- **components/**: Componentes React específicos do domínio (quando necessário)

As páginas do Next.js em `app/` são uma **camada fina** que importa e renderiza componentes dos domínios.

### **Domínios**

#### **core/** - Infraestrutura Compartilhada
Centraliza toda infraestrutura compartilhada entre os domínios:
- **auth/**: Autenticação, sessão, middleware de validação
- **database/**: Configuração Firebase/Firestore (client e admin)
- **feature-flags/**: Sistema de features e quotas por plano
- **payments/**: Integração com Stripe

#### **accounts/** - Contas (Accounts)
Gerencia contas da aplicação:
- **repositories/**: CRUD de accounts (create, update, getById)
- **types/**: AccountDocument (plano, assinatura Stripe)

**Arquitetura Multi-Tenant Ready, Single-Tenant Operating:**
- **Atual (MVP)**: Relação 1:1 Account ↔ User (cada usuário tem sua própria conta)
- **Futuro**: Relação 1:N Account ↔ Users (múltiplos usuários por conta/equipe)
- **Vantagem**: Dados já estruturados corretamente, migração zero quando adicionar multi-tenant

#### **users/** - Usuários
Gerencia tudo relacionado a usuários:
- **repositories/**: Queries do Firestore para usuários, getUserWithAccount()
- **services/**: Lógica de negócio de usuários (quando necessário)
- **types/**: Tipos de usuário (re-exporta de core/database/types)

**Relacionamento:** Cada User possui `accountId` (link para Account)

#### **materials/** - Materiais (Insumos)
Domínio para gerenciar materiais/insumos usados nos produtos:
- Estrutura preparada para implementação futura

#### **products/** - Produtos
Domínio para gerenciar produtos compostos (kits, boxes, etc.):
- **pricing/**: Lógica de cálculo automático de preço
- Estrutura preparada para implementação futura

#### **settings/** - Configurações
Domínio para parâmetros globais (impostos, margem de lucro, custos):
- Estrutura preparada para implementação futura

---

## 🧩 Controle central de funcionalidades e quotas

A aplicação possui um módulo dedicado (`domains/core/feature-flags/`) que centraliza toda a lógica de controle de funcionalidades e limites por plano. Este módulo funciona como uma **fonte única de verdade** para definir o que cada plano pode ou não fazer.

### Como funciona

O controle é baseado em dois conceitos principais:

1. **Features (Funcionalidades)**: Recursos booleanos — ou o usuário tem acesso ou não tem.  
   Exemplos: cálculo de mão de obra, relatórios avançados, exportação de dados, acesso à API.

2. **Quotas (Limites)**: Recursos numéricos — o usuário pode usar até um limite máximo definido por plano.  
   Exemplos: quantidade máxima de produtos (free: 10, pro: 500), materiais cadastrados.

### Fluxo de verificação

Quando a aplicação precisa verificar se uma ação é permitida:

1. **Para Features**: Verifica o plano da conta e se a feature está disponível para aquele plano.
   ```ts
   hasFeature(Feature.LABOR_COSTS, account.planName) // retorna true/false
   ```

2. **Para Quotas**: Verifica o plano da conta, o limite máximo do plano, e compara com o uso atual.
   ```ts
   hasQuota(Quota.PRODUCTS, account.planName, currentProductCount) // retorna true se ainda há espaço
   ```

### Onde é usado

- **No Frontend**: Para mostrar/ocultar botões, campos e funcionalidades na interface.
- **No Backend**: Para validar operações antes de criar/atualizar dados (Server Actions, API Routes).
- **No Middleware**: Para proteger rotas baseadas em features ou quotas.

### Estrutura mínima

O módulo tem:

- **Enum de Features e Quotas**: Define todas as features e quotas disponíveis.
- **Configuração por Plano**: Define quais planos têm acesso a cada feature e os limites de cada quota.
- **Funções auxiliares**: `hasFeature()` e `hasQuota()` que centralizam a lógica de verificação.

### Exemplo prático

```ts
// Verificar se pode usar feature de mão de obra
if (hasFeature(Feature.LABOR_COSTS, account.planName)) {
  // exibir campo de custo de mão de obra
}

// Verificar se pode criar mais produtos
if (hasQuota(Quota.PRODUCTS, account.planName, currentProductCount)) {
  // permitir criação de novo produto
} else {
  // mostrar mensagem: "Limite atingido. Faça upgrade para PRO."
}
```

O plano vem da conta (Account) que é atualizado automaticamente quando o Stripe processa uma assinatura via webhook.

---

## 🧮 Lógica de precificação

Cada produto possui um campo `price`, calculado dinamicamente com base em:

* Custos diretos dos insumos
* Impostos e taxas configuráveis
* Margem de lucro
* Custos adicionais (ex: mão de obra, embalagem)

O app calcula o preço de venda atual dos produtos no momento em que o produto é criado ou alterado.
Sempre que um insumo é alterado, o app recalcula o preço de todos os produtos que possuem este insumo.
Sempre que uma configuração global é alterada, o app recalcula o preço de todos os produtos.

---

## 📝 Convenções

### Idioma
- **Código (comentários, logs, docstrings)**: Inglês
- **Documentação markdown**: Português (pt-BR)

### Estrutura de Arquivos
- Cada domínio é auto-contido em `domains/[nome]/`
- Páginas Next.js em `app/` são uma camada fina que importa dos domínios
- Componentes compartilhados em `components/ui/`
- Infraestrutura compartilhada em `domains/core/`
