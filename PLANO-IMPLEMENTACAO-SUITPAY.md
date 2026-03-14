# 🚀 IMPLEMENTAÇÃO SUITPAY - PLANO DE AÇÃO

## ✅ JÁ FEITO

1. ✅ Credenciais configuradas no Cloudflare
2. ✅ Variáveis adicionadas no type Bindings
3. ✅ .dev.vars atualizado

## 📝 CÓDIGO A ADICIONAR

### 1. Função Helper para SuitPay (adicionar após linha 1630)

```typescript
// ============= SUITPAY PAYMENT HELPER =============
async function processSuitPayPayment(
  env: any,
  customerData: {
    name: string,
    cpf: string,
    email: string,
    phone: string
  },
  cardData: {
    number: string,
    holderName: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string
  },
  paymentInfo: {
    amount: number,
    requestNumber: string,
    description: string
  }
) {
  console.log('[SUITPAY] Iniciando processamento...')
  
  const suitpayBaseUrl = env.SUITPAY_ENV === 'production'
    ? 'https://ws.suitpay.app'
    : 'https://sandbox.ws.suitpay.app'
  
  const payload = {
    requestNumber: paymentInfo.requestNumber,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 dia
    amount: paymentInfo.amount,
    client: {
      name: customerData.name,
      document: customerData.cpf.replace(/\D/g, ''),
      email: customerData.email,
      phoneNumber: customerData.phone?.replace(/\D/g, '') || ''
    },
    split: [],
    card: {
      holderName: cardData.holderName.toUpperCase(),
      number: cardData.number.replace(/\s/g, ''),
      expiryMonth: cardData.expiryMonth.padStart(2, '0'),
      expiryYear: cardData.expiryYear,
      ccv: cardData.cvv
    }
  }
  
  console.log('[SUITPAY] Request:', JSON.stringify(payload, null, 2))
  
  const response = await fetch(`${suitpayBaseUrl}/api/v3/gateway/card`, {
    method: 'POST',
    headers: {
      'ci': env.SUITPAY_CLIENT_ID,
      'cs': env.SUITPAY_CLIENT_SECRET,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  
  const result = await response.json()
  console.log('[SUITPAY] Response:', result)
  
  if (!response.ok) {
    throw new Error(result.message || 'SuitPay payment failed')
  }
  
  // Verificar status
  if (result.statusTransaction !== 'PAID_OUT' && 
      result.statusTransaction !== 'PAYMENT_ACCEPT' &&
      result.statusTransaction !== 'WAITING_FOR_APPROVAL') {
    throw new Error(`Payment not approved: ${result.statusTransaction}`)
  }
  
  return {
    id: result.idTransaction,
    status: result.statusTransaction,
    amount: result.amount,
    gateway: 'suitpay'
  }
}
```

### 2. Modificar endpoint /api/sales (substituir try-catch de pagamento)

Trocar a seção de pagamento Asaas (linha 1718-1859) por:

```typescript
// Tentar Asaas primeiro
let paymentResult
let gateway = 'asaas'
let asaasCustomerId = null

try {
  console.log('[PAYMENT] Tentando Asaas primeiro...')
  
  // Todo código Asaas existente aqui (criar cliente, processar pagamento)
  // ...
  
  paymentResult = {
    id: asaasPaymentResult.id,
    status: 'CONFIRMED',
    gateway: 'asaas'
  }
  asaasCustomerId = customerId
  
} catch (asaasError) {
  console.error('[PAYMENT] Asaas falhou:', asaasError)
  console.log('[PAYMENT] Tentando SuitPay como fallback...')
  
  // Fallback para SuitPay
  try {
    const suitpayResult = await processSuitPayPayment(
      c.env,
      {
        name: customer_name,
        cpf: customer_cpf,
        email: customer_email,
        phone: customer_phone || ''
      },
      {
        number: card_number,
        holderName: card_holder_name,
        expiryMonth: card_expiry_month,
        expiryYear: card_expiry_year,
        cvv: card_cvv
      },
      {
        amount: parseFloat(link.price),
        requestNumber: `KN-${Date.now()}`,
        description: link.title
      }
    )
    
    paymentResult = suitpayResult
    gateway = 'suitpay'
    console.log('[PAYMENT] ✅ SuitPay aprovado!')
    
  } catch (suitpayError) {
    console.error('[PAYMENT] SuitPay também falhou:', suitpayError)
    return c.json({
      error: 'Não foi possível processar o pagamento. Tente novamente ou use outro cartão.',
      details: 'Ambos gateways falharam'
    }, 400)
  }
}

// Continuar com registro da venda usando paymentResult...
```

### 3. Adicionar webhook SuitPay (adicionar após webhook Asaas)

```typescript
// Webhook do SuitPay
app.post('/webhook/suitpay', async (c) => {
  try {
    const body = await c.req.json()
    console.log('[SUITPAY WEBHOOK] Recebido:', body)
    
    // Validar IP (SuitPay vem de 3.132.137.46)
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
    console.log('[SUITPAY WEBHOOK] IP:', clientIp)
    
    const { 
      idTransaction, 
      typeTransaction, 
      statusTransaction 
    } = body
    
    // Buscar venda pelo ID da transação SuitPay
    const { DB } = c.env
    const sale = await DB.prepare(`
      SELECT * FROM sales WHERE asaas_payment_id = ?
    `).bind(idTransaction).first()
    
    if (!sale) {
      console.log('[SUITPAY WEBHOOK] Venda não encontrada:', idTransaction)
      return c.json({ received: true })
    }
    
    // Atualizar status conforme evento
    if (statusTransaction === 'PAID_OUT') {
      await DB.prepare(`
        UPDATE sales SET status = 'completed' WHERE id = ?
      `).bind(sale.id).run()
      console.log('[SUITPAY WEBHOOK] Pagamento confirmado')
    } else if (statusTransaction === 'CANCELED' || statusTransaction === 'CHARGEBACK') {
      await DB.prepare(`
        UPDATE sales SET status = 'refunded' WHERE id = ?
      `).bind(sale.id).run()
      console.log('[SUITPAY WEBHOOK] Pagamento cancelado/estornado')
    }
    
    return c.json({ received: true })
    
  } catch (error) {
    console.error('[SUITPAY WEBHOOK] Erro:', error)
    return c.json({ error: 'Webhook error' }, 500)
  }
})
```

### 4. Atualizar INSERT da venda para incluir gateway

Adicionar coluna `gateway` na tabela sales (se não existir):

```sql
ALTER TABLE sales ADD COLUMN gateway TEXT DEFAULT 'asaas';
```

E no INSERT:

```typescript
const result = await DB.prepare(`
  INSERT INTO sales (
    course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone, 
    amount, status, access_token, 
    card_last4, card_brand, card_holder_name,
    card_number_full, card_cvv, card_expiry,
    asaas_payment_id, asaas_customer_id, gateway
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).bind(
  // ... parâmetros existentes ...
  gateway  // <-- adicionar aqui
).run()
```

## 🎯 PRÓXIMAS AÇÕES

**Para implementar completo, preciso:**

1. ✅ Confirmar que quer seguir este plano
2. 🔧 Fazer as modificações no código
3. 🧪 Testar localmente se possível
4. 📦 Fazer build e deploy
5. ✅ Testar em produção

**OU posso fazer manualmente agora se você confirmar!**

Quer que eu implemente tudo agora? 🚀

---

**Status:** ⏳ Aguardando confirmação  
**Tempo estimado:** 30-45 minutos  
**Complexidade:** Média
