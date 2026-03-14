# 💳 Integração Mercado Pago - KN Cursos

## 🎯 Visão Geral

Sistema de pagamento integrado com Mercado Pago usando tokenização segura no frontend. Os dados do cartão nunca trafegam pelo backend, garantindo conformidade com PCI-DSS.

## 🔐 Arquitetura de Segurança

### Fluxo de Pagamento

```
Frontend (Navegador)                Backend (Cloudflare Worker)           Mercado Pago API
     |                                        |                                    |
     |  1. Preenche formulário                |                                    |
     |     com dados do cartão                |                                    |
     |                                        |                                    |
     |  2. MercadoPago.js cria                |                                    |
     |     token seguro (PCI-DSS)             |                                    |
     |---------------------------------------->|                                    |
     |                                        |                                    |
     |  3. Envia apenas:                      |                                    |
     |     - card_token (gerado SDK)          |                                    |
     |     - Dados do cliente                 |                                    |
     |                                        |  4. Processa pagamento             |
     |                                        |    com token                       |
     |                                        |----------------------------------->|
     |                                        |                                    |
     |                                        |  5. Resposta com                   |
     |                                        |     dados do cartão                |
     |                                        |<-----------------------------------|
     |                                        |                                    |
     |  6. Resultado do pagamento             |                                    |
     |<---------------------------------------|                                    |
     |                                        |                                    |
```

### ✅ Dados que NUNCA trafegam pelo backend:
- ❌ Número do cartão completo
- ❌ CVV/CVC
- ❌ Data de expiração
- ❌ Qualquer dado sensível do cartão

### ✅ O que trafega:
- ✅ Token seguro (gerado pelo MercadoPago.js)
- ✅ Nome do titular
- ✅ Dados do cliente (nome, CPF, email)

## 📋 Credenciais (Produção)

```bash
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-5716535937560584-031411-2918c1981f3aedf35d78130417de81ac-2911366389
MERCADOPAGO_PUBLIC_KEY=APP_USR-f0b3ead2-9739-4ac0-ac36-1522181f317b

# Outras
RESEND_API_KEY=re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
EMAIL_FROM=cursos@kncursos.com.br
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kncursos2024
JWT_SECRET=kncursos-jwt-secret-production-2024
```

## 🚀 Como Funciona

### Frontend (src/index.tsx - linha ~3658)

```javascript
// 1. Inicializar SDK do Mercado Pago
const mp = new MercadoPago('PUBLIC_KEY', {
    locale: 'pt-BR'
});

// 2. Criar token do cartão (função processPayment)
const cardToken = await mp.fields.createCardToken({
    cardNumber: cardNumber.replace(/\s/g, ''),
    cardholderName: cardName,
    cardExpirationMonth: month,
    cardExpirationYear: '20' + year,
    securityCode: cardCvv,
    identificationType: 'CPF',
    identificationNumber: cpf.replace(/\D/g, '')
});

// 3. Enviar apenas o token para o backend
const response = await axios.post('/api/sales', {
    link_code: linkCode,
    customer_name: name,
    customer_cpf: cpf,
    customer_email: email,
    customer_phone: phone,
    card_token: cardToken.id,  // ← Token seguro
    card_holder_name: cardName
});
```

### Backend (src/index.tsx - linha ~1613)

```javascript
// 1. Validar campos (sem dados do cartão)
const {
    link_code,
    customer_name,
    customer_cpf,
    customer_email,
    customer_phone,
    card_token,        // ← Token do frontend
    card_holder_name
} = body;

// 2. Processar pagamento com Mercado Pago
const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `kncursos-${Date.now()}`
    },
    body: JSON.stringify({
        transaction_amount: parseFloat(link.price),
        description: link.title,
        token: card_token,  // ← Token seguro
        installments: 1,
        payer: {
            email: customer_email,
            identification: {
                type: 'CPF',
                number: customer_cpf.replace(/\D/g, '')
            }
        },
        statement_descriptor: 'KNCURSOS',
        notification_url: 'https://kncursos.com.br/api/webhooks/mercadopago',
        metadata: {
            link_code: link_code,
            course_id: link.course_id.toString(),
            platform: 'kncursos'
        }
    })
});

// 3. Extrair dados do cartão da resposta
const card_last4 = paymentResult.card?.last_four_digits || '****';
const card_brand = paymentResult.payment_method_id || 'unknown';
const card_exp = paymentResult.card 
    ? `${String(paymentResult.card.expiration_month).padStart(2, '0')}/${String(paymentResult.card.expiration_year).slice(-2)}`
    : 'N/A';
```

## 🧪 Testes

### Cartões de Teste (Ambiente de Produção)

```bash
# ✅ APROVADOS
Mastercard: 5031 4332 1540 6351
Visa:       4509 9535 6623 3704
Amex:       3711 803032 57522

# ❌ RECUSADO
Visa: 4774 0611 4651 5896

# ⏳ PENDENTE
Mastercard: 5031 7557 3453 0604

# Dados para teste
CVV: qualquer 3-4 dígitos
Validade: qualquer data futura (MM/AA)
Titular: qualquer nome
CPF: 123.456.789-01 (ou qualquer CPF válido)
```

### Teste Manual via Web

1. Acesse: https://kncursos.com.br/checkout/MKT2024ABC
2. Preencha o formulário
3. Use um dos cartões de teste acima
4. Abra o Console do navegador (F12) para ver os logs:
   - `[CHECKOUT] Criando token do cartão...`
   - `[CHECKOUT] Token criado: tok_xxx...`

