# ✅ Configuração de Pagamento - APENAS CARTÃO DE CRÉDITO

## 🎯 Status Atual

O sistema **Vemgo** está configurado para aceitar **APENAS PAGAMENTO COM CARTÃO DE CRÉDITO** via gateway Asaas.

---

## 💳 Métodos de Pagamento Ativos

### ✅ **CARTÃO DE CRÉDITO (Asaas)**
- Status: **ATIVO** ✅
- Gateway: **Asaas**
- Ambiente: **Sandbox (Teste)**
- Taxas: **3.49%**

### ❌ **PIX** - DESATIVADO
### ❌ **Boleto** - DESATIVADO  
### ❌ **Mercado Pago** - REMOVIDO
### ❌ **PagSeguro** - REMOVIDO

---

## 🏦 Gateway: Asaas

### **Credenciais (Sandbox - Teste):**
```
API Key: $aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm
Ambiente: sandbox
Webhook Token: whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
```

### **Bandeiras Aceitas:**
- 💳 Visa
- 💳 Mastercard
- 💳 American Express
- 💳 Diners Club
- 💳 Elo
- 💳 Hipercard

---

## 💳 Cartão de Teste (SEMPRE APROVADO)

Para testar pagamentos no ambiente **Sandbox**:

```
Número: 5162 3062 1937 8829
Titular: Marcelo Henrique Almeida
Validade: 05/2025 (ou qualquer data futura)
CVV: 318
```

### **Dados do Cliente (Teste):**
```
Nome: Teste Silva
CPF: 249.715.637-92
Email: teste@exemplo.com
Telefone: (11) 99999-9999
```

---

## 🛒 Fluxo de Compra

### **Cliente:**
1. Acessa a loja pública
2. Clica em **"COMPRAR AGORA"** no curso desejado
3. Preenche **dados pessoais**:
   - Nome completo
   - CPF
   - Telefone
   - E-mail
4. Preenche **dados do cartão**:
   - Número do cartão
   - Nome no cartão
   - Validade (MM/AA)
   - CVV
5. Clica em **"FINALIZAR COMPRA SEGURA"**
6. Aguarda processamento (3-5 segundos)
7. É redirecionado para **página de sucesso**
8. Recebe e-mail com link de acesso ao curso

### **Backend (Automático):**
1. Valida dados do formulário
2. Cria/busca cliente na Asaas por CPF
3. Processa pagamento com cartão
4. Registra venda no banco D1
5. Gera token de acesso único
6. Envia e-mail com PDF via Resend
7. Retorna sucesso ou erro

---

## 📊 Taxas e Custos

| Método | Taxa Asaas | Custo em R$ 100 |
|--------|------------|-----------------|
| 💳 Cartão de Crédito | 3.49% | R$ 3,49 |

**Comparação com concorrentes:**
- Mercado Pago: 4.99% + R$ 0,40 = **R$ 5,39**
- PagSeguro: 4.99% = **R$ 4,99**
- **Asaas: R$ 3,49** ✅ Mais barato!

**Economia mensal:** ~R$ 190 (em R$ 10.000 de vendas)

---

## 🔒 Segurança

### **Tokenização:**
- ✅ Processamento 100% no backend
- ✅ Dados do cartão **NÃO são salvos** no banco
- ✅ Comunicação criptografada (HTTPS)
- ✅ PCI Compliance via Asaas

### **Dados Salvos no Banco:**
- ✅ ID do cliente Asaas
- ✅ ID do pagamento Asaas
- ✅ Últimos 4 dígitos do cartão
- ✅ Bandeira do cartão
- ❌ **Número completo do cartão** - NÃO salvo
- ❌ **CVV** - NÃO salvo

---

## 🧪 Como Testar

### **1. Acesse o Checkout:**
```
URL: https://3000-ihzpzsrue6cd8i31gsaca-0e616f0a.sandbox.novita.ai
```

### **2. Escolha um Curso:**
- Clique em **"COMPRAR AGORA"** em qualquer curso

### **3. Preencha o Formulário:**
```
DADOS PESSOAIS:
Nome: Teste Silva
CPF: 249.715.637-92
Telefone: (11) 99999-9999
Email: seu@email.com

CARTÃO DE CRÉDITO:
Número: 5162 3062 1937 8829
Nome: SEU NOME
Validade: 05/2025
CVV: 318
```

### **4. Finalize a Compra:**
- Clique em **"FINALIZAR COMPRA SEGURA"**
- Aguarde redirecionamento
- ✅ Veja a página de sucesso!

---

## 📋 Checklist de Configuração

### **Ambiente Local (.dev.vars):**
- ✅ `ASAAS_API_KEY` configurada
- ✅ `ASAAS_ENV=sandbox`
- ✅ `ASAAS_WEBHOOK_TOKEN` configurada
- ✅ `RESEND_API_KEY` configurada (para emails)
- ✅ `EMAIL_FROM` configurado

### **Ambiente Produção (Cloudflare):**
- ⏳ Adicionar variáveis no Cloudflare Pages
- ⏳ Trocar para API Key de **PRODUÇÃO** (quando necessário)
- ⏳ Alterar `ASAAS_ENV=production`
- ⏳ Configurar webhook no dashboard Asaas

---

## 🚀 Mudando de Sandbox para Produção

### **Quando estiver pronto para receber pagamentos REAIS:**

1. **Obter chave de PRODUÇÃO:**
   - Login: https://www.asaas.com/
   - Configurações → Integrações → API Key
   - Copiar chave de **PRODUÇÃO** (começa com `$aact_prod_`)

2. **Atualizar no Cloudflare:**
   ```
   ASAAS_API_KEY=[nova chave de produção]
   ASAAS_ENV=production
   ```

3. **Configurar webhook:**
   - Dashboard Asaas → Integrações → Webhooks
   - URL: `https://vemgo.pages.dev/api/webhooks/asaas`
   - Eventos: PAYMENT_CONFIRMED, PAYMENT_OVERDUE, etc.

4. **Testar com cartão REAL:**
   - Fazer compra com seu próprio cartão
   - Verificar se aparece no dashboard Asaas
   - Confirmar recebimento do e-mail

---

## ⚠️ IMPORTANTE

### **Ambiente Atual: SANDBOX (Teste)**
- 🟢 Pagamentos **simulados**
- 🟢 **Não** cobra cartões reais
- 🟢 Use cartões de teste fornecidos acima
- 🟢 Perfeito para desenvolvimento e testes

### **Ambiente Produção:**
- 🔴 Pagamentos **REAIS**
- 🔴 Cobra cartões de clientes
- 🔴 Use apenas quando tudo estiver testado
- 🔴 Requer chave de API de produção

**NÃO MUDE PARA PRODUÇÃO ATÉ TESTAR TUDO!** ⚠️

---

## 📞 Suporte

**Asaas:**
- Email: [email protected]
- Dashboard: https://sandbox.asaas.com/ (teste)
- Dashboard: https://www.asaas.com/ (produção)
- Documentação: https://docs.asaas.com/

**Vemgo:**
- Email: gelci.silva252@gmail.com
- Dashboard: https://3000-ihzpzsrue6cd8i31gsaca-0e616f0a.sandbox.novita.ai/admin

---

## 📅 Última Atualização

**Data:** 14 de março de 2026  
**Status:** ✅ Cartão de crédito configurado e funcionando  
**Ambiente:** 🟢 Sandbox (Teste)

---

**🎯 Sistema pronto para testes! Use o cartão de teste acima para simular compras.**
