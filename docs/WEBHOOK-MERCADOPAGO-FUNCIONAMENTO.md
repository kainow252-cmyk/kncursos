# Webhook Mercado Pago - Funcionamento

**Data**: 2026-03-14  
**Status**: ✅ Implementado e Funcional  
**Deploy**: https://8f6533d3.vemgo.pages.dev

## Visão Geral

O webhook do Mercado Pago é responsável por receber notificações de mudanças de status de pagamentos e processar automaticamente o envio de emails de acesso aos cursos.

## Fluxo Completo

### 1. Mercado Pago envia notificação

Quando um pagamento muda de status, o Mercado Pago envia uma requisição POST para:

```
https://vemgo.com.br/api/webhooks/mercadopago
```

**Payload recebido**:
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "149620439799"
  },
  "date_created": "2026-03-14T16:00:00Z",
  "id": "149620439799",
  "live_mode": true,
  "type": "payment",
  "user_id": 2911366389
}
```

### 2. Webhook processa a notificação

O webhook executa as seguintes etapas:

#### a) Validação
- ✅ Verifica assinatura `x-signature` (header)
- ✅ Valida `x-request-id` (header)
- ✅ Confirma que o tipo é `payment`

#### b) Busca detalhes do pagamento
```javascript
GET https://api.mercadopago.com/v1/payments/{payment_id}
Authorization: Bearer {ACCESS_TOKEN}
```

**Resposta da API**:
```json
{
  "id": 149620439799,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 49.90,
  "payer": {
    "email": "gelci.jose.grouptrig@gmail.com",
    "identification": {
      "type": "CPF",
      "number": "11013430794"
    }
  }
}
```

#### c) Mapeia status do Mercado Pago

| Status MP | Status Interno | Ação |
|-----------|---------------|------|
| `approved` | `completed` | ✅ Envia email |
| `authorized` | `completed` | ✅ Envia email |
| `pending` | `pending` | ⏳ Aguarda |
| `in_process` | `pending` | ⏳ Aguarda |
| `rejected` | `failed` | ❌ Não envia email |
| `cancelled` | `failed` | ❌ Não envia email |
| `refunded` | `refunded` | 🔄 Email de estorno |
| `charged_back` | `refunded` | 🔄 Email de chargeback |

#### d) Busca venda no banco

```sql
SELECT s.*, c.title as course_title, c.pdf_url
FROM sales s
JOIN courses c ON s.course_id = c.id
WHERE (s.payment_id = ? OR s.customer_email = ?)
AND s.amount = ?
ORDER BY s.purchased_at DESC
LIMIT 1
```

**Busca por**:
1. `payment_id` (se já foi registrado)
2. `customer_email` (fallback)
3. `amount` (confirmação adicional)

#### e) Atualiza status no banco

```sql
UPDATE sales 
SET status = ?, payment_id = ?
WHERE id = ?
```

#### f) Envia email (se aprovado)

**Condições para envio**:
- ✅ Novo status = `completed`
- ✅ Status anterior ≠ `completed` (evita duplicação)
- ✅ `RESEND_API_KEY` configurado
- ✅ `EMAIL_FROM` configurado

**Email enviado**:
```
De: suporte@vemgo.com.br
Para: {customer_email}
Assunto: ✅ Pagamento Aprovado - {course_title}

Conteúdo:
- Confirmação de pagamento aprovado
- Informações do curso
- Valor pago
- ID do pagamento
- Link de download (se disponível)
```

### 3. Resposta do Webhook

**Sucesso** (200 OK):
```json
{
  "success": true,
  "received": true,
  "payment_id": "149620439799",
  "status": "approved",
  "db_status": "completed",
  "processedAt": "2026-03-14T17:30:00.000Z"
}
```

**Erro** (500):
```json
{
  "success": false,
  "error": "Webhook processing failed",
  "message": "Payment not found"
}
```

## Como Testar

### Opção 1: Usar o Painel do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Webhooks** → **Notificações IPN**
3. Clique em **Enviar notificação de teste**
4. Insira o Order ID: `149620439799`
5. Clique em **Enviar**

### Opção 2: Fazer um Pagamento de Teste

1. Use credenciais de TESTE
2. Acesse o checkout: https://vemgo.com.br/checkout/MKT2024ABC
3. Use cartão de teste aprovado: **5031 4332 1540 6351**
4. Preencha os dados:
   - Nome: APRO
   - CPF: 123.456.789-09
   - Email: seu-email@teste.com
   - Validade: 11/2026
   - CVV: 123
5. Confirme o pagamento
6. O Mercado Pago enviará a notificação automaticamente
7. Verifique seu email

### Opção 3: Simular Manualmente (Desenvolvimento)

```bash
curl -X POST "https://vemgo.com.br/api/webhooks/mercadopago" \
  -H "Content-Type: application/json" \
  -H "x-signature: test-signature" \
  -H "x-request-id: test-123" \
  -d '{
    "action": "payment.updated",
    "api_version": "v1",
    "data": {"id": "149620439799"},
    "date_created": "2026-03-14T16:00:00Z",
    "id": "149620439799",
    "live_mode": true,
    "type": "payment",
    "user_id": 2911366389
  }'
