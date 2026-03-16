# 🧪 Testar Pagamento Asaas no Ambiente SANDBOX

## ⚠️ IMPORTANTE: ESTAMOS EM SANDBOX (TESTE)

O sistema está configurado para usar o ambiente de **TESTE (SANDBOX)** da Asaas, não produção.

---

## 🔴 Problema Atual

Erro retornado:
```json
{
  "errors": [
    {
      "code": "invalid_access_token",
      "description": "A chave de API fornecida é inválida"
    }
  ]
}
```

**Causa:** As variáveis de ambiente **NÃO estão configuradas** no Cloudflare Pages em produção.

---

## ✅ SOLUÇÃO RÁPIDA

### 1️⃣ **Confirmar Chave de API Sandbox**

A chave atual no `.dev.vars` é:
```
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm
```

**Verificar se essa chave é válida:**
1. Acesse: https://www.asaas.com/
2. Faça login na sua conta **SANDBOX/HOMOLOGAÇÃO**
3. Vá em **Configurações** → **Integrações** → **API Key**
4. Copie a chave de **HOMOLOGAÇÃO** (não de produção)

### 2️⃣ **Configurar no Cloudflare Pages**

#### Acesse o Dashboard:
https://dash.cloudflare.com/ → **Workers & Pages** → **vemgo** → **Settings** → **Environment variables**

#### Adicione as 3 variáveis essenciais para SANDBOX:

**VARIÁVEL 1: ASAAS_API_KEY**
```
Variable name: ASAAS_API_KEY
Value: [COLE A CHAVE DE SANDBOX DA SUA CONTA ASAAS]
Environment: Production
Encrypt: ✅ SIM (marque como secreta)
```

**VARIÁVEL 2: ASAAS_ENV**
```
Variable name: ASAAS_ENV
Value: sandbox
Environment: Production
Encrypt: ❌ NÃO
```

**VARIÁVEL 3: ASAAS_WEBHOOK_TOKEN**
```
Variable name: ASAAS_WEBHOOK_TOKEN
Value: whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
Environment: Production
Encrypt: ✅ SIM
```

#### Outras variáveis necessárias (para email e admin):

**RESEND_API_KEY**
```
Variable name: RESEND_API_KEY
Value: re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
Environment: Production
Encrypt: ✅ SIM
```

**EMAIL_FROM**
```
Variable name: EMAIL_FROM
Value: cursos@vemgo.com.br
Environment: Production
Encrypt: ❌ NÃO
```

**RESEND_WEBHOOK_SECRET**
```
Variable name: RESEND_WEBHOOK_SECRET
Value: whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t
Environment: Production
Encrypt: ✅ SIM
```

**ADMIN_USERNAME**
```
Variable name: ADMIN_USERNAME
Value: admin
Environment: Production
Encrypt: ❌ NÃO
```

**ADMIN_PASSWORD**
```
Variable name: ADMIN_PASSWORD
Value: vemgo2024
Environment: Production
Encrypt: ✅ SIM
```

**JWT_SECRET**
```
Variable name: JWT_SECRET
Value: vemgo-jwt-secret-change-in-production-2024
Environment: Production
Encrypt: ✅ SIM
```

### 3️⃣ **Salvar e Aguardar**

Após adicionar todas as variáveis:
- Clique em **Save**
- Aguarde 1-2 minutos para propagação
- **NÃO precisa fazer novo deploy** (as variáveis são aplicadas automaticamente)

---

## 🧪 Testar Após Configurar

### 1. **Acesse o Checkout:**
```
https://vemgo.pages.dev/checkout/DEV2024XYZ
```

### 2. **Preencha com Dados de TESTE Asaas:**

**Dados do Cliente:**
- Nome: `Teste Silva`
- CPF: `249.715.637-92` (CPF válido para teste)
- Email: `seu@email.com`
- Telefone: `(11) 99999-9999`

**Dados do Cartão de TESTE Asaas (Sandbox):**
- Número: `5162 3062 1937 8829`
- Nome no cartão: `SEU NOME`
- Validade: `05/2026` (qualquer data futura)
- CVV: `318`

