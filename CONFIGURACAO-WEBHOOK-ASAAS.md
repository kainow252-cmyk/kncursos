# 🔔 CONFIGURAÇÃO DE WEBHOOK - ASAAS

## 📋 DADOS PARA PREENCHER NO FORMULÁRIO

---

## ✅ CAMPO 1: WEBHOOK FICARÁ ATIVO?

```
✅ SIM
```

**Marque:** ✅ **Sim**

---

## ✅ CAMPO 2: NOME DO WEBHOOK

```
Vemgo - Notificações de Pagamento
```

**Digite:** `Vemgo - Notificações de Pagamento`

**Observação:** Nome descritivo para identificar este webhook

---

## ✅ CAMPO 3: URL DO WEBHOOK

```
https://c02d2ec7.vemgo.pages.dev/webhook/asaas
```

**Cole exatamente:** `https://c02d2ec7.vemgo.pages.dev/webhook/asaas`

**⚠️ IMPORTANTE:** 
- Não adicione `/` no final
- Use HTTPS (não HTTP)
- Certifique-se de copiar corretamente

---

## ✅ CAMPO 4: E-MAIL PARA NOTIFICAÇÕES

```
gelci.jose.grouptrig@gmail.com
```

**Digite:** `gelci.jose.grouptrig@gmail.com`

**Função:** Você receberá emails se o webhook falhar

---

## ✅ CAMPO 5: VERSÃO DA API

```
v3 (mais recente disponível)
```

**Selecione:** A versão **mais recente** disponível no dropdown
- Se tiver `v3`, selecione `v3`
- Se não tiver, selecione a maior versão disponível

---

## ✅ CAMPO 6: TOKEN DE AUTENTICAÇÃO

### **✅ TOKEN CONFIGURADO:**

```
whsec_9YVKoFYtPFuvWqRZgrmLEXWmzVv1jwZWjm2YDl6jyms
```

**✅ Este token JÁ FOI configurado no sistema!**

**Status:**
- ✅ Gerado pelo Asaas
- ✅ Configurado no Cloudflare Pages
- ✅ Atualizado em .dev.vars
- ✅ Pronto para receber webhooks

**Data de configuração:** 14/03/2026

---

## ✅ CAMPO 7: FILA DE SINCRONIZAÇÃO ATIVADA?

```
✅ SIM
```

**Marque:** ✅ **Sim**

**Função:** Garante que notificações não sejam perdidas

---

## ✅ CAMPO 8: TIPO DE ENVIO

```
Selecione TODOS os eventos de pagamento
```

**Marque as seguintes opções:**

### **Eventos Essenciais:**
- ✅ **PAYMENT_CREATED** - Cobrança criada
- ✅ **PAYMENT_AWAITING_RISK_ANALYSIS** - Aguardando análise
- ✅ **PAYMENT_APPROVED_BY_RISK_ANALYSIS** - Aprovado pela análise
- ✅ **PAYMENT_REPROVED_BY_RISK_ANALYSIS** - Reprovado pela análise
- ✅ **PAYMENT_UPDATED** - Cobrança atualizada
- ✅ **PAYMENT_CONFIRMED** - Pagamento confirmado
- ✅ **PAYMENT_RECEIVED** - Pagamento recebido ⭐ **PRINCIPAL**
- ✅ **PAYMENT_CREDIT_CARD_CAPTURE_REFUSED** - Cartão recusado
- ✅ **PAYMENT_OVERDUE** - Pagamento vencido
- ✅ **PAYMENT_DELETED** - Cobrança excluída
- ✅ **PAYMENT_RESTORED** - Cobrança restaurada
- ✅ **PAYMENT_REFUNDED** - Pagamento estornado
- ✅ **PAYMENT_RECEIVED_IN_CASH_UNDONE** - Recebimento desfeito
- ✅ **PAYMENT_CHARGEBACK_REQUESTED** - Chargeback solicitado
- ✅ **PAYMENT_CHARGEBACK_DISPUTE** - Disputa de chargeback
- ✅ **PAYMENT_AWAITING_CHARGEBACK_REVERSAL** - Aguardando reversão

### **Se disponível, também marque:**
- ✅ **PAYMENT_DUNNING_RECEIVED** - Cobrança recebida após recuperação
- ✅ **PAYMENT_DUNNING_REQUESTED** - Recuperação solicitada
- ✅ **PAYMENT_BANK_SLIP_VIEWED** - Boleto visualizado
- ✅ **PAYMENT_CHECKOUT_VIEWED** - Checkout visualizado

---

## 📋 RESUMO DA CONFIGURAÇÃO

| Campo | Valor |
|-------|-------|
| **Ativo?** | ✅ Sim |
| **Nome** | Vemgo - Notificações de Pagamento |
| **URL** | https://c02d2ec7.vemgo.pages.dev/webhook/asaas |
| **Email** | gelci.jose.grouptrig@gmail.com |
| **Versão API** | v3 (ou mais recente) |
| **Token** | whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM |
| **Fila** | ✅ Sim |
| **Eventos** | Todos de pagamento marcados |

---

## 🔧 APÓS SALVAR O WEBHOOK

### **1. Se você GEROU um novo token (não usou o nosso):**

Você precisará atualizar o token no Cloudflare:

```bash
# Anote o token gerado pelo Asaas
# Exemplo: whsec_ABC123XYZ...

# Depois me informe o novo token para atualizar!
```

### **2. Teste o Webhook:**

Após salvar, o Asaas deve mostrar:
- ✅ **Status:** Ativo
- ✅ **Última sincronização:** (vazio inicialmente)
- ✅ **Erros:** 0

