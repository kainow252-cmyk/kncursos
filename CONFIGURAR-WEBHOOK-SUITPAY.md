# 🔔 Configuração do Webhook SuitPay

## ⚠️ AÇÃO NECESSÁRIA

Para completar a integração do SuitPay, você precisa configurar o webhook no dashboard:

---

## 📋 Passo a Passo

### 1. Acessar o Dashboard SuitPay
🌐 **URL:** https://web.suitpay.app  
👤 **Login:** Use suas credenciais SuitPay

### 2. Navegar até Webhooks
📍 **Menu:** VENDAS → GATEWAY DE PAGAMENTO → Webhooks

### 3. Criar Novo Webhook (ou editar existente)

Preencha os seguintes dados:

#### Configurações Básicas
```
Nome do Webhook: Vemgo - Notificações de Pagamento
```

#### URL do Webhook
```
https://786c7c9c.vemgo.pages.dev/api/webhooks/suitpay
```
**⚠️ IMPORTANTE:** Não adicione `/` no final da URL

#### E-mail de Notificação
```
gelci.jose.grouptrig@gmail.com
```
*Você receberá notificações neste e-mail em caso de falha no webhook*

#### Versão da API
```
v1 (ou a versão mais recente disponível)
```

#### Token de Autenticação
```
(Gerado automaticamente pelo SuitPay ou use um token personalizado)
```
**Nota:** Se o SuitPay gerar um novo token, você precisará atualizá-lo no código.

#### Fila de Sincronização
```
✅ Ativada (SIM)
```
*Isso garante que nenhuma notificação seja perdida*

#### Tipo de Envio
```
Selecionar: Todos os eventos de pagamento

Ou marcar individualmente:
☑️ payment.created
☑️ payment.updated
☑️ payment.approved
☑️ payment.confirmed
☑️ payment.paid
☑️ payment.pending
☑️ payment.processing
☑️ payment.cancelled
☑️ payment.refunded
☑️ payment.failed
☑️ payment.declined
☑️ payment.rejected
```

### 4. Salvar Configuração
Clique em **SALVAR** ou **CRIAR WEBHOOK**

### 5. Verificar Status
Após salvar, verifique:
- ✅ Status: **Ativo**
- ✅ Erros: **0**
- ✅ URL correta
- ✅ E-mail correto

---

## 🧪 Testar Webhook

### Teste Manual (Recomendado)
1. **Fazer uma compra de teste:**
   - Acessar: https://786c7c9c.vemgo.pages.dev
   - Clicar em qualquer curso
   - Fazer checkout com **valor mínimo** (ex: R$ 1,00)
   - Usar cartão de teste (se disponível no SuitPay)

2. **Verificar no Dashboard SuitPay:**
   - Ir em: **VENDAS → HISTÓRICO**
   - Ver se a transação aparece
   - Clicar na transação e ver os detalhes

3. **Verificar Webhook:**
   - Ir em: **VENDAS → GATEWAY DE PAGAMENTO → Webhooks**
   - Clicar no webhook **Vemgo**
   - Ver **Histórico de Envios**
   - Status esperado: **200 OK**

4. **Verificar no Banco de Dados:**
   ```bash
   cd /home/user/webapp
   export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
   npx wrangler d1 execute vemgo --remote --command "SELECT * FROM sales ORDER BY id DESC LIMIT 1"
   ```
   - Verificar se `suitpay_payment_id` está preenchido
   - Verificar se `payment_gateway = 'suitpay'`

---

## 🔧 Atualizar Token (Se Necessário)

Se o SuitPay gerar um novo token de webhook, você precisa atualizar o código:

### Passo 1: Copiar o Token
Exemplo: `whsec_ABC123DEF456GHI789`

### Passo 2: Atualizar no Cloudflare Pages
```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)

# Adicionar novo secret
echo 'whsec_ABC123DEF456GHI789' | npx wrangler pages secret put SUITPAY_WEBHOOK_TOKEN --project-name vemgo
```