### Teste via cURL (simulação)

```bash
# NOTA: Este teste NÃO funcionará porque o token precisa ser gerado pelo SDK
# É apenas para demonstrar a estrutura da requisição

curl -X POST https://kncursos.com.br/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "João Silva Teste",
    "customer_cpf": "123.456.789-01",
    "customer_email": "joao.teste@example.com",
    "customer_phone": "11999887766",
    "card_token": "SIMULATED_TOKEN",
    "card_holder_name": "JOAO SILVA"
  }'

# Resposta esperada: erro porque o token não é válido
# Para teste real, use o formulário web
```

## 📊 Webhooks

### Endpoint: `/api/webhooks/mercadopago`

Recebe notificações do Mercado Pago sobre mudanças de status do pagamento.

```javascript
// Tipos de eventos
PAYMENT_CREATED        // Pagamento criado
PAYMENT_UPDATED        // Status atualizado
CHARGEBACK_CREATED     // Contestação criada
CHARGEBACK_UPDATED     // Contestação atualizada
```

### Status de Pagamento

```javascript
// Mapeamento de status
approved    → completed  // Aprovado
authorized  → completed  // Autorizado
in_process  → pending    // Em análise
pending     → pending    // Pendente
rejected    → failed     // Rejeitado
cancelled   → failed     // Cancelado
refunded    → failed     // Reembolsado
charged_back → failed    // Contestado
```

### Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Sua integração → Notificações IPN
3. URL: `https://kncursos.com.br/api/webhooks/mercadopago`
4. Eventos: Selecionar todos (Payment, Chargeback, etc.)

## 🛠️ Manutenção

### Logs Importantes

```javascript
// Frontend (Console do navegador)
[CHECKOUT] Criando token do cartão...
[CHECKOUT] Token criado: tok_xxx...
[CHECKOUT] Processando pagamento...

// Backend (Cloudflare Worker Logs)
[MERCADOPAGO] Link Code: MKT2024ABC
[MERCADOPAGO] Cliente: João Silva, joao@example.com
[MERCADOPAGO] Curso: Nome do Curso
[MERCADOPAGO] Valor: R$ 99.90
[MERCADOPAGO] Token: tok_xxx...
[MERCADOPAGO] Criando pagamento com token
[MERCADOPAGO] Status HTTP: 201
[MERCADOPAGO] ✅ Pagamento aprovado!
[SALES] Registrando venda no banco de dados...
[SALES] ✅ Venda registrada com sucesso!
[EMAIL] Enviando email de confirmação...
```

### Erros Comuns

#### ❌ "Token do cartão é obrigatório"
- **Causa**: Frontend não enviou o card_token
- **Solução**: Verificar se o MercadoPago.js está carregado e criando o token

#### ❌ "invalid_card_data" ou "bad_request"
- **Causa**: Dados do cartão inválidos
- **Solução**: Usar cartões de teste válidos do Mercado Pago

#### ❌ "ACCESS_DENIED" ou "401 Unauthorized"
- **Causa**: Token de acesso inválido
- **Solução**: Verificar MERCADOPAGO_ACCESS_TOKEN no Cloudflare

#### ❌ Token inválido/expirado
- **Causa**: Token gerado incorretamente ou expirado
- **Solução**: Token é de uso único; gerar novo token a cada tentativa

## 📈 Métricas

### Performance

- **Bundle Size**: 454.57 KB (reduzido 11% vs versão anterior com SDK)
- **Tempo de resposta**: ~500ms para criar pagamento
- **Tempo total**: ~2-3s (incluindo envio de email)

### Segurança

- ✅ **PCI-DSS Compliant**: Dados sensíveis tokenizados no frontend
- ✅ **HTTPS Only**: Todas as comunicações criptografadas
- ✅ **Rate Limiting**: Proteção contra abuso
- ✅ **CORS**: Apenas origens autorizadas

## 🔗 Links Úteis

- **Mercado Pago Docs**: https://www.mercadopago.com.br/developers
- **SDK JavaScript**: https://github.com/mercadopago/sdk-js
- **API Reference**: https://www.mercadopago.com.br/developers/pt/reference
- **Cartões de Teste**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/additional-content/your-integrations/test/cards
- **Dashboard**: https://www.mercadopago.com.br/developers/panel

## 📝 Checklist de Deploy

- [x] Configurar credenciais no Cloudflare Pages
- [x] Adicionar MercadoPago.js SDK no frontend
- [x] Implementar tokenização no formulário
- [x] Modificar backend para aceitar card_token
- [x] Remover validações de dados do cartão
- [x] Configurar webhook
- [x] Testar com cartões de teste
- [ ] Configurar webhook URL no painel do Mercado Pago
- [ ] Testar webhook com pagamento real
- [ ] Monitorar logs no Cloudflare
- [ ] Configurar alertas para erros

## 🎉 Benefícios

### Segurança
- ✅ Conformidade PCI-DSS sem certificação adicional
- ✅ Dados sensíveis nunca passam pelo servidor
- ✅ Tokenização segura pelo Mercado Pago

### Performance
- ✅ Bundle reduzido: 509 KB → 454 KB (-11%)
- ✅ Menos dependências (removido mercadopago SDK)
- ✅ Uso direto da API REST

### Manutenção
- ✅ Código mais simples e direto
- ✅ Menos pontos de falha
- ✅ Logs detalhados para debug

---

**Última atualização**: 14/03/2026
**Versão**: 2.0.0 (com tokenização)
