# 🔐 Integração Mercado Pago - Ambiente Sandbox

## 📋 Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Credenciais de Teste](#credenciais-de-teste)
3. [Fluxo de Pagamento](#fluxo-de-pagamento)
4. [Cartões de Teste](#cartões-de-teste)
5. [Status Atual](#status-atual)
6. [Próximos Passos](#próximos-passos)

---

## 🚀 Configuração Inicial

### 1. Obter Credenciais do Mercado Pago

1. **Acesse**: https://www.mercadopago.com.br/developers
2. **Login**: Entre com sua conta Mercado Pago
3. **Suas integrações**: Clique em "Suas integrações"
4. **Criar aplicação**: Clique em "Criar aplicação"
5. **Preencha os dados**:
   - Nome: `vemgo`
   - Descrição: `Plataforma de cursos online`
   - Categoria: `Educação`
6. **Copie as credenciais**:
   - **Public Key** (começa com `APP_USR-...`)
   - **Access Token** (começa com `APP_USR-...`)

### 2. Configurar no Cloudflare Pages

```bash
# No terminal local ou via Cloudflare Dashboard

# Access Token (backend)
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name vemgo
# Cole o Access Token quando solicitado

# Public Key (frontend)
npx wrangler pages secret put MERCADOPAGO_PUBLIC_KEY --project-name vemgo
# Cole o Public Key quando solicitado
```

### 3. Configurar Localmente (Desenvolvimento)

Crie o arquivo `.dev.vars` na raiz do projeto:

```bash
cd /home/user/webapp
cat > .dev.vars << 'EOF'
# Mercado Pago - Credenciais de TESTE
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012

# Banco de dados
DB=vemgo

# JWT
JWT_SECRET=vemgo-jwt-secret-change-in-production-2024

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=vemgo2024

# Email (Resend)
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=cursos@vemgo.com.br
EOF
```

**⚠️ IMPORTANTE**: Adicione `.dev.vars` ao `.gitignore`:

```bash
echo ".dev.vars" >> .gitignore
```

---

## 🔑 Credenciais de Teste

### Contas de Teste

O Mercado Pago fornece **contas de teste** para simular compradores e vendedores:

1. **Acesse**: https://www.mercadopago.com.br/developers/panel/test-users
2. **Criar conta de teste**:
   - **Vendedor**: Para receber pagamentos
   - **Comprador**: Para realizar compras

### Exemplo de Credenciais TEST

```
Public Key:  TEST-12345678-1234-1234-1234-123456789012
Access Token: TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
```

---

## 💳 Cartões de Teste

### Cartões Aprovados

| Bandeira | Número | CVV | Validade | Status |
|----------|--------|-----|----------|--------|
| **Visa** | `4509 9535 6623 3704` | 123 | 11/25 | ✅ Aprovado |
| **Mastercard** | `5031 4332 1540 6351` | 123 | 11/25 | ✅ Aprovado |
| **Amex** | `3711 803032 57522` | 1234 | 11/25 | ✅ Aprovado |

### Cartões com Diferentes Status

| Status | Número do Cartão | CVV | Resultado |
|--------|------------------|-----|-----------|
| ✅ **Aprovado** | `5031 4332 1540 6351` | 123 | Pagamento aprovado |
| ⏳ **Pendente** | `5031 7557 3453 0604` | 123 | Aguardando pagamento |
| ❌ **Recusado - Fundos** | `5031 4332 1540 6351` | 123 | Saldo insuficiente |
| ❌ **Recusado - Outro** | `5031 7557 3453 0604` | 123 | Chamada ao autorizador |

### Dados do Comprador (Teste)

```
Nome: APRO (aprovado) ou OXXO (rejeitado)
CPF: 123.456.789-00
Email: test_user_123456@testuser.com
Telefone: (11) 98765-4321
```

---

## 🔄 Fluxo de Pagamento

### Modo Atual: TESTE (Simulação)

```javascript
// src/index.tsx - Linha ~252
const isTestMode = true // ← ATIVO (modo teste)
```

**Comportamento**:
- ✅ Aceita **qualquer cartão**
- ✅ Aprova **automaticamente**
- ✅ Não chama API do Mercado Pago
- ✅ Ideal para **desenvolvimento**

### Modo Produção: Mercado Pago Real

```javascript
const isTestMode = false // ← Usar em produção
```

**Fluxo Correto**:

```
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND (checkout)                                  │
│    ↓ Usuário preenche dados do cartão                   │
│    ↓ MercadoPago.js tokeniza o cartão                   │
│    ↓ Gera card_token (sem enviar dados sensíveis)       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. BACKEND (API /api/sales)                             │
│    ↓ Recebe: card_token, customer_data, link_code       │
│    ↓ Busca dados do curso no banco                      │
│    ↓ Chama API Mercado Pago com token                   │
│    ↓ POST /v1/payments                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MERCADO PAGO                                         │
│    ↓ Processa pagamento                                 │
│    ↓ Retorna status: approved/rejected/pending          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. BACKEND (pós-pagamento)                              │
│    ↓ Se aprovado: registra venda no banco               │
│    ↓ Gera access_token único                            │
│    ↓ Envia email com link de download                   │
│    ↓ Retorna sucesso ao frontend                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Status Atual

### ✅ Implementado

- [x] Estrutura de banco de dados (sales, payment_links)
- [x] Endpoint `/api/sales` (modo teste)
- [x] Página de checkout (`/checkout/:code`)
- [x] Validação de link de pagamento
- [x] Registro de vendas no banco
- [x] Geração de access_token único

### 🔄 Em Modo Teste

- [x] Simulação de pagamento aprovado
- [x] Aceita qualquer número de cartão
- [x] Não valida dados reais
- [x] Logs de debug no console

### 🚧 Pendente (Para Produção)

- [ ] Integrar SDK do Mercado Pago no frontend
- [ ] Tokenizar cartão antes de enviar ao backend
- [ ] Configurar credenciais reais no Cloudflare
- [ ] Implementar webhook para notificações
- [ ] Adicionar tratamento de erros específicos do MP
- [ ] Configurar email de confirmação (Resend)
- [ ] Testes com cartões de teste do MP

---

## 🛠️ Próximos Passos

### Etapa 1: Configurar SDK no Frontend

Adicionar no checkout (`/checkout/:code`):

```html
<!-- Já está incluído na linha 1487 -->
<script src="https://sdk.mercadopago.com/js/v2"></script>

<script>
const mp = new MercadoPago('SEU_PUBLIC_KEY', {
  locale: 'pt-BR'
});

// Criar instância do Card Form
const cardForm = mp.cardForm({
  amount: "100.00",
  iframe: true,
  form: {
    id: "checkout-form",
    cardNumber: {
      id: "card-number",
      placeholder: "Número do cartão",
    },
    expirationDate: {
      id: "card-expiry",
      placeholder: "MM/AA",
    },
    securityCode: {
      id: "card-cvv",
      placeholder: "CVV",
    },
    cardholderName: {
      id: "card-name",
      placeholder: "Nome no cartão",
    },
    issuer: {
      id: "card-issuer",
      placeholder: "Banco emissor",
    },
    installments: {
      id: "installments",
      placeholder: "Parcelas",
    },
    identificationType: {
      id: "docType",
      placeholder: "Tipo de documento",
    },
    identificationNumber: {
      id: "customer-cpf",
      placeholder: "CPF",
    },
    cardholderEmail: {
      id: "customer-email",
      placeholder: "E-mail",
    },
  },
  callbacks: {
    onFormMounted: error => {
      if (error) console.error("Erro ao montar formulário:", error);
      console.log("Formulário montado com sucesso");
    },
    onSubmit: event => {
      event.preventDefault();
      
      const {
        paymentMethodId: payment_method_id,
        issuerId: issuer_id,
        cardholderEmail: email,
        amount,
        token,
        installments,
        identificationNumber,
        identificationType,
      } = cardForm.getCardFormData();

      // Enviar token ao backend
      fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          payment_method_id,
          transaction_amount: Number(amount),
          installments: Number(installments),
          description: 'Curso vemgo',
          payer: {
            email,
            identification: {
              type: identificationType,
              number: identificationNumber,
            }
          }
        })
      });
    },
  },
});
</script>
```

### Etapa 2: Atualizar Backend

```typescript
// src/index.tsx - /api/sales
app.post('/api/sales', async (c) => {
  const { env } = c
  const { DB, MERCADOPAGO_ACCESS_TOKEN } = env
  
  const {
    token, // ← Token gerado pelo MP.js
    transaction_amount,
    description,
    installments,
    payment_method_id,
    payer
  } = await c.req.json()
  
  // Criar pagamento no Mercado Pago
  const paymentData = {
    transaction_amount,
    token, // ← Usar token ao invés de dados do cartão
    description,
    installments,
    payment_method_id,
    payer: {
      email: payer.email,
      identification: {
        type: payer.identification.type,
        number: payer.identification.number
      }
    }
  }
  
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      'X-Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify(paymentData)
  })
  
  const payment = await response.json()
  
  if (payment.status === 'approved') {
    // Registrar venda no banco
    // Enviar email de confirmação
    // Retornar sucesso
  }
})
```

### Etapa 3: Testar com Cartões de Teste

```bash
# 1. Configurar credenciais de teste
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name vemgo
# Cole o TEST-xxxx token