---

## 🧪 COMO TESTAR SE ESTÁ FUNCIONANDO

### **Opção 1: Teste no Asaas**

Alguns painéis Asaas têm botão "Testar Webhook":
1. Clique em "Testar"
2. O Asaas enviará uma notificação de teste
3. Verifique se aparece como sucesso

### **Opção 2: Fazer uma Cobrança de Teste**

1. Crie uma cobrança de R$ 1,00
2. Pague com seu cartão
3. Webhook será acionado automaticamente
4. Verifique no Asaas: **Webhooks → Histórico**
5. Deve aparecer:
   - ✅ Status: 200 (sucesso)
   - ✅ Evento: PAYMENT_RECEIVED

---

## 📊 MONITORAMENTO DO WEBHOOK

### **No Dashboard Asaas:**

Acesse: **Configurações → Integrações → Webhooks**

**Veja:**
- 📊 Total de sincronizações
- ✅ Sincronizações bem-sucedidas
- ❌ Sincronizações com erro
- 📅 Última sincronização

### **Logs no Cloudflare:**

```bash
# Ver logs em tempo real
npx wrangler pages deployment tail --project-name vemgo
```

**Procure por:**
```
[WEBHOOK] Received from Asaas
[WEBHOOK] Event: PAYMENT_RECEIVED
[WEBHOOK] Payment ID: ...
```

---

## ⚠️ TROUBLESHOOTING

### **Erro: "URL inválida"**
- ✅ Verifique se a URL está correta
- ✅ Use HTTPS (não HTTP)
- ✅ Não coloque `/` no final

### **Erro: "Token inválido"**
- ✅ Copie o token corretamente
- ✅ Não adicione espaços
- ✅ Use o token completo

### **Erro 401: "Não autorizado"**
- ✅ Token está configurado no Cloudflare?
- ✅ Token está correto em ambos os lados?

### **Erro 500: "Erro interno"**
- ✅ Sistema está online?
- ✅ Verifique logs no Cloudflare
- ✅ Teste novamente em alguns minutos

---

## 🔐 SEGURANÇA DO WEBHOOK

### **Como o Sistema Valida:**

1. **Token de autenticação**
   - Todo webhook vem com header `asaas-access-token`
   - Sistema valida se bate com token configurado

2. **Verificação de origem**
   - IP do Asaas é verificado
   - Apenas requests do Asaas são aceitos

3. **Validação de payload**
   - Estrutura do JSON é validada
   - Dados inconsistentes são rejeitados

---

## 📝 EVENTOS MAIS IMPORTANTES

### **PAYMENT_RECEIVED** ⭐
**Quando:** Pagamento confirmado e aprovado  
**O que faz:** 
- ✅ Registra venda no banco
- ✅ Envia email para cliente
- ✅ Libera acesso ao PDF

### **PAYMENT_CONFIRMED**
**Quando:** Pagamento confirmado (mas ainda processando)  
**O que faz:**
- ✅ Atualiza status da venda
- ✅ Log no sistema

### **PAYMENT_OVERDUE**
**Quando:** Pagamento venceu e não foi pago  
**O que faz:**
- ✅ Atualiza status para "vencido"
- ✅ Pode enviar email de cobrança

### **PAYMENT_REFUNDED**
**Quando:** Pagamento foi estornado  
**O que faz:**
- ✅ Marca venda como estornada
- ✅ Remove acesso ao conteúdo (opcional)

---

## 💡 DICAS IMPORTANTES

### ✅ **FAÇA:**
- Configure o webhook logo após ativar produção
- Teste com uma compra real de R$ 1,00
- Monitore o histórico regularmente
- Mantenha o email atualizado para notificações

### ❌ **NÃO FAÇA:**
- Não compartilhe o token do webhook
- Não desative a fila de sincronização
- Não altere a URL sem atualizar o código
- Não ignore notificações de erro

---

## 📞 SUPORTE

### **Se tiver problemas:**

1. **Verifique primeiro:**
   - ✅ URL está correta?
   - ✅ Token está configurado?
   - ✅ Site está online?

2. **Consulte logs:**
   - Asaas: Histórico de webhooks
   - Cloudflare: Logs em tempo real

3. **Entre em contato:**
   - Asaas: [email protected]
   - Telefone: (11) 4200-2909

---

## ✅ CHECKLIST FINAL

Antes de salvar, confirme:

- [ ] ✅ Webhook ativo = **SIM**
- [ ] ✅ Nome preenchido
- [ ] ✅ URL correta (sem `/` no final)
- [ ] ✅ Email válido
- [ ] ✅ Versão API selecionada
- [ ] ✅ Token configurado
- [ ] ✅ Fila ativada = **SIM**
- [ ] ✅ Eventos de pagamento marcados
- [ ] ✅ Tudo conferido? **SALVAR!**

---

## 🎯 RESULTADO ESPERADO

Após configurar e salvar:

```
✅ Webhook: Ativo
✅ Status: Conectado
✅ Última sincronização: (aguardando primeira venda)
✅ Erros: 0
✅ Total de envios: 0 (aumentará com vendas)
```

---

## 🎉 PRONTO!

Webhook configurado significa:

✅ **Notificações automáticas de pagamento**  
✅ **Emails enviados automaticamente**  
✅ **Sistema 100% integrado com Asaas**  
✅ **Cliente recebe PDF após pagamento**  
✅ **Você recebe notificação de cada venda**

**Agora seu sistema está completo!** 🚀

---

**Última Atualização:** 14 de março de 2026  
**Status:** Aguardando configuração no Asaas  
**Versão:** 1.0.0