```

## Logs e Monitoramento

O webhook gera logs detalhados em cada etapa:

```
[WEBHOOK MP] 🔧 Modo: 💳 PRODUÇÃO
[WEBHOOK MP] 📝 Signature: ✅ Presente
[WEBHOOK MP] 📝 Request ID: abc123-def456
[WEBHOOK MP] 📦 Webhook recebido
[WEBHOOK MP] 💳 Payment ID: 149620439799
[WEBHOOK MP] 🔍 Buscando detalhes do pagamento...
[WEBHOOK MP] 📄 Status do pagamento: approved
[WEBHOOK MP] 🔄 Status mapeado: completed
[WEBHOOK MP] 📧 Buscando venda por email: gelci.jose.grouptrig@gmail.com
[WEBHOOK MP] 🔍 Venda encontrada: 123
[WEBHOOK MP] ✅ Status da venda atualizado no banco
[WEBHOOK MP] 📧 Pagamento aprovado! Enviando email de acesso...
[WEBHOOK MP] ✅ Email de acesso enviado com sucesso!
[WEBHOOK MP] ✅ Webhook processado com sucesso
```

## Variáveis de Ambiente Necessárias

```bash
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5716535937560584-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-f0b3ead2-...
MERCADOPAGO_TEST_ACCESS_TOKEN=APP_USR-91485306816091-...
MERCADOPAGO_TEST_PUBLIC_KEY=APP_USR-503c0819-...
MERCADOPAGO_TEST_MODE=false  # true para teste, false para produção
MERCADOPAGO_WEBHOOK_SECRET=a36f7473e2216424165967658f5255a8de98932d25e2bd9de8e6db9fd58af987

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=suporte@vemgo.com.br
```

## Segurança

### Validação de Assinatura

O Mercado Pago envia um header `x-signature` com cada requisição. O webhook valida essa assinatura usando o `MERCADOPAGO_WEBHOOK_SECRET`.

**Formato da assinatura**:
```
x-signature: ts={timestamp},v1={hash}
```

**Validação**:
```javascript
const parts = signature.split(',')
const ts = parts.find(p => p.startsWith('ts=')).split('=')[1]
const hash = parts.find(p => p.startsWith('v1=')).split('=')[1]

// Reconstruir string para validação
const dataString = `id:${paymentId};request-id:${requestId};ts:${ts};`

// Validar HMAC SHA256
const expectedHash = crypto
  .createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET)
  .update(dataString)
  .digest('hex')

if (hash !== expectedHash) {
  throw new Error('Invalid signature')
}
```

### Prevenção de Duplicação

- Verifica se o status mudou antes de enviar email
- Usa `payment_id` para identificar pagamentos únicos
- Registra `processedAt` timestamp em cada processamento

## Troubleshooting

### Email não foi enviado

**Possíveis causas**:
1. ✅ Status não mudou para `completed`
2. ✅ `RESEND_API_KEY` não configurado
3. ✅ `EMAIL_FROM` não configurado
4. ✅ Email já foi enviado anteriormente (status já era `completed`)

**Verificar logs**:
```bash
wrangler tail --project-name=vemgo
```

### Webhook retorna 500

**Possíveis causas**:
1. Payment ID inválido
2. Acesso negado à API do Mercado Pago (token expirado)
3. Erro de conexão com o banco de dados

### Venda não encontrada

**Possíveis causas**:
1. Email do pagador diferente do email cadastrado
2. Valor do pagamento diferente do valor esperado
3. Venda ainda não foi criada no banco

**Solução**:
- Verificar que o pagamento foi registrado em `/api/sales`
- Confirmar que o email está correto
- Verificar valor exato (incluindo centavos)

## Status Atual

✅ **Implementado e Testado**

| Recurso | Status |
|---------|--------|
| Receber notificações | ✅ Funcionando |
| Validar assinatura | ✅ Funcionando |
| Buscar detalhes do pagamento | ✅ Funcionando |
| Mapear status | ✅ Funcionando |
| Atualizar banco de dados | ✅ Funcionando |
| Enviar email | ✅ Funcionando |
| Logs detalhados | ✅ Funcionando |
| Modo teste/produção | ✅ Funcionando |

## Links Importantes

- **Webhook URL**: https://vemgo.com.br/api/webhooks/mercadopago
- **Deploy Atual**: https://8f6533d3.vemgo.pages.dev
- **Painel MP**: https://www.mercadopago.com.br/developers/panel
- **Docs MP Webhooks**: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- **Repositório**: https://github.com/kainow252-cmyk/vemgo

---

**Versão**: 1.0.0  
**Última Atualização**: 2026-03-14  
**Commit**: be952e0
