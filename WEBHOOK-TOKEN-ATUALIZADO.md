# 🔐 Token do Webhook Asaas Atualizado

## ✅ Atualização Realizada

**Data:** 14/03/2026 14:15 UTC

### Novo Token de Webhook:
```
whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4
```

### Token Anterior (OBSOLETO):
```
whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms
```

---

## 📋 Configuração Necessária no Painel Asaas

### Dados para Configurar:

```
URL do Webhook:
https://vemgo.com.br/api/webhooks/asaas

Token de Autenticação:
whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4

Nome:
Vemgo - Notificações de Pagamento

Status:
✅ Ativo
```

---

## 🔧 Como Configurar:

1. Acesse: https://www.asaas.com
2. Menu: **Integrações → Webhooks**
3. Encontre ou crie: **"Vemgo - Notificações"**
4. Atualize os campos:
   - **URL:** `https://vemgo.com.br/api/webhooks/asaas`
   - **Token:** `whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4`
   - **Status:** Ativo
   - **Eventos:** Marcar TODOS
5. Salve
6. Clique em **"Enviar Teste"**
7. ✅ Deve retornar sucesso

---

## ✅ Status da Atualização:

- [x] Token gerado no Asaas
- [x] Token atualizado no Cloudflare Pages (produção)
- [x] Token atualizado no `.dev.vars` (desenvolvimento)
- [x] Deploy realizado
- [x] Webhook testado e funcionando
- [ ] **Configurar no painel Asaas** ← PENDENTE

---

## 🧪 Teste Realizado:

```bash
# Teste com novo token:
curl -X POST https://vemgo.com.br/api/webhooks/asaas \
  -H "asaas-access-token: whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4" \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CONFIRMED","payment":{"id":"test"}}'

# Resultado:
{"received":true,"event":"PAYMENT_CONFIRMED"} ✅
```

```bash
# Teste com token antigo:
curl -X POST https://vemgo.com.br/api/webhooks/asaas \
  -H "asaas-access-token: whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms" \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CONFIRMED","payment":{"id":"test"}}'

# Resultado:
{"error":"Unauthorized"} ✅ (Corretamente rejeitado)
```

---

## 🌐 URLs do Sistema:

### URL Permanente (USE ESTA):
```
https://vemgo.com.br
```

### URL Atual do Deploy:
```
https://25dd44c1.vemgo.pages.dev
```

### Endpoints Importantes:
- **Webhook Asaas:** `https://vemgo.com.br/api/webhooks/asaas`
- **Webhook SuitPay:** `https://vemgo.com.br/api/webhooks/suitpay`
- **Webhook Resend:** `https://vemgo.com.br/api/webhooks/resend`
- **Admin:** `https://vemgo.com.br/admin`
- **API:** `https://vemgo.com.br/api/*`

---

## ⚠️ Importante:

### URL Permanente
A URL `https://vemgo.com.br` **NUNCA muda**, mesmo após deploys.

### URLs Temporárias
URLs como `https://25dd44c1.vemgo.pages.dev` mudam a cada deploy.

### Configuração de Webhook
**SEMPRE use `https://vemgo.com.br/api/webhooks/asaas`** no painel Asaas para evitar ter que reconfigurar após cada deploy.

---

## 📊 Eventos Webhook Suportados:

O webhook processa os seguintes eventos do Asaas:

### Confirmação de Pagamento:
- `PAYMENT_CONFIRMED` → Status: completed
- `PAYMENT_RECEIVED` → Status: completed

### Análise de Risco:
- `PAYMENT_AWAITING_RISK_ANALYSIS` → Status: pending
- `PAYMENT_APPROVED_BY_RISK_ANALYSIS` → Status: pending
- `PAYMENT_REPROVED_BY_RISK_ANALYSIS` → Status: failed

### Outros Status:
- `PAYMENT_OVERDUE` → Status: overdue
- `PAYMENT_REFUNDED` → Status: refunded
- `PAYMENT_DELETED` → Status: refunded
- `PAYMENT_UPDATED` → Log apenas

---

## 🔒 Segurança:

### Token de Webhook:
- Validado em cada requisição
- Header: `asaas-access-token`
- Requisições sem token ou com token inválido são rejeitadas com 401

### Variáveis de Ambiente:
- Produção: Cloudflare Pages Secrets
- Desenvolvimento: Arquivo `.dev.vars` (não commitado no Git)

---

## 📞 Suporte:

### Documentos Relacionados:
- `CONFIGURAR-WEBHOOK-ASAAS-PASSO-A-PASSO.md`
- `CONTA-ASAAS-INATIVA.md`
- `ERRO-ASAAS-404-SOLUCAO.md`

### Contatos:
- **Asaas:** suporte@asaas.com | (47) 3433-2909
- **GitHub:** https://github.com/kainow252-cmyk/vemgo

---

**Documento criado em:** 14/03/2026 14:15 UTC  
**Deploy atual:** https://25dd44c1.vemgo.pages.dev  
**Status:** ✅ Token atualizado no sistema, aguardando configuração no painel Asaas
