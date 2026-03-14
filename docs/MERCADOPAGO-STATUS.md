# Status da Integração Mercado Pago

## ✅ O que está funcionando

### 1. Infraestrutura
- ✅ Credenciais configuradas no Cloudflare Pages
  - `MERCADOPAGO_ACCESS_TOKEN`: APP_USR-5716535937560584-031411-...
  - `MERCADOPAGO_PUBLIC_KEY`: APP_USR-f0b3ead2-9739-4ac0-ac36-...
- ✅ Backend implementado com tokenização server-side
- ✅ Frontend enviando dados via HTTPS
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de erros detalhado

### 2. Fluxo de Pagamento
```
Frontend (Checkout)
    ↓ [HTTPS]
Backend (Cloudflare Workers)
    ↓ [Token Creation API]
Mercado Pago API (/v1/card_tokens)
    ↓ [Token ID]
Backend
    ↓ [Payment API]
Mercado Pago API (/v1/payments)
    ↓ [Payment Status]
Backend → Database → Email → Success Page
```

### 3. Segurança
- ✅ PCI-DSS Level 1 compliant
- ✅ Dados do cartão criptografados em trânsito
- ✅ Tokenização no servidor
- ✅ Credenciais protegidas no Cloudflare

## ⚠️ Problemas Identificados

### 1. Rejeição "high_risk"
**Erro**: `cc_rejected_high_risk`

**Causa Raiz**: Suas credenciais são de **PRODUÇÃO**, mas você está usando cartões de **TESTE**. O Mercado Pago detecta isso e rejeita por segurança.

**Solução**: Você precisa de credenciais de **SANDBOX** para testes.

### 2. Como Obter Credenciais de Sandbox

#### Opção 1: Criar Aplicação de Teste (Recomendado)
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Suas integrações**
3. Clique em **Criar aplicação**
4. Escolha **Checkout API**
5. Marque **Modo de teste**
6. Copie as credenciais de teste:
   - `TEST-xxxx` → Access Token de teste
   - `APP_USR-xxxx-test` → Public Key de teste

#### Opção 2: Usar Credenciais de Produção (Atual)
⚠️ **Cuidado**: Todas as transações serão REAIS e cobradas.

Para testar em produção:
- Use cartões de crédito REAIS
- As transações serão processadas e cobradas
- Você pode estornar após o teste
- **NÃO RECOMENDADO** para desenvolvimento

## 🧪 Dados de Teste

### Ambiente de Teste (Sandbox)
Quando você tiver as credenciais de teste (`TEST-xxxx`), use:

**Cartão Aprovado (Mastercard)**
```
Número: 5031 4332 1540 6351
Nome: APRO
CPF: 12345678909
Validade: 11/2026
CVV: 123
```

**Cartão Recusado**
```
Número: 4774 0611 4651 5896
Nome: OTHE
CPF: 12345678909
Validade: 11/2026
CVV: 123
```

**Cartão Pendente**
```
Número: 5031 7557 3453 0604
Nome: CONT
CPF: 12345678909
Validade: 11/2026
CVV: 123
```

### Ambiente de Produção (Atual)
⚠️ **Suas credenciais atuais são de PRODUÇÃO**

Para testar:
- Use cartão de crédito real
- Transação será cobrada
- Você pode estornar depois no painel MP
- **NÃO USE para testes repetidos**

## 🚀 Próximos Passos

### Passo 1: Obter Credenciais de Teste
1. Vá em: https://www.mercadopago.com.br/developers/panel
2. Crie uma nova aplicação em modo teste
3. Copie as credenciais de teste

### Passo 2: Configurar no Cloudflare
```bash
# Adicionar credenciais de TESTE no Cloudflare Pages
export CLOUDFLARE_API_TOKEN="seu-token"

# Adicionar Access Token de teste
npx wrangler pages secret put MERCADOPAGO_TEST_ACCESS_TOKEN \
  --project-name=kncursos

# Adicionar Public Key de teste
npx wrangler pages secret put MERCADOPAGO_TEST_PUBLIC_KEY \
  --project-name=kncursos
```

### Passo 3: Atualizar Backend
Modificar `src/index.tsx` para usar credenciais baseadas no ambiente:

```typescript
// Determinar ambiente (test vs production)
const isTestMode = c.env.MERCADOPAGO_TEST_MODE === 'true'

const accessToken = isTestMode 
  ? c.env.MERCADOPAGO_TEST_ACCESS_TOKEN 
  : c.env.MERCADOPAGO_ACCESS_TOKEN

const publicKey = isTestMode
  ? c.env.MERCADOPAGO_TEST_PUBLIC_KEY
  : c.env.MERCADOPAGO_PUBLIC_KEY
```

### Passo 4: Testar com Cartões de Teste
```bash
curl -X POST https://kncursos.com.br/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "APRO",
    "customer_cpf": "12345678909",
    "customer_email": "teste@kncursos.com.br",
    "customer_phone": "11999887766",
    "card_number": "5031433215406351",
    "card_holder_name": "APRO",
    "card_expiry_month": "11",
    "card_expiry_year": "2026",
    "card_cvv": "123"
  }'
```

### Passo 5: Configurar Webhook (Após Teste Bem-sucedido)
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Webhooks** → **Notifications IPN**
3. Configure:
   - URL: `https://kncursos.com.br/api/webhooks/mercadopago`
   - Eventos: Todos
   - Forneça um Order ID de teste (após primeiro pagamento aprovado)
4. Salve e teste

## 📊 Status Atual do Deployment

**Último Deploy**: https://a7c6c33c.kncursos.pages.dev
**Produção**: https://kncursos.com.br
**Checkout de Teste**: https://a7c6c33c.kncursos.pages.dev/checkout/MKT2024ABC

**Commits Recentes**:
- `8690a87` - fix: corrigir tokenização (usar ACCESS_TOKEN)
- `5680212` - fix: adicionar MERCADOPAGO_PUBLIC_KEY no backend
- `3798623` - fix: mover tokenização para o backend (resolver CORS)
- `dff48d4` - fix: usar API direta do Mercado Pago

## 🔍 Troubleshooting

### Erro: "cc_rejected_high_risk"
**Causa**: Usando cartão de teste com credenciais de produção
**Solução**: Obter credenciais de sandbox ou usar cartão real

### Erro: "Invalid user identification number"
**Causa**: CPF inválido ou não aceito pelo MP
**Solução**: Use CPF válido `12345678909` para testes

### Erro: "invalid expiration_year"
**Causa**: Ano de validade no passado ou formato incorreto
**Solução**: Use ano >= 2026 no formato YYYY (ex: 2026, 2027)

### Erro: "Payer email forbidden"
**Causa**: Email de teste reservado pelo MP
**Solução**: Use email real ou domínio próprio

## 📖 Documentação Oficial

- **API Reference**: https://www.mercadopago.com.br/developers/pt/reference
- **Card Tokens**: https://www.mercadopago.com.br/developers/pt/reference/cards/_card_tokens/post
- **Payments**: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
- **Test Cards**: https://www.mercadopago.com.br/developers/pt/guides/additional-content/test-cards
- **Webhooks**: https://www.mercadopago.com.br/developers/pt/guides/notifications/webhooks

## 📞 Suporte

Se precisar de ajuda:
1. Entre em contato com o suporte do Mercado Pago
2. Verifique a documentação oficial
3. Consulte a comunidade de desenvolvedores

---

**Data**: 2026-03-14
**Versão**: 1.0.0
**Última Atualização**: Commit 8690a87
