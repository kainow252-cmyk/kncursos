# 🔧 COMO CONFIGURAR PAGAMENTOS REAIS NO MERCADO PAGO

**Data:** 14/03/2026  
**Status Atual:** 🧪 MODO TESTE (Sandbox)  
**Objetivo:** 💳 MODO PRODUÇÃO (Pagamentos Reais)

---

## 📋 STATUS ATUAL DO SISTEMA

O sistema está **configurado corretamente** e **100% funcional**, mas está usando as credenciais de **TESTE (Sandbox)** do Mercado Pago.

### ✅ O que está funcionando:
- ✅ Integração com Mercado Pago
- ✅ Processamento de pagamentos
- ✅ Salvamento de dados do cartão
- ✅ Envio de emails
- ✅ Links protegidos
- ✅ Cronjob de sincronização
- ✅ Webhook

### 🧪 Modo Atual: TESTE
- Usa credenciais de sandbox (teste)
- Pagamentos não são cobrados de verdade
- Usa cartões de teste (APRO, OTHE, etc.)

---

## 🎯 COMO MUDAR PARA PAGAMENTOS REAIS

O sistema usa a variável de ambiente `MERCADOPAGO_TEST_MODE` para determinar o modo:

```javascript
// Linha 2197 do src/index.tsx
const isTestMode = MERCADOPAGO_TEST_MODE === 'true'
const accessToken = isTestMode ? MERCADOPAGO_TEST_ACCESS_TOKEN : MERCADOPAGO_ACCESS_TOKEN
const publicKey = isTestMode ? MERCADOPAGO_TEST_PUBLIC_KEY : MERCADOPAGO_PUBLIC_KEY
```

### 📊 Lógica do Sistema:

| Variável | Valor | Modo | Credenciais Usadas |
|----------|-------|------|-------------------|
| `MERCADOPAGO_TEST_MODE` | `"true"` | 🧪 TESTE | `MERCADOPAGO_TEST_ACCESS_TOKEN` |
| `MERCADOPAGO_TEST_MODE` | `"false"` ou não definida | 💳 PRODUÇÃO | `MERCADOPAGO_ACCESS_TOKEN` |

---

## 🚀 PASSO A PASSO PARA ATIVAR PAGAMENTOS REAIS

### 1️⃣ Obter Credenciais de PRODUÇÃO do Mercado Pago

Acesse sua conta no Mercado Pago:

1. Entre em: https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas integrações"** → **"Criar aplicação"** (se ainda não tiver)
3. Clique na sua aplicação
4. Vá em **"Credenciais de produção"**
5. Copie as seguintes credenciais:
   - **Access Token de Produção** (começa com `APP_USR-...`)
   - **Public Key de Produção** (começa com `APP_USR-...`)

**⚠️ IMPORTANTE:** As credenciais de PRODUÇÃO são diferentes das de TESTE!

---

### 2️⃣ Configurar Variáveis de Ambiente no Cloudflare Pages

Acesse o painel do Cloudflare Pages:

**URL:** https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/vemgo/settings/environment-variables

#### Opção A: Usar APENAS PRODUÇÃO (Recomendado)

Configure estas 3 variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-xxxxx` | Token de PRODUÇÃO |
| `MERCADOPAGO_PUBLIC_KEY` | `APP_USR-xxxxx` | Public Key de PRODUÇÃO |
| `MERCADOPAGO_TEST_MODE` | `false` | Ativa modo PRODUÇÃO |

**Resultado:** Sistema usará apenas credenciais de PRODUÇÃO ✅

---

#### Opção B: Ter TESTE e PRODUÇÃO (Flexível)

Configure estas 5 variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-xxxxx` | Token de PRODUÇÃO |
| `MERCADOPAGO_PUBLIC_KEY` | `APP_USR-xxxxx` | Public Key de PRODUÇÃO |
| `MERCADOPAGO_TEST_ACCESS_TOKEN` | `TEST-xxxxx` | Token de TESTE |
| `MERCADOPAGO_TEST_PUBLIC_KEY` | `TEST-xxxxx` | Public Key de TESTE |
| `MERCADOPAGO_TEST_MODE` | `false` | Controla o modo |

