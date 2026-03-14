# ⚠️ SuitPay - Integração Pendente

## Status Atual
❌ **Implementação pausada** - Aguardando documentação oficial

## Problema Identificado
A documentação pública do SuitPay (https://api.suitpay.app/) **NÃO contém informações sobre o endpoint de pagamentos com cartão de crédito**.

### O que já fizemos:
✅ Configuramos as credenciais (Client ID e Client Secret)
✅ Implementamos o webhook `/api/webhooks/suitpay`
✅ Adicionamos as colunas no banco de dados
✅ Criamos a função `processSuitPayPayment()`

### O que está faltando:
❌ **Endpoint correto** para processar pagamentos com cartão
❌ **Formato do payload** esperado pela API
❌ **Campos obrigatórios** da requisição
❌ **Formato da resposta** (payment_id, status, etc.)

## Documentação Disponível
A SuitPay possui duas documentações públicas:

1. **https://api.suitpay.app/** - Contém:
   - Autenticação (ci e cs no header)
   - Webhooks (PIX, Card, Boleto)
   - ⚠️ **NÃO** contém endpoints

2. **https://pix.suitpay.app/** - Contém:
   - Endpoints de PIX Cash-in/Cash-out
   - ⚠️ **NÃO** contém endpoints de cartão

## Solução Temporária

### Status Implementado
✅ **Sistema continua 100% funcional** usando apenas Asaas
✅ Infraestrutura do fallback SuitPay está preparada
⏸️ Fallback desabilitado temporariamente (será ativado quando tivermos os endpoints)

### Como Reativar o Fallback

Quando obtivermos a documentação oficial, fazer:

1. **Atualizar a função processSuitPayPayment():**
```typescript
// Trocar linha 1897 (atual):
const paymentResponse = await fetch(`${suitpayBaseUrl}/api/v1/gateway/request-qrcode`, {

// Por (exemplo - ajustar com documentação real):
const paymentResponse = await fetch(`${suitpayBaseUrl}/api/v1/ENDPOINT_CORRETO_AQUI`, {
```

2. **Ajustar o payload conforme documentação:**
```typescript
const paymentData = {
  // Preencher com campos corretos da documentação
}
```

3. **Rebuild e deploy:**
```bash
npm run build
npm run deploy
```

## Próximos Passos

### Opção 1: Contatar Suporte Suit Pay
📧 Email: suporte@suitpay.app (ou através do chat no portal)
📝 Solicitar: "Documentação da API para pagamentos com cartão de crédito"

### Opção 2: Verificar no Portal
1. Acessar: https://web.suitpay.app
2. Menu: VENDAS → GATEWAY DE PAGAMENTO → Documentação/API
3. Procurar por seção "Cartões" ou "Credit Card"

### Opção 3: Consultar Desenvolvedores
Verificar se há exemplos de integração no GitHub ou comunidade de desenvolvedores da SuitPay

## Informações Úteis

### Credenciais Configuradas
```bash
SUITPAY_CLIENT_ID=gelcisilva252gmailcom_1770645693125
SUITPAY_CLIENT_SECRET=8585d76f3ff215bcb2984af9f8a7e883bb465f96b00dd185b9320624c47276e9e5267d74d7654e9f826d3d4843607b47
SUITPAY_ENV=production
```

### Base URLs
- Produção: `https://ws.suitpay.app`
- Sandbox: `https://sandbox.ws.suitpay.app`

### Webhook Configurado
- URL: `https://b002e9f3.kncursos.pages.dev/api/webhooks/suitpay`
- Formato: REST, POST, JSON
- Status mapeados: `PAID_OUT`, `PAYMENT_ACCEPT`, `WAITING_FOR_APPROVAL`, `CANCELED`, `CHARGEBACK`

## Conclusão

🎯 **O sistema está 100% funcional com Asaas**
⏳ **Aguardando documentação oficial para ativar fallback SuitPay**
✅ **Toda infraestrutura pronta - basta configurar o endpoint correto**

---
Última atualização: 14/03/2026 13:26 UTC