### Passo 3: Atualizar .dev.vars (desenvolvimento local)
```bash
cd /home/user/webapp
echo "SUITPAY_WEBHOOK_TOKEN=whsec_ABC123DEF456GHI789" >> .dev.vars
```

### Passo 4: Atualizar código (se necessário)
Abrir `src/index.tsx` e adicionar validação de token no webhook:

```typescript
app.post('/api/webhooks/suitpay', async (c) => {
  try {
    const { DB, SUITPAY_WEBHOOK_TOKEN } = c.env
    
    // Validar token (se SuitPay enviar no header)
    const authHeader = c.req.header('authorization') || c.req.header('suitpay-signature')
    
    if (SUITPAY_WEBHOOK_TOKEN && authHeader !== SUITPAY_WEBHOOK_TOKEN) {
      console.error('[WEBHOOK SUITPAY] ❌ Token inválido')
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // ... resto do código
```

### Passo 5: Rebuild e Redeploy
```bash
npm run build
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
npx wrangler pages deploy dist --project-name vemgo
```

---

## ❓ Perguntas Frequentes

### O webhook precisa estar configurado para o sistema funcionar?
**Não imediatamente.** O sistema já está processando pagamentos via SuitPay. O webhook serve apenas para:
- Atualizar status de pagamentos pendentes
- Processar estornos/cancelamentos
- Sincronizar status em tempo real

**Mas é altamente recomendado configurar o quanto antes.**

### O que acontece se o webhook não estiver configurado?
- ✅ Pagamentos SuitPay continuam funcionando normalmente
- ✅ Vendas são registradas no banco
- ✅ Emails são enviados
- ❌ Status de pagamentos pendentes não serão atualizados automaticamente
- ❌ Estornos não serão sincronizados

### Como saber se o webhook está funcionando?
1. **Dashboard SuitPay:** Ver histórico de envios
2. **Logs Cloudflare:**
   ```bash
   npx wrangler pages deployment tail
   # Procurar por: [WEBHOOK SUITPAY]
   ```
3. **Banco de dados:** Status de vendas será atualizado automaticamente

### Posso testar o webhook sem fazer uma compra real?
**Sim!** Algumas opções:
1. Usar cartão de teste do SuitPay (se disponível)
2. Fazer compra mínima (R$ 1,00) e estornar depois
3. Usar ferramenta de teste de webhook (ex: webhook.site) temporariamente

---

## 📞 Suporte

Se tiver problemas ao configurar o webhook:

1. **Verificar documentação oficial do SuitPay:**
   - https://pix.suitpay.app/ (docs PIX)
   - https://api.suitpay.app/ (docs API)

2. **Contatar suporte SuitPay:**
   - Via dashboard: https://web.suitpay.app
   - Email: (verificar no dashboard)

3. **Verificar logs do sistema:**
   ```bash
   npx wrangler pages deployment tail
   ```

---

## ✅ Checklist de Configuração

- [ ] Acessei o dashboard SuitPay (https://web.suitpay.app)
- [ ] Naveguei até VENDAS → GATEWAY DE PAGAMENTO → Webhooks
- [ ] Criei novo webhook com nome "Vemgo - Notificações de Pagamento"
- [ ] Configurei URL: https://786c7c9c.vemgo.pages.dev/api/webhooks/suitpay
- [ ] Configurei e-mail: gelci.jose.grouptrig@gmail.com
- [ ] Selecionei todos os eventos de pagamento
- [ ] Ativei fila de sincronização
- [ ] Salvei a configuração
- [ ] Verifiquei status: Ativo
- [ ] Testei com compra mínima (R$ 1,00)
- [ ] Verifiquei histórico de webhooks no SuitPay
- [ ] Confirmei que status é 200 OK
- [ ] Verifiquei registro no banco de dados

---

**Última Atualização:** 14 de março de 2026  
**Próximo:** Depois de configurar, fazer teste de compra completo
