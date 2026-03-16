# 🔑 Guia Rápido: Obter Credenciais do Mercado Pago

## 📍 Passo a Passo (5 minutos)

### 1️⃣ Acesse o Portal de Desenvolvedores

```
🌐 URL: https://www.mercadopago.com.br/developers
```

**O que fazer**:
- Clique em **"Entrar"** no canto superior direito
- Use sua conta Mercado Pago (ou crie uma gratuita)

---

### 2️⃣ Vá para "Suas Integrações"

```
📍 Caminho: Dashboard → Suas integrações → Criar aplicação
```

**O que fazer**:
- No menu lateral, clique em **"Suas integrações"**
- Clique no botão azul **"Criar aplicação"**

---

### 3️⃣ Crie Sua Aplicação

**Preencha os dados**:
- **Nome da aplicação**: `vemgo`
- **Descrição**: `Plataforma de vendas de cursos online`
- **Modelo de integração**: `Checkout API`
- **Categoria**: `Educação`

**Clique em**: **"Criar aplicação"**

---

### 4️⃣ Copie as Credenciais

Você verá duas abas:

#### 📘 Aba "Credenciais de teste" (SANDBOX)

```
🔑 Public Key (frontend):
TEST-12345678-abcd-1234-5678-123456789012

🔐 Access Token (backend):
TEST-1234567890123456-012345-abcdefghijklmnopqrstuvwxyz123456-123456789
```

**Use estas para desenvolvimento local**

#### 📗 Aba "Credenciais de produção" (REAL)

```
🔑 Public Key (frontend):
APP_USR-12345678-abcd-1234-5678-123456789012

🔐 Access Token (backend):
APP_USR-1234567890123456-012345-abcdefghijklmnopqrstuvwxyz123456-123456789
```

**Use estas para produção (site ao vivo)**

---

### 5️⃣ Configure no Projeto

#### Opção A: Local (.dev.vars)

```bash
cd /home/user/webapp

cat > .dev.vars << 'EOF'
# Mercado Pago - TESTE
MERCADOPAGO_PUBLIC_KEY=TEST-sua-public-key-aqui
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
EOF

# Adicione ao .gitignore
echo ".dev.vars" >> .gitignore
```

#### Opção B: Cloudflare Pages (Produção)

```bash
# Public Key
npx wrangler pages secret put MERCADOPAGO_PUBLIC_KEY --project-name vemgo
# Cole: APP_USR-12345678-abcd-1234-5678-123456789012

# Access Token
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name vemgo
# Cole: APP_USR-1234567890123456-012345-abcdefghijklmnopqrstuvwxyz123456-123456789
```

---

## ✅ Verificar Configuração

### Teste Local

```bash
# 1. Reiniciar servidor
pm2 restart vemgo

# 2. Verificar logs
pm2 logs vemgo --nostream | grep -i mercadopago

# 3. Testar checkout
curl http://localhost:3000/checkout/MKT2024-001
```

### Teste Produção

```bash
# 1. Verificar secrets
npx wrangler pages secret list --project-name vemgo

# 2. Deploy
npm run build
npx wrangler pages deploy dist --project-name vemgo

# 3. Testar
curl https://vemgo.pages.dev/checkout/MKT2024-001
```

---

## 🎯 Formato das Credenciais

### ✅ Correto

```
Public Key TEST:
TEST-12345678-abcd-1234-5678-123456789012
      ↑ Começa com TEST-

Access Token TEST:
TEST-1234567890123456-012345-abcd...
     ↑ Começa com TEST-

Public Key PRODUÇÃO:
APP_USR-12345678-abcd-1234-5678-123456789012
        ↑ Começa com APP_USR-

Access Token PRODUÇÃO:
APP_USR-1234567890123456-012345-abcd...
        ↑ Começa com APP_USR-
```

### ❌ Erros Comuns

```
❌ Usar credenciais de teste em produção
❌ Expor credenciais no código (use .env)
❌ Commitar .dev.vars no git
❌ Copiar credenciais incompletas
❌ Trocar Public Key com Access Token
```

---

## 🔐 Segurança

### ✅ O que FAZER

- ✅ Usar `.dev.vars` para desenvolvimento local
- ✅ Usar `wrangler secrets` para produção
- ✅ Adicionar `.dev.vars` no `.gitignore`
- ✅ Rotacionar credenciais periodicamente
- ✅ Usar credenciais TEST em desenvolvimento

### ❌ O que NÃO fazer

- ❌ Commitar credenciais no git
- ❌ Expor credenciais no frontend
- ❌ Compartilhar credenciais publicamente
- ❌ Usar mesmas credenciais em múltiplos projetos
- ❌ Deixar credenciais hardcoded no código

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  Mercado Pago Developers Portal                         │
│  https://www.mercadopago.com.br/developers              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Suas Integrações                                    │
│     ├─ vemgo (sua aplicação)                         │
│     │                                                   │
│     ├─ 📘 Credenciais de TESTE                          │
│     │   ├─ Public Key:  TEST-xxx...                    │
│     │   └─ Access Token: TEST-yyy...                   │
│     │                                                   │
│     └─ 📗 Credenciais de PRODUÇÃO                       │
│         ├─ Public Key:  APP_USR-xxx...                 │
│         └─ Access Token: APP_USR-yyy...                │
│                                                         │
└─────────────────────────────────────────────────────────┘
               ↓                   ↓
               ↓                   ↓
     ┌─────────────┐      ┌─────────────┐
     │ .dev.vars   │      │  Cloudflare │
     │  (local)    │      │   Secrets   │
     └─────────────┘      └─────────────┘
         TEST-xxx           APP_USR-xxx
```

---

## 🆘 Problemas Comuns

### "Credencial inválida"

```bash
# Verifique se copiou corretamente
npx wrangler pages secret list --project-name vemgo

# Deve mostrar:
# MERCADOPAGO_PUBLIC_KEY
# MERCADOPAGO_ACCESS_TOKEN

# Se não aparecer, configure novamente
```

### "Authorization required"

```bash
# Verifique formato do token
# Deve começar com TEST- ou APP_USR-

# Local (.dev.vars)
cat .dev.vars | grep MERCADOPAGO

# Produção (Cloudflare)
npx wrangler pages secret list --project-name vemgo
```

### "Invalid token"

```bash
# Token expirou ou está incorreto
# Vá ao portal e gere novas credenciais
# Copie e configure novamente
```

---

## 📞 Suporte

**Documentação Oficial**:
https://www.mercadopago.com.br/developers/pt/docs

**Suporte Mercado Pago**:
https://www.mercadopago.com.br/developers/pt/support

**Nossa Documentação**:
- `/home/user/webapp/MERCADOPAGO-SANDBOX.md`
- `/home/user/webapp/CREDENCIAIS-MERCADOPAGO.md` (este arquivo)

---

## ✅ Checklist Final

- [ ] Conta criada no Mercado Pago
- [ ] Aplicação `vemgo` criada no portal
- [ ] Credenciais de TESTE copiadas
- [ ] Credenciais de PRODUÇÃO copiadas
- [ ] `.dev.vars` criado localmente
- [ ] `.dev.vars` adicionado ao `.gitignore`
- [ ] Secrets configurados no Cloudflare
- [ ] Servidor reiniciado (`pm2 restart vemgo`)
- [ ] Checkout testado com sucesso

---

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: ⭐ Fácil  
**Última atualização**: 2026-03-13
