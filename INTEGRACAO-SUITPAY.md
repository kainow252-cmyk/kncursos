# 💳 INTEGRAÇÃO SUITPAY - Segunda Opção de Pagamento

## 🎯 OBJETIVO

Adicionar **SuitPay** como segunda opção de gateway de pagamento, funcionando como **fallback** caso o Asaas falhe.

---

## 📋 INFORMAÇÕES DA API SUITPAY

### **Documentação Oficial:**
```
https://api.suitpay.app/
```

### **Ambientes Disponíveis:**

**Sandbox (Testes):**
```
https://sandbox.ws.suitpay.app
```

**Produção:**
```
https://ws.suitpay.app
```

---

## 🔐 CREDENCIAIS NECESSÁRIAS

### **Para Integrar, Você Precisa:**

1. **Client ID (ci)**
   - Gerado no portal SuitPay
   - Exemplo: `suit_client_12345...`

2. **Client Secret (cs)**
   - Gerado junto com Client ID
   - ⚠️ Armazenar em local seguro
   - Não pode ser visualizado novamente

### **Como Obter as Credenciais:**

1. Acesse: https://web.suitpay.app
2. Faça login com seu usuário
3. Vá em: **VENDAS → GATEWAY DE PAGAMENTO → Chaves API**
4. Clique em **"Gerar Chaves"**
5. Copie o **Client ID (ci)** e **Client Secret (cs)**
6. ⚠️ **IMPORTANTE:** Guarde as chaves imediatamente!

---

## 💳 ENDPOINT DE PAGAMENTO COM CARTÃO

### **URL:**
```
POST https://ws.suitpay.app/api/v3/gateway/card
```

### **Headers Necessários:**
```http
ci: SEU_CLIENT_ID
cs: SEU_CLIENT_SECRET
Content-Type: application/json
```

### **Payload (Request Body):**
```json
{
  "requestNumber": "PED12345",
  "dueDate": "2026-03-31",
  "amount": 100.00,
  "client": {
    "name": "João Silva",
    "document": "12345678900",
    "email": "cliente@exemplo.com",
    "phoneNumber": "11999999999"
  },
  "split": [],
  "card": {
    "holderName": "JOAO SILVA",
    "number": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2028",
    "ccv": "123"
  }
}
```

### **Resposta de Sucesso (200):**
```json
{
  "idTransaction": "550e8400-e29b-41d4-a716-446655440000",
  "typeTransaction": "CARD",
  "statusTransaction": "PAID_OUT",
  "amount": 100.00,
  "requestNumber": "PED12345"
}
```

### **Status Possíveis:**
- `PAID_OUT` - Pagamento aprovado ✅
- `WAITING_FOR_APPROVAL` - Aguardando aprovação
- `PAYMENT_ACCEPT` - Pagamento aceito
- `CANCELED` - Transação cancelada ❌
- `CHARGEBACK` - Chargeback

---

## 🔔 WEBHOOK SUITPAY

### **URL do Webhook (Nosso Sistema):**
```
https://c02d2ec7.vemgo.pages.dev/webhook/suitpay
```

### **Payload Recebido:**
```json
{
  "idTransaction": "550e8400-e29b-41d4-a716-446655440000",
  "typeTransaction": "CARD",
  "statusTransaction": "PAID_OUT"
}
```

### **Validação de IP:**
O webhook só é válido se vier do IP:
```
3.132.137.46
```

### **Configurar no SuitPay:**
1. Acesse: https://web.suitpay.app
2. Vá em: **VENDAS → GATEWAY DE PAGAMENTO → Webhooks**
3. Adicione a URL: `https://c02d2ec7.vemgo.pages.dev/webhook/suitpay`
4. Tipo: **Rest**
5. Método: **POST**

---

## 🔧 IMPLEMENTAÇÃO

### **1. Variáveis de Ambiente:**

Adicionar no Cloudflare Pages:
```bash
SUITPAY_CLIENT_ID=seu_client_id_aqui
SUITPAY_CLIENT_SECRET=seu_client_secret_aqui
SUITPAY_ENV=production  # ou sandbox
```

### **2. Adicionar no .dev.vars:**
```bash
# SuitPay (Segunda opção de pagamento)
SUITPAY_CLIENT_ID=seu_client_id
SUITPAY_CLIENT_SECRET=seu_client_secret
SUITPAY_ENV=sandbox
```

### **3. Lógica de Fallback:**

```typescript
// Tentar Asaas primeiro
try {
  const asaasPayment = await processAsaasPayment(...)
  if (asaasPayment.status === 'approved') {
    return asaasPayment
  }
} catch (error) {
  console.log('[FALLBACK] Asaas falhou, tentando SuitPay...')
}

// Se Asaas falhar, usar SuitPay
try {
  const suitpayPayment = await processSuitPayPayment(...)
  return suitpayPayment
} catch (error) {
  return { error: 'Ambos gateways falharam' }
}
```

