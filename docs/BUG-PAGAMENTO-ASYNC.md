# 🐛 Bug: Pagamento Aprovado Inicialmente mas Rejeitado Depois

## Problema Identificado

O sistema está criando vendas com status `completed` para pagamentos que o Mercado Pago **REJEITA** posteriormente. 

### Exemplo Real

**Venda #97:**
- Payment ID: `149630380209`
- Status no DB: `completed` ✅ (ERRADO!)
- Status no MP: `rejected` ❌ (CORRETO!)
- Motivo MP: "não passou pelos controles de segurança do Mercado Pago"
- Cliente: RUTHYELI GOMES COSTA SILVA
- Cartão: Nubank **** 1037
- Valor: R$ 11.00

## 📋 O Que Aconteceu

### Linha do Tempo

```
17:20:14 - Cliente faz pagamento no site
17:20:14 - Backend cria token no MP
17:20:14 - Backend cria pagamento no MP
17:20:14 - MP retorna HTTP 200 + status 'approved'
17:20:14 - Backend cria venda #97 com status 'completed'
17:20:14 - Backend envia email de confirmação
17:20:xx - MP detecta fraude/risco (análise assíncrona)
17:20:xx - MP muda status para 'rejected'
17:20:xx - MP DEVERIA enviar webhook mas NÃO enviou
RESULTADO - Venda fica como 'completed' mesmo estando 'rejected'!
```

## 🔍 Causa Raiz

### 1. Aprovação Assíncrona do Mercado Pago

O Mercado Pago tem **dois níveis de validação**:

**Validação Síncrona (imediata):**
- Valida dados do cartão
- Verifica limite disponível
- Retorna HTTP 200 + status 'approved'

**Validação Assíncrona (posterior):**
- Análise antifraude
- Validação de segurança
- Pode **REJEITAR** depois de aprovar

### 2. Webhook Não Configurado ou Não Funcionando

O webhook **deveria** receber notificação do MP quando o status muda de `approved` → `rejected`, mas:

- ✅ Webhook implementado corretamente no código
- ❌ Webhook NÃO está configurado no painel do Mercado Pago
- ❌ Tokens de API podem estar inválidos/expirados

## 🛠️ Soluções Implementadas

### 1. Melhoria na Busca do Webhook

**Antes:**
```typescript
WHERE (s.payment_id = ? OR s.customer_email = ?)
AND s.amount = ?
```

**Depois:**
```typescript
WHERE s.payment_id = ?
```

**Motivo:** Buscar apenas por `payment_id` é mais confiável e não falha por diferenças de precisão no valor.

### 2. Logs Detalhados

Adicionados logs para debug:
```typescript
console.log('[WEBHOOK MP] 📧 Email do pagador:', payerEmail)
console.log('[WEBHOOK MP] 💰 Valor da transação:', payment.transaction_amount)
console.log('[WEBHOOK MP] 🔍 Buscando venda por payment_id:', paymentId)
console.log('[WEBHOOK MP] 📋 Vendas encontradas:', sales?.length || 0)
```

## ⚠️ Ações Necessárias

### 1. Configurar Webhook no Mercado Pago

**URL do Webhook:**
```
https://vemgo.com.br/api/webhooks/mercadopago
```

**Como Configurar:**

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Webhooks** → **Notificações IPN**
3. Cole a URL acima
4. Selecione os eventos:
   - `payment.created`
   - `payment.updated`
   - `merchant_order`
5. Salve

### 2. Validar Tokens da API

Os tokens precisam estar válidos no Cloudflare:

```bash
# Verificar se tokens estão configurados
wrangler pages secret list --project-name=vemgo

# Se necessário, atualizar
wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name=vemgo
wrangler pages secret put MERCADOPAGO_TEST_ACCESS_TOKEN --project-name=vemgo
```

### 3. Testar Webhook Manualmente

```bash
curl -X POST https://vemgo.com.br/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.updated",
    "data": { "id": "149630380209" },
    "type": "payment"
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "received": true,
  "payment_id": "149630380209",
  "status": "rejected",
  "db_status": "failed",
  "processedAt": "2026-03-14T17:24:37.642Z"
}
```

## 🧪 Como Testar

### Cenário 1: Pagamento Rejeitado por Segurança

1. Use um cartão real válido
2. MP aprova inicialmente
3. MP rejeita por segurança (análise assíncrona)
4. Webhook atualiza status para `failed`
5. Cliente vê página de erro

### Cenário 2: Pagamento Rejeitado Imediatamente

1. Use cartão de teste inválido: `5474 9254 3267 0366`
2. MP rejeita imediatamente
3. Backend **NÃO** cria venda
4. Cliente vê mensagem de erro

## 📊 Status Atual

| Componente | Status | Observação |
|---|---|---|
| Backend | ✅ OK | Valida status corretamente |
| Webhook | ✅ OK | Implementado e testado |
| Webhook Config | ❌ FALTA | Precisa configurar no painel MP |
| Tokens MP | ⚠️ VERIFICAR | Podem estar inválidos |
| Página Sucesso | ✅ OK | Valida status da venda |

## 🎯 Próximos Passos

1. ✅ Webhook melhorado (commit dfecdbc)
2. ⏳ Configurar webhook no painel MP
3. ⏳ Validar tokens de API
4. ⏳ Testar com pagamentos reais
5. ⏳ Monitorar logs de produção

## 📚 Documentação Relacionada

- [Webhook Mercado Pago](./WEBHOOK-MERCADOPAGO-FUNCIONAMENTO.md)
- [Fix Status Pagamento](./FIX-STATUS-PAGAMENTO.md)
- [Database Fix](./DATABASE-FIX-SUMMARY.md)
- [Docs MP - Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Docs MP - Status](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/payment-status)

## 🚨 Conclusão

O sistema **ESTÁ FUNCIONANDO CORRETAMENTE** no backend. O problema é:

1. ✅ Mercado Pago aprova inicialmente → cria venda
2. ❌ Mercado Pago rejeita depois → **webhook não atualiza** (não configurado)
3. ❌ Venda fica como `completed` quando deveria ser `failed`

**Solução:** Configurar webhook no painel do Mercado Pago para receber notificações de mudança de status e atualizar o banco automaticamente.

---

**Commit:** dfecdbc - fix: melhorar busca de venda no webhook  
**Data:** 2026-03-14  
**Repositório:** https://github.com/kainow252-cmyk/vemgo
