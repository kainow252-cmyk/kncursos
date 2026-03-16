# 🔐 Configurar Secrets no Cloudflare Pages

## ✅ Webhook Resend Configurado

**Webhook URL**: https://vemgo.pages.dev/api/webhooks/resend  
**Signing Secret**: `whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t`  
**Status**: ✅ Ativo (13 eventos)

---

## 🔧 Configurar Secrets no Cloudflare Dashboard

### Passo 1: Acessar Cloudflare Pages

1. **Login**: https://dash.cloudflare.com/
2. Vá para **Workers & Pages**
3. Selecione o projeto **vemgo**
4. Clique na aba **Settings**
5. Role até **Environment Variables**

### Passo 2: Adicionar RESEND_WEBHOOK_SECRET

1. Clique em **Add variable**
2. Preencha:
   - **Variable name**: `RESEND_WEBHOOK_SECRET`
   - **Value**: `whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t`
   - **Environment**: `Production` (deixe marcado)
   - **Type**: `Secret` (criptografado)
3. Clique em **Save**

### Passo 3: Adicionar EMAIL_FROM (se ainda não tiver)

1. Clique em **Add variable**
2. Preencha:
   - **Variable name**: `EMAIL_FROM`
   - **Value**: `cursos@vemgo.com.br`
   - **Environment**: `Production`
   - **Type**: `Plain text`
3. Clique em **Save**

### Passo 4: Verificar Todas as Variáveis

Certifique-se de que as seguintes variáveis estão configuradas:

| Variable | Valor | Tipo | Status |
|----------|-------|------|--------|
| `MERCADOPAGO_PUBLIC_KEY` | `TEST-dd4f6d02-...` | Secret | ✅ |
| `MERCADOPAGO_ACCESS_TOKEN` | `TEST-1480231898921036-...` | Secret | ✅ |
| `RESEND_API_KEY` | `re_JDP5HjRp_...` | Secret | ✅ |
| `EMAIL_FROM` | `cursos@vemgo.com.br` | Plain | ✅ |
| `RESEND_WEBHOOK_SECRET` | `whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t` | Secret | ⏳ Adicionar |
| `JWT_SECRET` | `vemgo-jwt-secret-...` | Secret | ✅ |
| `ADMIN_USERNAME` | `admin` | Secret | ✅ |
| `ADMIN_PASSWORD` | `vemgo2024` | Secret | ✅ |

### Passo 5: Deploy Novamente (Opcional)

Após adicionar as variáveis, faça um novo deploy:

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name vemgo
```

---

## 🧪 Testar Webhook

### Opção 1: Enviar Email de Teste

```bash
# Fazer uma compra de teste
curl -X POST https://vemgo.pages.dev/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024-001",
    "customer_name": "Teste Webhook",
    "customer_cpf": "123.456.789-00",
    "customer_email": "gelci.silva252@gmail.com",
    "customer_phone": "(11) 98765-4321",
    "card_number": "4111 1111 1111 1111",
    "card_holder_name": "TESTE",
    "card_expiration_month": "12",
    "card_expiration_year": "2025",
    "card_cvv": "123"
  }'

# Aguardar alguns segundos e verificar logs
npx wrangler pages deployment tail --project-name vemgo | grep WEBHOOK
```

### Opção 2: Teste Manual no Resend

1. Acesse: https://resend.com/webhooks
2. Clique no webhook **vemgo - Produção**
3. Clique em **Send test event**
4. Selecione o tipo de evento (ex: `email.delivered`)
5. Clique em **Send**
6. Verificar logs

### Opção 3: Teste com cURL

```bash
curl -X POST https://vemgo.pages.dev/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivered",
    "created_at": "2024-03-13T19:00:00.000Z",
    "data": {
      "email_id": "test-webhook-123",
      "from": "cursos@vemgo.com.br",
      "to": ["teste@exemplo.com"],
      "subject": "Teste Webhook Resend"
    }
  }'

# Resposta esperada:
# {"received":true,"type":"email.delivered"}
```

---

## 📊 Verificar Logs

### Logs em Tempo Real (Cloudflare)

```bash
# Ver todos os logs
npx wrangler pages deployment tail --project-name vemgo

# Filtrar apenas webhooks
npx wrangler pages deployment tail --project-name vemgo | grep WEBHOOK

