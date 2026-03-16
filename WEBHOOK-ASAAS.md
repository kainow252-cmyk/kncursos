# 🔔 Webhook Asaas - Configuração e Segurança

## ✅ Webhook Configurado com Sucesso!

### **📋 Dados do Webhook:**

- **Nome:** vemgo - Pagamentos Produção
- **URL:** https://vemgo.pages.dev/api/webhooks/asaas
- **Status:** ✅ Ativo
- **Versão API:** v3
- **Fila de sincronização:** ✅ Ativa
- **Email notificações:** gelci.silva252@gmail.com

### **🔐 Token de Autenticação:**
```
whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
```

---

## 🎯 Eventos Configurados

O webhook está escutando os seguintes eventos:

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| ✅ **PAYMENT_RECEIVED** | Pagamento recebido | Atualiza status → `completed` |
| ✅ **PAYMENT_CONFIRMED** | Pagamento confirmado | Atualiza status → `completed` |
| ⚠️ **PAYMENT_OVERDUE** | Pagamento vencido | Atualiza status → `overdue` |
| ❌ **PAYMENT_REFUNDED** | Pagamento reembolsado | Atualiza status → `refunded` |
| ❌ **PAYMENT_DELETED** | Pagamento deletado | Atualiza status → `refunded` |
| 🚫 **PAYMENT_REPROVED_BY_RISK_ANALYSIS** | Reprovado por fraude | Atualiza status → `failed` |

---

## 🔒 Validação de Segurança

### **Backend (Implementado):**

O webhook valida o token em cada requisição:

```typescript
// src/index.tsx - linha ~379
const authHeader = c.req.header('asaas-access-token')

if (ASAAS_WEBHOOK_TOKEN && authHeader !== ASAAS_WEBHOOK_TOKEN) {
  console.error('[WEBHOOK ASAAS] ❌ Token inválido')
  return c.json({ error: 'Unauthorized' }, 401)
}
```

### **Variáveis de Ambiente:**

**.dev.vars (Local):**
```bash
ASAAS_WEBHOOK_TOKEN=whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
```

**Cloudflare Pages (Produção):**
1. https://dash.cloudflare.com/
2. Workers & Pages → **vemgo** → Settings
3. Environment Variables → **Add**
   - **Name:** `ASAAS_WEBHOOK_TOKEN`
   - **Value:** `whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM`
   - **Type:** Secret
   - **Environment:** Production
4. Save

---

## 🧪 Testar Webhook

### **1. Teste Manual (cURL):**

```bash
curl -X POST https://vemgo.pages.dev/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_123456789",
      "status": "CONFIRMED",
      "value": 197.00
    }
  }'
```

**Resposta esperada:**
```json
{
  "received": true,
  "event": "PAYMENT_CONFIRMED"
}
```

### **2. Teste com Token Inválido:**

```bash
curl -X POST https://vemgo.pages.dev/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: token_invalido" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_123456789"
    }
  }'
```

**Resposta esperada:**
```json
{
  "error": "Unauthorized"
}
```
*HTTP Status: 401*

### **3. Teste Real (Asaas Dashboard):**

1. Login no Asaas: https://sandbox.asaas.com/ (ou produção)
2. Menu: **Integrações → Webhooks**
3. Clique no webhook: **"vemgo - Pagamentos Produção"**
4. Botão: **"Enviar teste"**
5. Verifique os logs

---

## 📊 Monitoramento de Webhooks

### **Logs em Tempo Real:**

**Cloudflare Pages:**
```bash
npx wrangler pages deployment tail --project-name vemgo | grep "WEBHOOK ASAAS"
```

**PM2 (Local):**
```bash
pm2 logs vemgo --nostream | grep "WEBHOOK ASAAS"
```

### **Logs Esperados:**

```
[WEBHOOK ASAAS] Evento recebido: PAYMENT_CONFIRMED
[WEBHOOK ASAAS] Payment ID: pay_tso2qng08k8x7edr
[WEBHOOK ASAAS] Status: CONFIRMED
[WEBHOOK ASAAS] ✅ Pagamento confirmado: pay_tso2qng08k8x7edr
[WEBHOOK ASAAS] ✅ Status atualizado no banco
```

---

## 🔧 Troubleshooting

### **Erro: "Unauthorized" (401)**

**Causa:** Token inválido ou ausente

**Solução:**
1. Verificar se `ASAAS_WEBHOOK_TOKEN` está configurado no Cloudflare
2. Confirmar que o token é o mesmo configurado no Asaas
3. Verificar header `asaas-access-token` na requisição

### **Erro: "Webhook processing failed" (500)**

**Causa:** Erro interno ao processar o evento

**Solução:**
1. Verificar logs: `pm2 logs vemgo` ou `wrangler pages deployment tail`
2. Confirmar que o banco D1 está acessível
3. Verificar se a coluna `asaas_payment_id` existe na tabela `sales`

### **Webhook não recebe eventos:**

**Causa:** URL incorreta ou webhook inativo

**Solução:**
1. Verificar URL no dashboard Asaas
2. Confirmar que webhook está **Ativo**
3. Testar manualmente com cURL
4. Verificar se o domínio está acessível publicamente

---

## 📈 Fluxo de Pagamento Completo

```
1. Cliente preenche checkout
   ↓
2. POST /api/sales
   ↓
3. Asaas processa pagamento
   ↓
4. Status inicial: "completed" (se aprovado)
   ↓
5. Asaas envia webhook
   ↓
6. POST /api/webhooks/asaas (com token)
   ↓
7. Backend valida token
   ↓
8. Backend atualiza status no D1
   ↓
9. Email enviado via Resend
   ↓
10. Cliente recebe link de download
```

---

## 🎯 Checklist de Segurança

| Item | Status |
|------|--------|
| ✅ Token único gerado | ✅ |
| ✅ Token configurado no backend | ✅ |
| ✅ Validação de token implementada | ✅ |
| ✅ Webhook usando HTTPS | ✅ |
| ✅ Fila de sincronização ativa | ✅ |
| ✅ Email de notificação configurado | ✅ |
| ⏳ Token adicionado no Cloudflare | ⏳ **FAZER** |
| ⏳ Teste real de webhook | ⏳ **FAZER** |

---

## 📝 Próximos Passos

1. ✅ **Token adicionado no .dev.vars** (local)
2. ⏳ **Adicionar token no Cloudflare Pages** (produção)
3. ⏳ **Deploy para produção**
4. ⏳ **Testar webhook com pagamento real**
5. ⏳ **Monitorar logs por 24h**

---

## 🔗 Links Úteis

- **Webhook URL:** https://vemgo.pages.dev/api/webhooks/asaas
- **Dashboard Asaas:** https://sandbox.asaas.com/webhooks
- **Logs Cloudflare:** https://dash.cloudflare.com/
- **Documentação Asaas:** https://docs.asaas.com/docs/webhooks

---

**Última atualização:** 2026-03-13  
**Status:** ✅ Configurado e protegido com token  
**Ambiente:** Sandbox (trocar para produção após testes)
