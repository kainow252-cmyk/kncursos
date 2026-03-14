# 🌐 Configuração do Domínio kncursos.com.br

## ✅ Deploy Realizado com Sucesso!

**URL temporária do Cloudflare Pages:**  
https://ff1dae4f.kncursos.pages.dev

**URL de produção (após configurar DNS):**  
https://kncursos.com.br

---

## 📋 Como Configurar o Domínio

### Passo 1: Acessar o Painel da Cloudflare

1. Acesse: https://dash.cloudflare.com/
2. Faça login com sua conta
3. Clique em **"Workers & Pages"** no menu lateral

### Passo 2: Configurar Domínio Personalizado

1. Encontre o projeto **"kncursos"** na lista
2. Clique no projeto
3. Vá na aba **"Custom domains"**
4. Clique em **"Set up a custom domain"**
5. Digite: `kncursos.com.br`
6. Clique em **"Continue"**

### Passo 3: Configurar DNS

A Cloudflare automaticamente configurará os registros DNS porque o domínio já está na Cloudflare (Zona ID: `db02931f7b8663149a198d7f28023052`).

**Registros que serão criados:**
```
kncursos.com.br     CNAME  kncursos.pages.dev
www.kncursos.com.br CNAME  kncursos.pages.dev
```

### Passo 4: Aguardar Propagação

- ⏱️ Tempo de propagação: **5-15 minutos**
- ✅ SSL automático será ativado
- ✅ HTTPS será forçado automaticamente

---

## 🔧 Configurações Necessárias no Cloudflare Pages

### 1. Adicionar Variáveis de Ambiente (Secrets)

Acesse o projeto **kncursos** → aba **"Settings"** → **"Environment variables"**

#### Para Produção:

**Mercado Pago:**
```
MERCADOPAGO_PUBLIC_KEY = TEST-dd4f6d02-1376-4707-8851-69eff771a0c7
MERCADOPAGO_ACCESS_TOKEN = TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389
```

**Resend:**
```
RESEND_API_KEY = re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
EMAIL_FROM = onboarding@resend.dev
```

### 2. Criar Banco D1 de Produção

⚠️ **Importante**: O token API atual não tem permissão para criar banco D1. Faça isso manualmente:

1. Acesse: https://dash.cloudflare.com/
2. Vá em **"Workers & Pages"** → **"D1"**
3. Clique em **"Create database"**
4. Nome: `kncursos-production`
5. Clique em **"Create"**
6. Copie o **Database ID** gerado

### 3. Vincular D1 ao Projeto

1. Acesse o projeto **kncursos** → aba **"Settings"** → **"Bindings"**
2. Role até **"D1 database bindings"**
3. Clique em **"Add binding"**:
   - Variable name: `DB`
   - D1 database: `kncursos-production`
4. Clique em **"Save"**

### 4. Aplicar Migrations no D1 de Produção

Depois de criar o banco, rode localmente:

```bash
# Atualizar wrangler.jsonc com o database_id real
# Depois aplicar migrations
npx wrangler d1 migrations apply kncursos-production --remote
```

---

## 🧪 Testar o Deploy

### URLs Disponíveis:

**Temporária (funciona agora):**
- https://ff1dae4f.kncursos.pages.dev
- https://kncursos.pages.dev

**Produção (após configurar domínio):**
- https://kncursos.com.br
- https://www.kncursos.com.br

### Páginas para Testar:

```
https://kncursos.com.br/                      → Home (vitrine de cursos)
https://kncursos.com.br/admin                 → Painel Admin
https://kncursos.com.br/checkout/TIKTOK2024   → Checkout do curso TikTok
```

---

## ⚠️ Limitações Atuais

### Sem D1 no Deploy Atual:

Como o banco D1 não foi vinculado ainda, as seguintes funcionalidades **não funcionarão** até você configurar o D1:

- ❌ Listar cursos na home
- ❌ Processar pagamentos
- ❌ Registrar vendas
- ❌ Dashboard admin

### Solução:

1. Crie o banco D1 manualmente (passo acima)
2. Vincule ao projeto
3. Aplique as migrations
4. Faça um novo deploy

---

## 🚀 Comandos para Novo Deploy

Depois de configurar o D1:

```bash
# 1. Atualizar wrangler.jsonc com database_id real
# 2. Aplicar migrations
npm run db:migrate:prod

# 3. Fazer novo deploy
npm run build
npx wrangler pages deploy dist --project-name kncursos --commit-dirty=true
```

---

## 📧 Email do Resend

### Para Produção:

**Opção 1: Usar domínio verificado (RECOMENDADO)**

1. Acesse: https://resend.com/domains
2. Adicione `kncursos.com.br`
3. Configure os registros DNS:
   ```
   Tipo: MX
   Nome: @
   Valor: feedback-smtp.us-east-1.amazonses.com
   Prioridade: 10
   
   Tipo: TXT
   Nome: @
   Valor: v=spf1 include:amazonses.com ~all
   
   Tipo: CNAME
   Nome: _amazonses
   Valor: [valor fornecido pelo Resend]
   ```
4. Aguarde verificação (1-24 horas)
5. Atualize `EMAIL_FROM=contato@kncursos.com.br`

**Opção 2: Usar domínio padrão**
- Mantém `EMAIL_FROM=onboarding@resend.dev`
- Funciona imediatamente, mas email parece menos profissional

---

## 📊 Status Atual

✅ **Projeto criado**: kncursos  
✅ **Deploy realizado**: https://ff1dae4f.kncursos.pages.dev  
✅ **Código enviado**: workers bundle uploaded  
⏳ **Domínio custom**: aguardando configuração manual  
⏳ **Banco D1**: aguardando criação manual  
⏳ **Variáveis de ambiente**: aguardando configuração  

---

## 🎯 Próximos Passos

1. ✅ **Acesse o painel e configure o domínio custom**
2. ✅ **Crie o banco D1 manualmente**
3. ✅ **Adicione as variáveis de ambiente (secrets)**
4. ✅ **Vincule o D1 ao projeto**
5. ✅ **Aplique as migrations**
6. ✅ **Faça novo deploy**
7. ✅ **Teste tudo em kncursos.com.br**

---

**Precisa de ajuda? Me avise quando configurar o D1 para eu ajudar com as migrations!** 🚀
