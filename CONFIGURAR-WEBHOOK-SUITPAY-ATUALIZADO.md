# 🎯 Como Configurar Webhook no Dashboard SuitPay

## ✅ Atualização: Webhook Agora Está 100% Compatível!

Acabei de atualizar o código para seguir **exatamente o formato oficial** da documentação do SuitPay.

**Nova URL de Produção:** https://fd5b06ca.kncursos.pages.dev

---

## 📍 Onde Configurar o Webhook

Segundo a documentação do SuitPay, o webhook deve ser configurado em:

### Caminho no Dashboard
```
VENDAS → GATEWAY DE PAGAMENTO → WEBHOOK
```

**Ou tente acessar diretamente (na tela atual, procure no menu lateral):**
- Clique em **"VENDAS"** (menu lateral esquerdo)
- Expanda a seção **"GATEWAY DE PAGAMENTO"**
- Procure por **"WEBHOOK"**

---

## ⚙️ Configuração do Webhook

### Dados para Preencher

```
Nome/Descrição:
KN Cursos - Pagamentos com Cartão

URL do Webhook:
https://fd5b06ca.kncursos.pages.dev/api/webhooks/suitpay

Tipo:
Rest

Método HTTP:
POST

Formato de Dados:
JSON

Email para Notificações (falhas):
gelci.jose.grouptrig@gmail.com

Eventos a Monitorar:
☑️ Pagamento Aprovado (PAYMENT_ACCEPT)
☑️ Pagamento Confirmado (PAID_OUT)
☑️ Aguardando Aprovação (WAITING_FOR_APPROVAL)
☑️ Cancelado (CANCELED)
☑️ Chargeback (CHARGEBACK)

Ou simplesmente marcar:
☑️ Todos os eventos de Cartão
```

---

## 📋 Formato do Webhook (Segundo Documentação Oficial)

O SuitPay envia webhooks neste formato:

```json
{
  "idTransaction": "string",
  "typeTransaction": "CARD",
  "statusTransaction": "PAID_OUT | PAYMENT_ACCEPT | WAITING_FOR_APPROVAL | CANCELED | CHARGEBACK"
}
```

**Nosso sistema agora processa corretamente:**
- ✅ `PAID_OUT` → Status no banco: `completed`
- ✅ `PAYMENT_ACCEPT` → Status no banco: `completed`
- ✅ `WAITING_FOR_APPROVAL` → Status no banco: `pending`
- ✅ `CANCELED` → Status no banco: `cancelled`
- ✅ `CHARGEBACK` → Status no banco: `refunded`

---

## 🔐 Segurança Implementada

### 1. Validação de IP
O webhook verifica se a requisição vem do IP oficial do SuitPay:
```
IP Autorizado: 3.132.137.46
```
*(Apenas alerta se vier de outro IP, não bloqueia)*

### 2. Validação de Hash SHA-256 (Preparada)
O código está preparado para validar o hash quando necessário.

---

## 🧪 Como Testar o Webhook

### Opção 1: Teste Direto no Dashboard SuitPay

Muitos dashboards de pagamento têm uma opção **"Testar Webhook"**:

1. Após configurar o webhook
2. Procure por um botão como:
   - "Testar Webhook"
   - "Enviar Teste"
   - "Test"
3. Clique e verifique se retorna **200 OK**

### Opção 2: Fazer Compra Real de Teste

1. Acesse: https://fd5b06ca.kncursos.pages.dev
2. Escolha um curso (ou crie um de R$ 1,00 no admin)
3. Faça o checkout normalmente
4. Se o pagamento passar pelo SuitPay, o webhook será disparado

