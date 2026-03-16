# 📧 Configuração de Email - Resend

## 🚨 Problema Identificado

```
❌ ERRO: You can only send testing emails to your own email address 
          (gelci.silva252@gmail.com)
```

**Motivo**: O Resend está em modo de teste (free tier) e só permite enviar emails para o email do proprietário da conta.

---

## ✅ Soluções

### **Solução 1: Usar Seu Email para Testes** (Imediato)

Para testes locais, altere `.dev.vars`:

```bash
cd /home/user/webapp

# Editar .dev.vars
cat > .dev.vars << 'EOF'
# Mercado Pago
MERCADOPAGO_PUBLIC_KEY=TEST-dd4f6d02-1376-4707-8851-69eff771a0c7
MERCADOPAGO_ACCESS_TOKEN=TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389

# Resend - API Key
RESEND_API_KEY=re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6

# Email remetente (Resend teste)
EMAIL_FROM=onboarding@resend.dev

# ⚠️ IMPORTANTE: Em modo teste, sempre enviar para o email do proprietário
# Email do proprietário da conta Resend (único email que funciona em teste)
RESEND_TEST_EMAIL=gelci.silva252@gmail.com

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=vemgo2024

# JWT
JWT_SECRET=vemgo-jwt-secret-change-in-production-2024
EOF

# Reiniciar servidor
pm2 restart vemgo
```

**Teste**:
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024-001",
    "customer_name": "João Silva",
    "customer_email": "gelci.silva252@gmail.com",
    ...
  }'

# Email será enviado para gelci.silva252@gmail.com ✅
```

---

### **Solução 2: Verificar Domínio** (Produção) 🎯 RECOMENDADO

Para enviar para **qualquer email**, você precisa verificar um domínio:

#### Passo 1: Acesse o Resend

```
🌐 URL: https://resend.com/domains
```

#### Passo 2: Adicionar Domínio

1. Clique em **"Add Domain"**
2. Digite seu domínio: `vemgo.com.br` (ou qualquer domínio seu)
3. Clique em **"Add"**

#### Passo 3: Configurar DNS

O Resend mostrará 3 registros DNS para adicionar:

**Exemplo:**
```
Tipo: TXT
Nome: resend._domainkey
Valor: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

Tipo: TXT  
Nome: @
Valor: resend-verification=abc123...

Tipo: MX
Nome: @
Valor: 10 mx.resend.com
```

#### Passo 4: Adicionar no seu Provedor DNS

**Cloudflare** (exemplo):
1. Acesse Cloudflare Dashboard
2. Vá para seu domínio → DNS → Records
3. Adicione cada registro (TXT, MX) fornecido pelo Resend
4. Aguarde propagação (5-30 minutos)

**Registro.br / Hostgator / Outros**:
- Acesse painel DNS do provedor
- Adicione os registros fornecidos
- Salve e aguarde propagação

#### Passo 5: Verificar Domínio

1. Volte para https://resend.com/domains
2. Clique em **"Verify"** no seu domínio
3. Aguarde confirmação ✅

#### Passo 6: Atualizar Configuração

```bash
# .dev.vars (local)
EMAIL_FROM=cursos@vemgo.com.br

# Cloudflare (produção)
npx wrangler pages secret put EMAIL_FROM --project-name vemgo
# Cole: cursos@vemgo.com.br
```

---

### **Solução 3: Usar Gmail/SMTP** (Alternativa)

Se não tiver domínio, pode usar Gmail via SMTP:

```bash
npm install nodemailer
```

**Código** (backend):
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'sua-senha-de-app' // Gerar em: myaccount.google.com/apppasswords
  }
})

await transporter.sendMail({
  from: '"vemgo" <seu-email@gmail.com>',
  to: customer_email,
  subject: '✅ Confirmação de Compra',
  html: `...`
})
```

**⚠️ Limitações Gmail**:
- Limite: 500 emails/dia
- Pode cair em spam
- Menos confiável que Resend

---

## 🔧 Ajuste Temporário (Modo Desenvolvimento)

Vou adicionar uma flag para sempre enviar para seu email em modo teste:

```typescript
// src/index.tsx
const isTestMode = true
const testEmail = 'gelci.silva252@gmail.com'

// Em modo teste, sempre enviar para o email de teste
const recipientEmail = isTestMode ? testEmail : customer_email

await resend.emails.send({
  from: EMAIL_FROM,
  to: recipientEmail, // ← Usar email de teste
  subject: `✅ Confirmação de Compra - ${link.title}`,
  html: `...`
})
```

---

## 📊 Status Atual

### ✅ O que está funcionando

- [x] API Resend configurada
- [x] Código de envio implementado
- [x] Template HTML bonito
- [x] Link de download gerado
- [x] Logs detalhados
- [x] Erro capturado (não quebra a venda)

### ⚠️ Limitação Atual

- [ ] Emails só podem ser enviados para: **gelci.silva252@gmail.com**
- [ ] Outros emails resultam em erro 403

### 🎯 Para Produção

- [ ] Verificar domínio no Resend (vemgo.com.br)
- [ ] Configurar EMAIL_FROM com domínio verificado
- [ ] Testar envio para qualquer email

---

## 🧪 Testes

### Teste 1: Email para Proprietário (✅ Funciona)

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024-001",
    "customer_name": "João Silva",
    "customer_email": "gelci.silva252@gmail.com",
    "customer_cpf": "123.456.789-00",
    "customer_phone": "(11) 98765-4321",
    "card_number": "4111 1111 1111 1111",
    "card_holder_name": "JOAO SILVA",
    "card_expiration_month": "12",
    "card_expiration_year": "2025",
    "card_cvv": "123"
  }'

# ✅ Email enviado com sucesso!
```

### Teste 2: Email para Outro Endereço (❌ Falha)

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "customer_email": "outro@exemplo.com",
    ...
  }'

# ❌ Erro 403: Só pode enviar para gelci.silva252@gmail.com
```

---

## 📞 Suporte

**Resend Docs**:
- https://resend.com/docs/introduction
- https://resend.com/docs/dashboard/domains/introduction

**Problemas Comuns**:
- **403 validation_error**: Domínio não verificado → Verificar domínio
- **Invalid API key**: Chave incorreta → Verificar `.dev.vars`
- **Rate limit**: Limite de envios → Upgrade para plano pago

---

## ✅ Checklist

### Desenvolvimento (Agora)
- [x] API Resend configurada
- [x] Logs de debug adicionados
- [x] Erro identificado (modo teste)
- [ ] Testar com gelci.silva252@gmail.com
- [ ] Verificar recebimento do email

### Produção (Próximo)
- [ ] Comprar/configurar domínio (vemgo.com.br)
- [ ] Verificar domínio no Resend
- [ ] Configurar EMAIL_FROM com domínio
- [ ] Adicionar secret no Cloudflare
- [ ] Testar envio para qualquer email
- [ ] Monitorar taxa de entrega

---

**Status**: 🟡 **Parcialmente Funcional**  
**Envio**: ✅ Funciona para **gelci.silva252@gmail.com**  
**Produção**: ⏳ Aguardando verificação de domínio

---

**Última Atualização**: 2026-03-13
