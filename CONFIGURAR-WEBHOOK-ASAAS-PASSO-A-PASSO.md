# 🔔 Configurar Webhook Asaas - Guia Completo

## 🎯 Objetivo
Configurar o webhook do Asaas para receber notificações de pagamentos em tempo real.

---

## ⚡ Dados para Configuração

**Copie estes dados - você vai precisar:**

```
URL do Webhook:
https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas

Token de Autenticação:
whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms

Nome:
KN Cursos - Notificações de Pagamento
```

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Painel Asaas

1. Abra: https://www.asaas.com
2. Faça login com suas credenciais
3. Você verá o **Dashboard principal**

### 2️⃣ Ir para Webhooks

**Opção A (Menu lateral):**
```
Menu lateral → Integrações → Webhooks
```

**Opção B (Configurações):**
```
Menu lateral → Configurações → Webhooks
```

**Opção C (Busca):**
```
🔍 Digite "webhook" na barra de pesquisa
Clique em "Webhooks"
```

### 3️⃣ Verificar Webhooks Existentes

Você verá uma lista de webhooks. Procure por:
```
Nome: "KN Cursos - Notificações"
Status: ⚠️ Com Erro / ❌ Inativo
```

**Se encontrar:**
- ✅ Vá para: **"Passo 4 - Editar Webhook"**

**Se NÃO encontrar:**
- ✅ Vá para: **"Passo 5 - Criar Novo Webhook"**

### 4️⃣ Editar Webhook Existente

1. Clique no **ícone de editar** (✏️) ao lado do webhook
2. Você verá um formulário
3. **Verifique/Atualize os campos:**

**Campo "Nome":**
```
KN Cursos - Notificações de Pagamento
```

**Campo "URL":**
```
https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas
```
⚠️ **Copie e cole exatamente como está acima!**

**Campo "Status":**
```
☑️ Ativo
```

**Campo "Token de Autenticação" ou "Authentication Token":**
```
whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms
```
⚠️ **Copie e cole exatamente como está acima!**

4. **Role para baixo** e veja a lista de **"Eventos"**
5. Marque **TODOS** os eventos de pagamento:
   - [x] PAYMENT_CREATED
   - [x] PAYMENT_CONFIRMED ⭐
   - [x] PAYMENT_RECEIVED ⭐
   - [x] PAYMENT_OVERDUE
   - [x] PAYMENT_REFUNDED
   - [x] PAYMENT_DELETED
   - [x] PAYMENT_UPDATED
   - [x] (E todos os outros disponíveis)

6. Clique em **"Salvar"** ou **"Atualizar"**

7. ✅ Deve aparecer: **"Webhook atualizado com sucesso!"**

8. Vá para: **"Passo 6 - Testar Webhook"**

---

### 5️⃣ Criar Novo Webhook

1. Clique no botão **"Adicionar Webhook"** ou **"Novo Webhook"**
2. Preencha o formulário:

**Campo "Nome":**
```
KN Cursos - Notificações de Pagamento
```

**Campo "URL":**
```
https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas
```

**Campo "Status":**
```
☑️ Ativo
```

**Campo "Token de Autenticação":**
```
whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms
```

**Eventos (marque TODOS):**
- [x] PAYMENT_CREATED
- [x] PAYMENT_AWAITING_RISK_ANALYSIS
- [x] PAYMENT_APPROVED_BY_RISK_ANALYSIS
- [x] PAYMENT_REPROVED_BY_RISK_ANALYSIS
- [x] PAYMENT_CONFIRMED ⭐ (MAIS IMPORTANTE)
- [x] PAYMENT_RECEIVED ⭐ (MAIS IMPORTANTE)
- [x] PAYMENT_OVERDUE
- [x] PAYMENT_REFUNDED
- [x] PAYMENT_REFUND_IN_PROGRESS
- [x] PAYMENT_RECEIVED_IN_CASH
- [x] PAYMENT_ANTICIPATED
- [x] PAYMENT_DELETED
- [x] PAYMENT_RESTORED
- [x] PAYMENT_UPDATED
- [x] PAYMENT_CHARGEBACK_REQUESTED
- [x] PAYMENT_CHARGEBACK_DISPUTE
- [x] PAYMENT_AWAITING_CHARGEBACK_REVERSAL
- [x] PAYMENT_DUNNING_RECEIVED
- [x] PAYMENT_DUNNING_REQUESTED

3. Clique em **"Salvar"** ou **"Criar"**

4. ✅ Deve aparecer: **"Webhook criado com sucesso!"**

---

### 6️⃣ Testar o Webhook

1. Na lista de webhooks, encontre o que você acabou de criar/editar
2. Clique no botão **"Enviar Teste"** ou **"Testar"**
3. Aguarde alguns segundos...
4. ✅ Deve aparecer: **"Teste enviado com sucesso!"**
5. O status deve mudar para: ✅ **"Sincronizado"** ou ✅ **"Ativo"**