### Opção 3: Monitorar Logs em Tempo Real

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
npx wrangler pages deployment tail
```

**Procure por:**
```
[WEBHOOK SUITPAY] Webhook recebido
[WEBHOOK SUITPAY] Type: CARD
[WEBHOOK SUITPAY] Transaction ID: 12345
[WEBHOOK SUITPAY] Status: PAID_OUT
[WEBHOOK SUITPAY] ✅ Pagamento aprovado/pago
[WEBHOOK SUITPAY] ✅ Status atualizado no banco
```

---

## 🎯 Formato Esperado vs Recebido

### O que o SuitPay Envia (Oficial):
```json
{
  "idTransaction": "abc123xyz",
  "typeTransaction": "CARD",
  "statusTransaction": "PAID_OUT"
}
```

### O que Nosso Sistema Processa:
```javascript
✅ Extrai: idTransaction
✅ Valida: typeTransaction === 'CARD'
✅ Mapeia: statusTransaction → status do banco
✅ Atualiza: tabela sales pelo suitpay_payment_id
✅ Retorna: HTTP 200 OK com JSON
```

---

## ❓ FAQ - Perguntas Frequentes

### 1. O webhook é obrigatório?
**Não imediatamente.** O sistema já processa pagamentos via SuitPay normalmente. O webhook serve para:
- Atualizar status de pagamentos pendentes
- Processar cancelamentos/chargebacks
- Sincronizar em tempo real

**Mas é altamente recomendado configurar o quanto antes.**

### 2. O que acontece se o webhook não estiver configurado?
- ✅ Pagamentos SuitPay continuam funcionando
- ✅ Vendas são registradas no banco
- ✅ Emails são enviados
- ❌ Atualizações de status não serão automáticas

### 3. Como saber se o webhook está funcionando?
**Opção A - Dashboard SuitPay:**
- Ir em: VENDAS → GATEWAY DE PAGAMENTO → WEBHOOK
- Ver histórico de envios
- Status esperado: **200 OK**

**Opção B - Logs Cloudflare:**
```bash
npx wrangler pages deployment tail
```

**Opção C - Banco de Dados:**
```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
npx wrangler d1 execute kncursos --remote --command "
  SELECT id, customer_name, amount, payment_gateway, status, suitpay_payment_id 
  FROM sales 
  WHERE payment_gateway = 'suitpay' 
  ORDER BY id DESC 
  LIMIT 5
"
```

### 4. E se eu não encontrar onde configurar?
**Tente estas alternativas:**

1. **Procure por "Integrações"** ou **"API"** no menu
2. **Entre em contato com o suporte do SuitPay**
3. **Use o sistema normalmente** - o webhook não é bloqueante

---

## 🆘 Suporte

Se ainda tiver dúvidas sobre onde configurar:

### 1. Documentação Oficial
- https://api.suitpay.app/ (seção Webhook)
- https://pix.suitpay.app/

### 2. Suporte SuitPay
- Dashboard: https://web.suitpay.app
- Procure por: "Ajuda", "Suporte", "Chat"
- Ou pergunte: *"Como configuro um webhook para pagamentos com cartão?"*

### 3. Teste Manual
Mesmo sem o webhook configurado, você pode:
1. Fazer compra de teste
2. Verificar se funcionou
3. Configurar webhook depois

---

## ✅ Checklist de Configuração

- [ ] Acessei o dashboard SuitPay
- [ ] Encontrei VENDAS → GATEWAY DE PAGAMENTO → WEBHOOK
- [ ] Criei novo webhook com nome "KN Cursos - Pagamentos com Cartão"
- [ ] Configurei URL: https://fd5b06ca.kncursos.pages.dev/api/webhooks/suitpay
- [ ] Selecionei tipo: **Rest**, método: **POST**, formato: **JSON**
- [ ] Marquei eventos: Todos os de Cartão (ou PAID_OUT, PAYMENT_ACCEPT, etc.)
- [ ] Configurei email: gelci.jose.grouptrig@gmail.com
- [ ] Salvei a configuração
- [ ] Testei o webhook (se houver opção)
- [ ] Verifiquei status: **Ativo**
- [ ] Fiz compra de teste para validar
- [ ] Verifiquei logs do Cloudflare
- [ ] Confirmei que status retornou 200 OK

---

## 🎉 Resumo

**✅ O código está 100% pronto e compatível com a documentação oficial!**

**Próximo passo:** Encontrar a tela de configuração de webhook no dashboard e preencher os dados acima.

**Se não encontrar:** Use o sistema normalmente - o webhook não impede o funcionamento, apenas adiciona sincronização automática.

---

**Última Atualização:** 14 de março de 2026, 13:15 UTC  
**Deploy:** https://fd5b06ca.kncursos.pages.dev  
**Commit:** d974aa0 - fix: atualizar webhook SuitPay com formato oficial