### 3. **Clique em "Finalizar Compra"**

**Resultado Esperado:**
- ✅ Pagamento aprovado
- ✅ Redirecionamento para página de sucesso
- ✅ Email enviado com link de download
- ✅ Status: "Pagamento aprovado!"

---

## 🔍 Como Verificar se Funcionou

### No Console do Navegador (F12):
Você deve ver:
```
[ASAAS] Processando pagamento...
[ASAAS] Criando cliente...
[ASAAS] Cliente criado com sucesso! ID: cus_...
[ASAAS] Processando pagamento com cartão...
[ASAAS] Pagamento criado! ID: pay_...
```

### Na Tela:
- Redirecionamento automático para: `https://vemgo.pages.dev/success/[TOKEN]`
- Mensagem: "Pagamento aprovado!"
- Botão de download do PDF

---

## 🆘 Se o Erro Persistir

### Verificar no Painel Asaas:
1. Acesse: https://www.asaas.com/
2. Vá em **Configurações** → **Integrações** → **API Key**
3. Certifique-se de estar na aba **HOMOLOGAÇÃO** (não Produção)
4. Copie a chave correta
5. Atualize no Cloudflare

### Verificar no Console do Cloudflare:
1. Acesse: https://dash.cloudflare.com/
2. Workers & Pages → vemgo → Settings → Environment variables
3. Confirme que `ASAAS_API_KEY` está configurada
4. Confirme que `ASAAS_ENV` = `sandbox`

### Testar Localmente Primeiro:
```bash
cd /home/user/webapp
npm run build
pm2 restart vemgo

# Testar com curl
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "DEV2024XYZ",
    "customer_name": "Teste Silva",
    "customer_cpf": "24971563792",
    "customer_email": "teste@exemplo.com",
    "customer_phone": "11999999999",
    "card_number": "5162306219378829",
    "card_holder_name": "TESTE SILVA",
    "card_expiry_month": "05",
    "card_expiry_year": "2026",
    "card_cvv": "318"
  }'
```

---

## 📊 Diferenças: Sandbox vs Produção

| Aspecto | SANDBOX (Teste) | PRODUÇÃO (Real) |
|---------|-----------------|-----------------|
| **Ambiente** | `ASAAS_ENV=sandbox` | `ASAAS_ENV=production` |
| **Chave API** | Começa com `$aact_hmlg_` | Começa com `$aact_prod_` |
| **Pagamentos** | Simulados, sem cobrança real | Cobranças reais em cartões |
| **Cartões** | Cartões de teste (5162...) | Cartões reais de clientes |
| **URL Base** | `sandbox.asaas.com` | `www.asaas.com` |
| **Objetivo** | Testar integração | Receber pagamentos reais |

---

## ✅ Checklist Completo

- [ ] Acessar painel Asaas (https://www.asaas.com/)
- [ ] Ir em Configurações → Integrações → API Key
- [ ] Copiar chave de **HOMOLOGAÇÃO** (sandbox)
- [ ] Acessar Cloudflare Dashboard
- [ ] Adicionar `ASAAS_API_KEY` com a chave copiada
- [ ] Adicionar `ASAAS_ENV=sandbox`
- [ ] Adicionar as outras 7 variáveis de ambiente
- [ ] Salvar todas as variáveis
- [ ] Aguardar 1-2 minutos
- [ ] Testar checkout com dados de teste
- [ ] Verificar console do navegador (F12)
- [ ] Confirmar redirecionamento para página de sucesso

---

## 🎯 Resumo

**Problema:** Chave de API não está no Cloudflare Pages  
**Solução:** Adicionar as 9 variáveis de ambiente no Dashboard  
**Ambiente:** SANDBOX (teste, sem cobranças reais)  
**Após configurar:** Teste imediatamente com cartão `5162 3062 1937 8829`

---

**🚀 Depois de configurar as variáveis, me avise e validaremos juntos!**