**Vantagem:** Você pode alternar entre TESTE e PRODUÇÃO mudando apenas `MERCADOPAGO_TEST_MODE`

- `MERCADOPAGO_TEST_MODE=true` → Usa credenciais de TESTE
- `MERCADOPAGO_TEST_MODE=false` → Usa credenciais de PRODUÇÃO

---

### 3️⃣ Adicionar as Variáveis no Cloudflare

**Pelo Dashboard:**

1. Acesse: https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/vemgo/settings/environment-variables
2. Clique em **"Add variable"**
3. Adicione cada variável:
   - **Variable name:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** Cole o token de produção
   - **Environment:** Production
   - Clique em **"Save"**
4. Repita para todas as variáveis
5. Clique em **"Deploy"** para aplicar as mudanças

**Ou via CLI (Wrangler):**

```bash
cd /home/user/webapp

# Adicionar Access Token de PRODUÇÃO
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name=vemgo

# Adicionar Public Key de PRODUÇÃO
npx wrangler pages secret put MERCADOPAGO_PUBLIC_KEY --project-name=vemgo

# Definir modo como PRODUÇÃO
npx wrangler pages secret put MERCADOPAGO_TEST_MODE --project-name=vemgo
# Digite: false
```

---

### 4️⃣ Fazer um Novo Deploy

Depois de configurar as variáveis, faça um novo deploy:

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name=vemgo
```

Ou simplesmente faça um commit e push (o Cloudflare Pages faz deploy automático):

```bash
git commit --allow-empty -m "chore: ativar modo de produção Mercado Pago"
git push origin main
```

---

### 5️⃣ Verificar se está em Modo Produção

Faça um teste de pagamento e verifique os logs:

```bash
# Acesse os logs no Cloudflare Pages
# Você deve ver:
# [MERCADOPAGO] 🔧 Modo: 💳 PRODUÇÃO
```

Ou teste via API:

```bash
curl -X POST https://vemgo.com.br/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "Teste Real",
    "customer_cpf": "seu-cpf-aqui",
    "customer_email": "seu-email@example.com",
    "customer_phone": "(11) 99999-9999",
    "card_number": "5031 4332 1540 6351",
    "card_holder_name": "SEU NOME",
    "card_expiry_month": "11",
    "card_expiry_year": "2030",
    "card_cvv": "123",
    "installments": 1
  }'
```

⚠️ **ATENÇÃO:** No modo PRODUÇÃO, use um cartão de crédito REAL (o pagamento será cobrado de verdade!)

---

## 🧪 TESTANDO ANTES DE ATIVAR PRODUÇÃO

Se você quiser testar o sistema antes de ativar pagamentos reais, mantenha `MERCADOPAGO_TEST_MODE=true` e use os cartões de teste:

### Cartões de Teste do Mercado Pago:

#### ✅ Aprovado (APRO)
```
Número:   5031 4332 1540 6351
Titular:  APRO
Validade: 11/30
CVV:      123
CPF:      191.191.191-00
```

#### ❌ Recusado (OTHE)
```
Número:   5474 9254 3267 0366
Titular:  OTHE
Validade: 11/30
CVV:      123
CPF:      191.191.191-00
```

Mais cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards

---

## 🔐 CONFIGURAR WEBHOOK NO MERCADO PAGO

Para que o sistema receba notificações automáticas de pagamento aprovado/recusado:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Clique na sua aplicação
3. Vá em **"Webhooks"**
4. Adicione a URL:
   ```
   https://vemgo.com.br/api/webhooks/mercadopago
   ```
5. Selecione os eventos:
   - ✅ `payment.created`
   - ✅ `payment.updated`
6. Clique em **"Salvar"**

---

## ✅ CHECKLIST DE ATIVAÇÃO

Antes de ativar pagamentos reais, verifique:

- [ ] Obtive as credenciais de **PRODUÇÃO** do Mercado Pago
- [ ] Configurei `MERCADOPAGO_ACCESS_TOKEN` no Cloudflare Pages
- [ ] Configurei `MERCADOPAGO_PUBLIC_KEY` no Cloudflare Pages
- [ ] Configurei `MERCADOPAGO_TEST_MODE=false` no Cloudflare Pages
- [ ] Fiz um novo deploy
- [ ] Verifiquei os logs (deve aparecer "💳 PRODUÇÃO")
- [ ] Configurei o webhook no painel do Mercado Pago
- [ ] Testei com um cartão real em ambiente controlado
- [ ] Confirmei que o email de confirmação está sendo enviado
- [ ] Verifiquei que os dados estão sendo salvos no banco

---

## 🛡️ SEGURANÇA

### ⚠️ NÃO COMITAR CREDENCIAIS NO GIT

**NUNCA** adicione as credenciais de produção no código ou arquivos `.env`:

```bash
# ❌ NÃO FAZER:
echo "MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx" > .env
git add .env
git commit -m "adicionar credenciais"  # ERRADO!

