# 🔑 Como Obter Credenciais de Teste do Mercado Pago

## 📌 Por que preciso de credenciais de teste?

Suas credenciais atuais são de **PRODUÇÃO**:
- ✅ Funcionam perfeitamente
- ⚠️ Mas não aceitam cartões de teste
- 💳 Só aceitam cartões reais (e cobram!)

Para testar sem gastar dinheiro real, você precisa de credenciais de **TESTE**.

---

## 🚀 Passo a Passo (5 minutos)

### 1️⃣ Acesse o Painel de Desenvolvedores

🔗 https://www.mercadopago.com.br/developers/panel

![Painel do Mercado Pago](https://via.placeholder.com/800x400/4285f4/ffffff?text=Painel+de+Desenvolvedores)

---

### 2️⃣ Vá em "Suas Integrações"

No menu lateral esquerdo:
- Clique em **"Suas integrações"**
- Depois em **"Criar aplicação"**

![Criar Aplicação](https://via.placeholder.com/800x400/34a853/ffffff?text=Suas+Integra%C3%A7%C3%B5es+%E2%86%92+Criar+Aplica%C3%A7%C3%A3o)

---

### 3️⃣ Configure a Aplicação

Preencha os campos:

1. **Nome da aplicação**: `KNCursos - Testes`
2. **Selecione o produto**: `Checkout API`
3. **Modelo de integração**: `Online`
4. ✅ Marque: **"Modo de teste"** ou **"Sandbox"**

![Configurar App](https://via.placeholder.com/800x400/fbbc04/ffffff?text=Configure+Aplica%C3%A7%C3%A3o+em+Modo+Teste)

---

### 4️⃣ Copie as Credenciais de Teste

Após criar a aplicação, você verá:

```
🔑 Credenciais de Teste
────────────────────────────────────────────

Access Token (Teste):
TEST-1234567890123456-031415-abcdef1234567890abcdef1234567890-123456789

Public Key (Teste):
APP_USR-12345678-abcd-1234-abcd-1234567890ab-test
```

⚠️ **IMPORTANTE**: As credenciais de teste começam com `TEST-` ou terminam com `-test`

---

### 5️⃣ Adicione no Cloudflare Pages

Agora você precisa adicionar essas credenciais no Cloudflare:

#### Opção A: Via Dashboard Web (Mais Fácil)

1. Acesse: https://dash.cloudflare.com
2. Vá em **Pages** → **kncursos**
3. Clique em **Settings** → **Environment variables**
4. Clique em **Add variable**
5. Adicione as 3 variáveis:

```
Nome: MERCADOPAGO_TEST_ACCESS_TOKEN
Valor: TEST-1234567890123456-031415-abcd... (o seu)
Environment: Production

Nome: MERCADOPAGO_TEST_PUBLIC_KEY
Valor: APP_USR-12345678-abcd-1234-abcd-... (o seu)
Environment: Production

Nome: MERCADOPAGO_TEST_MODE
Valor: true
Environment: Production
```

6. Salve e faça um novo deploy

#### Opção B: Via CLI (Mais Rápido)

```bash
# Configurar Access Token de Teste
npx wrangler pages secret put MERCADOPAGO_TEST_ACCESS_TOKEN \
  --project-name=kncursos
# Cole o valor: TEST-1234567890123456-...

# Configurar Public Key de Teste
npx wrangler pages secret put MERCADOPAGO_TEST_PUBLIC_KEY \
  --project-name=kncursos
# Cole o valor: APP_USR-12345678-abcd-...

# Ativar modo de teste
npx wrangler pages secret put MERCADOPAGO_TEST_MODE \
  --project-name=kncursos
# Digite: true
```

---

### 6️⃣ Atualize o Código (Backend)

Edite `src/index.tsx` na rota `/api/sales`:

```typescript
// Adicione no início da rota
const isTestMode = c.env.MERCADOPAGO_TEST_MODE === 'true'

const accessToken = isTestMode 
  ? c.env.MERCADOPAGO_TEST_ACCESS_TOKEN 
  : c.env.MERCADOPAGO_ACCESS_TOKEN

const publicKey = isTestMode
  ? c.env.MERCADOPAGO_TEST_PUBLIC_KEY
  : c.env.MERCADOPAGO_PUBLIC_KEY

// Use accessToken e publicKey nas chamadas à API do MP
```

---

### 7️⃣ Faça Build e Deploy

```bash
cd /home/user/webapp

# Build
npm run build

# Deploy
export CLOUDFLARE_API_TOKEN="3XVV83kDwH6VAfHfn3iBG07He24veho5ENuzj2ld"
npx wrangler pages deploy dist --project-name=kncursos
```

---

### 8️⃣ Teste com Cartão de Teste

Agora use os cartões de teste oficiais do Mercado Pago:

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

**Resultado Esperado**:
```json
{
  "success": true,
  "message": "Pagamento aprovado com sucesso!",
  "payment_id": "1234567890",
  "status": "approved",
  "access_token": "abc123xyz..."
}
```

---

## 🎯 Checklist Final

Antes de considerar concluído, verifique:

- [ ] ✅ Credenciais de teste obtidas no painel MP
- [ ] ✅ Credenciais adicionadas no Cloudflare Pages
- [ ] ✅ Código atualizado para usar modo teste
- [ ] ✅ Build e deploy realizados
- [ ] ✅ Teste com cartão aprovado (5031 4332 1540 6351)
- [ ] ✅ Teste com cartão recusado (4774 0611 4651 5896)
- [ ] ✅ Email de confirmação recebido
- [ ] ✅ Venda registrada no banco D1
- [ ] ✅ Order ID gerado para webhook
- [ ] ✅ Webhook configurado no painel MP
- [ ] ✅ Teste de produção com cartão real (opcional)

---

## 🆘 Problemas Comuns

### ❌ "cc_rejected_high_risk"
**Causa**: Ainda usando credenciais de produção
**Solução**: Verifique se `MERCADOPAGO_TEST_MODE=true`

### ❌ "Invalid credentials"
**Causa**: Credenciais erradas ou não configuradas
**Solução**: Verifique no Cloudflare se as variáveis estão corretas

### ❌ "Payer email forbidden"
**Causa**: Email de teste reservado
**Solução**: Use email do seu domínio (@kncursos.com.br)

### ❌ "Invalid user identification number"
**Causa**: CPF inválido
**Solução**: Use CPF válido: `12345678909` (é um CPF de teste válido)

---

## 📚 Links Úteis

- 🏠 **Painel**: https://www.mercadopago.com.br/developers/panel
- 📖 **Docs**: https://www.mercadopago.com.br/developers/pt/docs
- 💳 **Test Cards**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards
- 🔔 **Webhooks**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/notifications/webhooks
- 💬 **Suporte**: developers@mercadopago.com

---

## ✨ Resultado Final

Após seguir todos os passos:

1. ✅ Sistema testável sem gastar dinheiro
2. ✅ Ambiente de produção preservado e seguro
3. ✅ Pode testar aprovações, recusas e pendências
4. ✅ Pronto para homologação e produção

---

**Data**: 2026-03-14  
**Versão**: 1.0.0  
**Última Atualização**: Commit b5f992b