**Se aparecer erro:**
- Verifique se a URL está **exatamente** como mostrado
- Verifique se o token está **exatamente** como mostrado
- Certifique-se que está marcado como **"Ativo"**
- Tente novamente

---

## ✅ Validação Final

### Teste 1: Webhook funcionando no painel

No painel Asaas, você deve ver:
```
Nome: KN Cursos - Notificações de Pagamento
URL: https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas
Status: ✅ Sincronizado / ✅ Ativo
Última sincronização: [data/hora recente]
```

### Teste 2: Fazer uma compra de teste

1. Acesse: https://b002e9f3.kncursos.pages.dev
2. Escolha qualquer curso
3. Preencha os dados:
   - Nome: Seu nome
   - CPF: 123.456.789-00
   - Email: seu@email.com
   - Telefone: (11) 99999-9999
   
4. **Use o cartão de teste Asaas:**
   ```
   Número: 5162 3062 1937 8829
   Titular: MARCELO H ALMEIDA
   Validade: 05/2025
   CVV: 318
   ```

5. Clique em **"FINALIZAR COMPRA SEGURA"**

6. ✅ Deve aparecer: **"Pagamento aprovado! Verifique seu email"**

7. Verifique seu email - deve chegar em alguns segundos

8. No painel Asaas:
   - Vá em **"Cobranças"** ou **"Vendas"**
   - Você verá a venda de teste
   - Status: **"Confirmado"** ✅

---

## 🔧 Troubleshooting

### Problema: "Erro ao enviar teste"

**Soluções:**
1. Verifique se a URL está **exatamente** assim:
   ```
   https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas
   ```
   ⚠️ Não pode ter espaços antes ou depois!

2. Verifique se o token está correto:
   ```
   whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms
   ```

3. Certifique-se que está marcado como **"Ativo"**

4. Tente **desativar e reativar** o webhook

5. Se não funcionar, **delete** e crie um novo

### Problema: "Webhook inativo"

**Solução:**
1. Edite o webhook
2. Marque a opção **"Ativo"**
3. Salve
4. Teste novamente

### Problema: "Eventos não estão sendo recebidos"

**Verifique:**
1. Status do webhook está **"Ativo"** ✅
2. Todos os eventos estão **marcados** ✅
3. A URL está **correta** ✅
4. O token está **correto** ✅

**Teste manualmente:**
```bash
curl -X POST https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas \
  -H "asaas-access-token: whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms" \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CONFIRMED","payment":{"id":"test"}}'
```

Se retornar `{"received":true,"event":"PAYMENT_CONFIRMED"}`, o webhook está funcionando!

---

## 📊 O que o Webhook Faz?

Quando você configura o webhook, o Asaas envia notificações em tempo real sobre:

### Eventos de Pagamento:
- 💳 **Pagamento criado** → Sistema registra a tentativa
- ⏳ **Aguardando análise** → Sistema aguarda confirmação
- ✅ **Pagamento confirmado** → Sistema marca como "pago"
- 📧 **Envia email** → Cliente recebe acesso ao curso
- ⏰ **Pagamento vencido** → Sistema marca como "vencido"
- 💰 **Estorno solicitado** → Sistema marca como "estornado"

### Benefícios:
- ✅ Atualização **instantânea** de status
- ✅ Cliente recebe acesso **imediatamente**
- ✅ Você vê vendas em **tempo real**
- ✅ Relatórios sempre **atualizados**

---

## 📞 Precisa de Ajuda?

### Suporte Asaas
- **Email:** suporte@asaas.com
- **Telefone:** (47) 3433-2909
- **Chat:** Disponível no painel
- **Horário:** Segunda a sexta, 8h às 18h

### Documentação Oficial
- **Webhooks:** https://docs.asaas.com/reference/webhooks
- **API:** https://docs.asaas.com

---

## ✅ Checklist Final

- [ ] Acessei o painel Asaas
- [ ] Fui em Integrações → Webhooks
- [ ] Editei/Criei webhook com nome "KN Cursos - Notificações"
- [ ] Configurei URL: `https://b002e9f3.kncursos.pages.dev/api/webhooks/asaas`
- [ ] Configurei Token: `whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms`
- [ ] Marquei como "Ativo"
- [ ] Marquei TODOS os eventos de pagamento
- [ ] Salvei as configurações
- [ ] Cliquei em "Enviar Teste"
- [ ] Recebi mensagem de sucesso
- [ ] Status mudou para "Sincronizado"
- [ ] Fiz uma compra de teste
- [ ] Recebi email de confirmação
- [ ] Venda apareceu no painel Asaas

---

**Documento criado em:** 14/03/2026 14:00 UTC  
**Status:** 📝 Guia de configuração do webhook Asaas  
**URL do Sistema:** https://b002e9f3.kncursos.pages.dev