# 2. Fazer build e deploy
npm run build
npx wrangler pages deploy dist --project-name vemgo

# 3. Testar checkout
# Usar cartão: 5031 4332 1540 6351
# CVV: 123
# Validade: 11/25
# Nome: APRO
```

---

## 🔍 Debug e Logs

### Verificar Logs do Wrangler

```bash
# Local
pm2 logs vemgo --nostream

# Produção
npx wrangler pages deployment tail --project-name vemgo
```

### Logs Importantes

```
[TEST MODE] Simulando pagamento aprovado  ← Modo teste ativo
Payment approved: 296324                  ← ID do pagamento
Sale registered: 1                        ← ID da venda no banco
Access token: 8tcjo5okqx4pyjz0hmho8n     ← Token de acesso
```

---

## 📚 Referências

- **Documentação Oficial**: https://www.mercadopago.com.br/developers/pt/docs
- **SDK JavaScript**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing
- **Cartões de Teste**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards
- **API Reference**: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post

---

## ⚙️ Comandos Úteis

```bash
# Configurar credenciais (produção)
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name vemgo
npx wrangler pages secret put MERCADOPAGO_PUBLIC_KEY --project-name vemgo

# Listar secrets
npx wrangler pages secret list --project-name vemgo

# Build e deploy
npm run build
npx wrangler pages deploy dist --project-name vemgo

