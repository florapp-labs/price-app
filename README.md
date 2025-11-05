# 🧮 Precificação Inteligente — MicroSaaS

Este é um **micro-SaaS** voltado a **lojistas e floriculturas** que constroem **produtos compostos** (kits, boxes, cestas, arranjos). O sistema calcula automaticamente o preço de venda com base em insumos, impostos, margem de lucro e custos configuráveis.

## 🌱 Funcionalidades

- **Cálculo automático de preço de venda**  
  Preço derivado da composição de insumos + custos variáveis + impostos + margem

- **Detecção de necessidade de reajuste**  
  Produtos que usam insumos atualizados são destacados na listagem

- **Controle de funcionalidades e quotas por plano**  
  Funcionalidades e limites são controlados de acordo com o plano de assinatura (Free/Pro)

- **Versão gratuita + upgrade via Stripe**  
  Plano Free com funcionalidades limitadas, upgrade para Pro via Stripe Checkout

- **Dashboard de acompanhamento**  
  Lista de produtos, produtos com necessidade de reajuste, e ações de recálculo

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) 15 (App Router)
- **Banco de Dados**: [Firestore (Firebase)](https://firebase.google.com/docs/firestore)
- **Autenticação**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Pagamentos**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Deploy**: [Vercel](https://vercel.com/)

## 📁 Estrutura do Projeto

A aplicação está organizada em **domínios auto-contidos**:

```
domains/
  core/          # Infraestrutura compartilhada (auth, database, feature-flags, payments)
  users/         # Domínio de usuários
  materials/     # Domínio de materiais/insumos
  products/      # Domínio de produtos
  settings/      # Domínio de configurações

app/             # Next.js App Router (rotas e páginas)
components/      # Componentes React compartilhados
lib/             # Utilitários compartilhados
```

Cada domínio contém sua própria lógica de negócio, acesso a dados, tipos e componentes.

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+ instalado
- Conta Firebase criada
- Conta Stripe (para testar pagamentos)

### Passo 1: Clonar o repositório

```bash
git clone <repository-url>
cd price-app
pnpm install
```

### Passo 2: Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **Project Settings > General**
4. Na seção "Your apps", crie uma nova aplicação Web se ainda não tiver
5. Copie as credenciais (API Key, Auth Domain, Project ID)
6. Vá em **Project Settings > Service Accounts**
7. Clique em "Generate new private key" e baixe o arquivo JSON

### Passo 3: Configurar Stripe

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/)
2. Copie sua **Secret Key** (modo teste)
3. Instale o Stripe CLI (se ainda não tiver):
   ```bash
   # Windows (PowerShell)
   winget install stripe.stripe-cli
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Veja instruções em: https://docs.stripe.com/stripe-cli
   ```
4. Autentique o CLI:
   ```bash
   stripe login
   ```

### Passo 4: Executar Setup

Execute o script de setup que irá criar o arquivo `.env` com todas as variáveis necessárias:

```bash
pnpm setup
# ou
npx tsx lib/setup.ts
```

O script irá solicitar:
- **Firebase API Key**: `FIREBASE_API_KEY`
- **Firebase Auth Domain**: `FIREBASE_AUTH_DOMAIN`
- **Firebase Project ID**: `FIREBASE_PROJECT_ID`
- **Firebase Admin Project ID**: Mesmo que Project ID
- **Firebase Admin Client Email**: Do arquivo JSON baixado (campo `client_email`)
- **Firebase Admin Private Key**: Do arquivo JSON baixado (campo `private_key`)
- **Stripe Secret Key**: Sua chave secreta do Stripe
- **Stripe Webhook Secret**: Será gerado automaticamente pelo Stripe CLI

### Passo 5: Configurar Firebase Auth

1. No Firebase Console, vá em **Authentication > Sign-in method**
2. Habilite **Email/Password** como método de autenticação
3. (Opcional) Habilite **Google** se quiser suportar login social

### Passo 6: Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Passo 7: Escutar webhooks do Stripe (opcional)

Em outro terminal, execute:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Isso permite que webhooks do Stripe sejam recebidos localmente para testar mudanças de assinatura.

## 🧪 Testando Pagamentos

Para testar pagamentos com Stripe, use os seguintes dados de cartão de teste:

- **Número do cartão**: `4242 4242 4242 4242`
- **Data de expiração**: Qualquer data futura (ex: `12/25`)
- **CVC**: Qualquer número de 3 dígitos (ex: `123`)
- **CEP**: Qualquer CEP válido (ex: `12345`)

## 📦 Deploy em Produção

### Configurar Variáveis de Ambiente na Vercel

1. Vá para as configurações do seu projeto na Vercel
2. Adicione todas as variáveis de ambiente:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `BASE_URL` (sua URL de produção)

### Configurar Webhook do Stripe para Produção

1. Acesse o Stripe Dashboard
2. Vá em **Developers > Webhooks**
3. Clique em "Add endpoint"
4. Configure a URL: `https://seu-dominio.com/api/stripe/webhook`
5. Selecione os eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copie o **Signing secret** e adicione como `STRIPE_WEBHOOK_SECRET` na Vercel

### Configurar Regras de Segurança do Firestore

No Firebase Console, configure as regras de segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: usuários só podem ler/editar seus próprios documentos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Adicione regras para outros domínios conforme necessário
    match /materials/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /products/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /settings/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧩 Domínios

A aplicação está organizada em domínios auto-contidos:

- **core**: Infraestrutura compartilhada (auth, database, feature-flags, payments)
- **users**: Gerenciamento de usuários (single-user, sem teams)
- **materials**: Gerenciamento de materiais/insumos
- **products**: Gerenciamento de produtos compostos com cálculo automático de preço
- **settings**: Configurações globais (impostos, margem de lucro, custos)

Cada domínio centraliza toda sua lógica, acesso a dados e componentes relacionados.

## 📝 Convenções

- **Código**: Comentários, logs e docstrings em inglês
- **Documentação**: Arquivos markdown em português (pt-BR)

## 🔗 Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação Stripe](https://stripe.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
