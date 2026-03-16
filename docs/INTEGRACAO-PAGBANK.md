# Integração PagBank - Vemgo

## 📊 Status: Implementando

**Data:** 14/03/2026 16:50 UTC

---

## 🔑 Credenciais Necessárias

### Produção
- **Public Key:** [AGUARDANDO]
- **Bearer Token:** `36af5904-5c62-4d9c-99b7-896326ac520104bb89964e3dabe47128fbfbaebd4f8b141a-63c5-46b8-a769-9e847f421d1a`
- **Base URL:** `https://api.pagseguro.com`

---

## 🏗️ Arquitetura da Integração

### Fluxo de Pagamento

```
1. Cliente preenche checkout
         ↓
2. Frontend criptografa cartão (SDK PagBank)
         ↓
3. Backend cria pedido (POST /orders)
         ↓
4. PagBank processa pagamento
         ↓
5. Resposta: PAID ou DECLINED
         ↓
6. Sistema envia email + libera download
```

### Endpoint PagBank

```
POST https://api.pagseguro.com/orders
Authorization: Bearer {token}
Content-Type: application/json
```

### Payload

```json
{
  "reference_id": "sale_123",
  "customer": {
    "name": "Nome do Cliente",
    "email": "[email protected]",
    "tax_id": "12345678901",
    "phones": [{
      "country": "55",
      "area": "11",
      "number": "999999999",
      "type": "MOBILE"
    }]
  },
  "items": [{
    "reference_id": "MKT2024ABC",
    "name": "Curso de Marketing Digital",
    "quantity": 1,
    "unit_amount": 1000
  }],
  "charges": [{
    "reference_id": "charge_123",
    "description": "Pagamento do curso",
    "amount": {
      "value": 1000,
      "currency": "BRL"
    },
    "payment_method": {
      "type": "CREDIT_CARD",
      "installments": 1,
      "capture": true,
      "card": {
        "encrypted": "{cartão criptografado}",
        "store": false
      },
      "holder": {
        "name": "Nome no Cartão",
        "tax_id": "12345678901"
      }
    }
  }],
  "notification_urls": [
    "https://vemgo.com.br/api/webhooks/pagbank"
  ]
}
```

### Resposta de Sucesso

```json
{
  "id": "ORDE_xxx",
  "charges": [{
    "id": "CHAR_xxx",
    "status": "PAID",
    "payment_response": {
      "code": "20000",
      "message": "SUCESSO"
    },
    "payment_method": {
      "card": {
        "brand": "visa",
        "last_digits": "1111"
      }
    }
  }]
}
```

### Status Possíveis

| Status | Descrição | Ação |
|--------|-----------|------|
| `PAID` | Pagamento aprovado | Liberar acesso |
| `DECLINED` | Pagamento recusado | Informar cliente |
| `AUTHORIZED` | Autorizado (aguardando captura) | Capturar |
| `IN_ANALYSIS` | Em análise | Aguardar |
| `CANCELED` | Cancelado | Informar cliente |

---

## 🔧 Implementação Frontend

### SDK PagBank

```html
<script src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"></script>
```

### Criptografar Cartão

```javascript
const card = PagSeguro.encryptCard({
  publicKey: "SUA_CHAVE_PUBLICA",
  holder: "Nome no Cartão",
  number: "4242424242424242",
  expMonth: "12",
  expYear: "2030",
  securityCode: "123"
});

if (!card.hasErrors) {
  const encrypted = card.encryptedCard;
  // Enviar para backend
} else {
  console.error(card.errors);
}
```

---

## 🔧 Implementação Backend

### Variáveis de Ambiente

```bash
PAGBANK_PUBLIC_KEY="MIIBIjANBg..."
PAGBANK_TOKEN="Bearer 36af5904-5c62..."
PAGBANK_ENV="production"
```

### Endpoint: POST /api/sales

```typescript
// 1. Criar pedido no PagBank
const pagbankResponse = await fetch('https://api.pagseguro.com/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAGBANK_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference_id: `sale_${Date.now()}`,
    customer: { ... },
    items: [ ... ],
    charges: [{
      payment_method: {
        type: 'CREDIT_CARD',
        card: {
          encrypted: encryptedCard  // Do frontend
        }
      }
    }]
  })
});

const result = await pagbankResponse.json();

// 2. Verificar status
if (result.charges[0].status === 'PAID') {
  // Salvar venda
  // Enviar email
  // Liberar download
}
```

---

## 🔔 Webhook PagBank

### URL
```
POST https://vemgo.com.br/api/webhooks/pagbank
```

### Payload

```json
{
  "id": "ORDE_xxx",
  "charges": [{
    "id": "CHAR_xxx",
    "status": "PAID",
    "reference_id": "charge_123"
  }]
}
```

### Tratamento

```typescript
app.post('/api/webhooks/pagbank', async (c) => {
  const payload = await c.req.json();
  
  const chargeId = payload.charges[0].id;
  const status = payload.charges[0].status;
  
  // Atualizar venda no banco
  await DB.prepare(`
    UPDATE sales 
    SET status = ? 
    WHERE pagbank_charge_id = ?
  `).bind(status === 'PAID' ? 'completed' : 'failed', chargeId).run();
  
  return c.json({ received: true });
});
```

---

## 🧪 Cartões de Teste (Sandbox)

| Cartão | Resultado |
|--------|-----------|
| 4242424242424242 | Aprovado |
| 4000000000000010 | Recusado |

> **Nota:** Para produção, use cartões reais

---

## 📊 Vantagens vs. Asaas

| | PagBank | Asaas |
|---|---------|-------|
| **SDK Frontend** | ✅ Sim | ❌ Não |
| **Criptografia** | ✅ Browser | ⚠️ Servidor |
| **Endpoints** | ✅ 1 só (`/orders`) | ⚠️ Múltiplos |
| **Documentação** | ✅ Excelente | ⚠️ Confusa |
| **API REST** | ✅ Sempre ativa | ❌ Precisa ativar |
| **Taxa** | ~3-5% | ~3-5% |

---

## 🚀 Próximos Passos

1. ✅ Buscar Public Key no painel
2. ✅ Confirmar Bearer Token
3. ⏳ Implementar código
4. ⏳ Testar em produção
5. ⏳ Deploy

**Tempo estimado:** 20-30 minutos após receber as chaves

---

## 📞 Suporte PagBank

- **Portal:** https://dev.pagseguro.uol.com.br
- **Documentação:** https://developer.pagbank.com.br
- **Suporte:** https://painel.pagbank.com.br/atendimento

---

**Aguardando as 2 chaves para implementar!** 🚀