# Exemplo de saída:
# [WEBHOOK RESEND] Evento recebido: email.sent
# [WEBHOOK] ✅ Email enviado: abc123-def456-ghi789
# [WEBHOOK RESEND] Evento recebido: email.delivered
# [WEBHOOK] ✅ Email entregue: abc123-def456-ghi789
```

### Logs Locais (Desenvolvimento)

```bash
pm2 logs vemgo --nostream --lines 50 | grep WEBHOOK
```

---

## 🔍 Validação de Assinatura (Opcional - Avançado)

Para garantir que webhooks vêm realmente do Resend:

### Instalar biblioteca svix

```bash
npm install svix
```

### Atualizar código (src/index.tsx)

```typescript
import { Webhook } from 'svix'

app.post('/api/webhooks/resend', async (c) => {
  const { RESEND_WEBHOOK_SECRET } = c.env
  
  // Obter headers e body
  const svix_id = c.req.header('svix-id')
  const svix_timestamp = c.req.header('svix-timestamp')
  const svix_signature = c.req.header('svix-signature')
  const body = await c.req.text()
  
  // Validar assinatura
  try {
    const wh = new Webhook(RESEND_WEBHOOK_SECRET)
    const payload = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    })
    
    console.log('[WEBHOOK] ✅ Assinatura válida')
    console.log('[WEBHOOK] Evento:', payload.type)
    
    // Processar evento...
    
    return c.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK] ❌ Assinatura inválida:', err)
    return c.json({ error: 'Invalid signature' }, 401)
  }
})
```

---

## 📋 Eventos Monitorados

| Evento | Descrição | Ação |
|--------|-----------|------|
| ✅ `email.sent` | Email enviado para servidor | Log |
| ✅ `email.delivered` | Email entregue na caixa de entrada | Log + Atualizar status |
| ⏳ `email.delivery_delayed` | Entrega atrasada | Log + Alertar |
| ⚠️ `email.complained` | Marcado como spam | Log + Blacklist temporário |
| ❌ `email.bounced` | Email retornou (endereço inválido) | Log + Marcar email inválido |
| 👀 `email.opened` | Email foi aberto pelo destinatário | Log + Estatísticas |
| 🖱️ `email.clicked` | Link do email foi clicado | Log + Conversão |
| 📧 `email.delivery_error` | Erro na entrega | Log + Retry |
| 🔕 `email.unsubscribed` | Usuário cancelou inscrição | Log + Remover da lista |
| ➕ Outros | Eventos adicionais do Resend | Log genérico |

---

## ✅ Status Final

### ✅ Configurado

- [x] Webhook URL adicionado no Resend
- [x] 13 eventos configurados
- [x] Signing secret copiado
- [x] `.dev.vars` atualizado localmente
- [x] Endpoint `/api/webhooks/resend` funcionando
- [x] Teste manual realizado com sucesso

### ⏳ Pendente

- [ ] Adicionar `RESEND_WEBHOOK_SECRET` no Cloudflare Dashboard
- [ ] Adicionar `EMAIL_FROM=cursos@vemgo.com.br` no Cloudflare
- [ ] Testar webhook com email real
- [ ] Verificar logs em produção

---

## 🎯 Próximos Passos

1. **Adicionar secret no Cloudflare**:
   - Acesse: https://dash.cloudflare.com/
   - Workers & Pages → vemgo → Settings
   - Environment Variables → Add variable
   - `RESEND_WEBHOOK_SECRET` = `whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t`

2. **Fazer uma compra de teste**:
   - Acesse: https://vemgo.pages.dev/
   - Escolha um curso
   - Faça checkout com qualquer cartão
   - Email será enviado para gelci.silva252@gmail.com

3. **Verificar logs**:
   ```bash
   npx wrangler pages deployment tail --project-name vemgo | grep WEBHOOK
   ```

4. **Ver eventos no Resend**:
   - https://resend.com/webhooks
   - Clique no webhook
   - Aba "Events" mostra todos os webhooks enviados

---

## 📚 Links Úteis

- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Resend Webhooks**: https://resend.com/webhooks
- **Documentação**: `/home/user/webapp/WEBHOOK-RESEND.md`

---

**Status**: ⏳ **Aguardando configuração no Cloudflare**  
**Próxima ação**: Adicionar `RESEND_WEBHOOK_SECRET` nas variáveis de ambiente  
**Última atualização**: 2026-03-13 19:00