# Testar localmente
npm run dev:d1

# Verificar vendas no banco
npx wrangler d1 execute vemgo --local --command="SELECT * FROM sales"
```

---

## 🎯 Checklist de Produção

- [ ] Obter credenciais **reais** do Mercado Pago (não TEST)
- [ ] Configurar secrets no Cloudflare Pages
- [ ] Implementar tokenização no frontend
- [ ] Mudar `isTestMode = false` no backend
- [ ] Adicionar webhook endpoint
- [ ] Configurar domínio customizado
- [ ] Testar com cartões de teste
- [ ] Testar com cartão real (valor mínimo)
- [ ] Configurar email de confirmação
- [ ] Adicionar retry logic para falhas
- [ ] Implementar logs estruturados
- [ ] Documentar processo de suporte

---

## ✅ Status do Sistema

**Ambiente Atual**: 🧪 **SANDBOX (Teste)**

**Modo de Pagamento**: ✅ **Simulação Automática**
- Aceita qualquer cartão
- Aprova automaticamente
- Não chama API do Mercado Pago
- Ideal para desenvolvimento

**Para usar Mercado Pago real**:
1. Configure as credenciais (seção "Configuração Inicial")
2. Mude `isTestMode = false` no código
3. Implemente tokenização no frontend
4. Teste com cartões de teste
5. Deploy em produção

---

**Última Atualização**: 2026-03-13  
**Versão**: 1.0.0  
**Status**: 📝 Documentação Completa