---

## 📊 FLUXO DE PAGAMENTO COM FALLBACK

```
1. Cliente preenche dados do cartão
   └─> Sistema tenta Asaas primeiro

2. Asaas processa pagamento
   ├─> ✅ Aprovado → Fim (usa Asaas)
   └─> ❌ Falhou → Continua para SuitPay

3. SuitPay processa pagamento (fallback)
   ├─> ✅ Aprovado → Fim (usa SuitPay)
   └─> ❌ Falhou → Erro final

4. Cliente recebe resposta
   └─> Aprovado ou Recusado
```

---

## 💰 TAXAS SUITPAY

**Consultar no portal:**
- Acesse: https://web.suitpay.app
- Menu: **FINANCEIRO → Tarifas**

**Taxas típicas (verificar no seu contrato):**
- Cartão de Crédito: ~3-4%
- PIX: ~0.5-1%
- Boleto: R$ 2-3 fixo

---

## 🧪 TESTES

### **Cartões de Teste (Sandbox):**

**Aprovado:**
```
Número: 4111111111111111
CVV: 123
Validade: 12/2028
Nome: TESTE APROVADO
```

**Recusado:**
```
Número: 4000000000000002
CVV: 123
Validade: 12/2028
Nome: TESTE RECUSADO
```

### **Testar Fallback:**
1. Desabilitar Asaas temporariamente
2. Fazer compra no sistema
3. Sistema deve usar SuitPay automaticamente
4. Verificar webhook recebido

---

## 📝 CHECKLIST DE INTEGRAÇÃO

- [ ] Obter credenciais do SuitPay (Client ID + Secret)
- [ ] Adicionar credenciais no Cloudflare
- [ ] Atualizar .dev.vars local
- [ ] Implementar função de pagamento SuitPay
- [ ] Adicionar lógica de fallback
- [ ] Implementar webhook /webhook/suitpay
- [ ] Configurar webhook no portal SuitPay
- [ ] Testar pagamento direto SuitPay
- [ ] Testar fallback (Asaas → SuitPay)
- [ ] Verificar webhooks funcionando
- [ ] Testar em produção (valor baixo)
- [ ] Documentar fluxo para equipe

---

## 🆘 SUPORTE SUITPAY

### **Contatos:**
- 🌐 **Portal:** https://web.suitpay.app
- 📧 **Email:** suporte@suitpay.app
- 📚 **Docs:** https://api.suitpay.app
- 💬 **Suporte:** Via portal (chat/ticket)

---

## 🎯 PRÓXIMOS PASSOS

### **Para Começar:**

1. ⚠️ **Me forneça as credenciais:**
   ```
   Client ID (ci): ?
   Client Secret (cs): ?
   Ambiente: sandbox ou production?
   ```

2. Após receber, vou:
   - ✅ Configurar no Cloudflare
   - ✅ Implementar integração
   - ✅ Adicionar lógica de fallback
   - ✅ Criar webhook
   - ✅ Testar funcionamento
   - ✅ Fazer deploy

3. Você configura:
   - ✅ Webhook no portal SuitPay
   - ✅ Testar compra real

---

## 🔥 BENEFÍCIOS DO FALLBACK

### **Redundância:**
- ✅ Se Asaas cair, SuitPay assume
- ✅ 99.9% de uptime combinado
- ✅ Menos vendas perdidas

### **Flexibilidade:**
- ✅ Dois gateways = mais opções
- ✅ Pode escolher baseado em taxas
- ✅ Diversificação de risco

### **Confiabilidade:**
- ✅ Sistema mais robusto
- ✅ Menos preocupação com falhas
- ✅ Melhor experiência do cliente

---

## 📊 COMPARAÇÃO

| Recurso | Asaas | SuitPay |
|---------|-------|---------|
| **Cartão** | ✅ Sim | ✅ Sim |
| **PIX** | ✅ Sim | ✅ Sim |
| **Boleto** | ✅ Sim | ✅ Sim |
| **Webhook** | ✅ Sim | ✅ Sim |
| **Sandbox** | ✅ Sim | ✅ Sim |
| **Taxas** | 3.49% | ~3-4% |
| **Prazo** | D+30 | A consultar |

---

## ✅ STATUS ATUAL

- [x] ✅ Documentação lida
- [x] ✅ API mapeada
- [x] ✅ Endpoints identificados
- [x] ✅ Webhooks entendidos
- [ ] ⏳ **Aguardando credenciais do cliente**
- [ ] ⏳ Implementação pendente
- [ ] ⏳ Testes pendentes
- [ ] ⏳ Deploy pendente

---

**Última Atualização:** 14 de março de 2026  
**Status:** Aguardando credenciais do SuitPay  
**Versão:** 1.0.0