# ✅ FAZER:
# Use o painel do Cloudflare Pages ou wrangler CLI
npx wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN
```

As credenciais devem estar **APENAS** no Cloudflare Pages (variáveis de ambiente).

---

## 📊 DIFERENÇAS: TESTE vs PRODUÇÃO

| Aspecto | 🧪 TESTE | 💳 PRODUÇÃO |
|---------|---------|------------|
| Credenciais | TEST-xxxx | APP_USR-xxxx |
| Cartões | Cartões de teste (APRO, OTHE) | Cartões reais |
| Cobrança | Simulada (não cobra) | Real (cobra o cliente) |
| Webhook | Opcional | **Obrigatório** |
| Logs | `[MERCADOPAGO] 🔧 Modo: 🧪 TESTE` | `[MERCADOPAGO] 🔧 Modo: 💳 PRODUÇÃO` |

---

## 🆘 PROBLEMAS COMUNS

### Problema 1: Pagamento rejeitado em produção
**Causa:** Cartão inválido ou sem saldo  
**Solução:** Use um cartão real válido com saldo

### Problema 2: Ainda aparece "Modo: 🧪 TESTE"
**Causa:** `MERCADOPAGO_TEST_MODE` está como `"true"`  
**Solução:** Altere para `"false"` no Cloudflare Pages

### Problema 3: Erro "Access token inválido"
**Causa:** Credenciais de teste sendo usadas em produção  
**Solução:** Verifique se configurou `MERCADOPAGO_ACCESS_TOKEN` de produção

### Problema 4: Webhook não está funcionando
**Causa:** URL não configurada no Mercado Pago  
**Solução:** Configure `https://vemgo.com.br/api/webhooks/mercadopago` no painel

---

## 📞 CONTATO E SUPORTE

- **Documentação Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs
- **Suporte Mercado Pago:** https://www.mercadopago.com.br/developers/pt/support
- **Dashboard Cloudflare:** https://dash.cloudflare.com/

---

## 🎯 RESUMO RÁPIDO

**Para ativar pagamentos REAIS:**

1. Pegue as credenciais de PRODUÇÃO no Mercado Pago
2. Configure no Cloudflare Pages:
   - `MERCADOPAGO_ACCESS_TOKEN` = token de produção
   - `MERCADOPAGO_PUBLIC_KEY` = public key de produção
   - `MERCADOPAGO_TEST_MODE` = `false`
3. Faça deploy
4. Configure webhook no Mercado Pago
5. Teste com cartão real

**Status Atual:** 🧪 TESTE  
**Próximo Passo:** Configurar credenciais de PRODUÇÃO no Cloudflare Pages

---

**Documentação criada em:** 14/03/2026  
**Última atualização:** 14/03/2026  
**Versão do sistema:** 1.0.0
