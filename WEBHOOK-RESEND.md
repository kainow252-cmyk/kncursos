# 🔔 Webhook Resend - Configuração Completa

## 📋 O que é Webhook?

Webhook é uma URL que o Resend chama automaticamente quando eventos acontecem (email enviado, entregue, aberto, clicado, etc).

---

## 🎯 Endpoint Criado

```
POST /api/webhooks/resend
```

**URL completa**:
- Local: `http://localhost:3000/api/webhooks/resend`
- Produção: `https://vemgo.pages.dev/api/webhooks/resend`

---

## 📊 Eventos Suportados

| Evento | Descrição | Ação |
|--------|-----------|------|
| `email.sent` | Email foi enviado | ✅ Log |
| `email.delivered` | Email foi entregue | ✅ Log + atualizar status |
| `email.delivery_delayed` | Entrega atrasada | ⚠️ Log |
| `email.complained` | Marcado como spam | ⚠️ Log + alertar |
| `email.bounced` | Email retornou (endereço inválido) | ❌ Log + marcar email inválido |
| `email.opened` | Email foi aberto | 👀 Log + estatísticas |
| `email.clicked` | Link foi clicado | 🖱️ Log + conversão |

---

## 🔧 Configuração no Resend

### Passo 1: Acessar Webhooks

1. **Acesse**: https://resend.com/webhooks
2. **Login** com sua conta
3. Clique em **"Add Webhook"**

### Passo 2: Configurar Webhook

**Formulário**:

```
Nome: vemgo - Produção
URL: https://vemgo.pages.dev/api/webhooks/resend
```

**Eventos (selecione todos)**:
- ✅ email.sent
- ✅ email.delivered
- ✅ email.delivery_delayed
- ✅ email.complained
- ✅ email.bounced
- ✅ email.opened
- ✅ email.clicked

**Versão**: `2024-01-01` (latest)

### Passo 3: Signing Secret

Após criar, o Resend mostrará um **Signing Secret**:

```
whsec_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**⚠️ IMPORTANTE**: Copie e guarde este secret!

### Passo 4: Configurar Secret no Cloudflare

```bash
# Adicionar signing secret
npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name vemgo
# Cole: whsec_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 🔐 Validação de Assinatura (Segurança)

Para garantir que o webhook vem realmente do Resend, vamos adicionar validação:

### Atualizar Bindings (src/index.tsx)

```typescript
type Bindings = {
  DB: D1Database;
  MERCADOPAGO_PUBLIC_KEY: string;
  MERCADOPAGO_ACCESS_TOKEN: string;
  RESEND_API_KEY: string;
  RESEND_WEBHOOK_SECRET: string; // ← Adicionar
  EMAIL_FROM: string;
  JWT_SECRET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
}
```

### Validar Webhook (opcional mas recomendado)

```typescript
app.post('/api/webhooks/resend', async (c) => {
  const { RESEND_WEBHOOK_SECRET } = c.env
  
  // Validar assinatura
  const signature = c.req.header('svix-signature')
  const timestamp = c.req.header('svix-timestamp')
  const body = await c.req.text()
  
  // Aqui você validaria a assinatura usando a biblioteca svix
  // Por simplicidade, vamos pular validação por enquanto
  
  const payload = JSON.parse(body)
  
  console.log('[WEBHOOK RESEND] Evento recebido:', payload.type)
  
  // Processar evento...
  
  return c.json({ received: true })
})
```

---

## 🧪 Testar Webhook Localmente

### Opção 1: ngrok (Túnel para localhost)

```bash
# 1. Instalar ngrok
# https://ngrok.com/download

# 2. Criar túnel
ngrok http 3000

# 3. Copiar URL HTTPS
# https://abc123.ngrok-free.app

# 4. Configurar no Resend
# URL: https://abc123.ngrok-free.app/api/webhooks/resend

# 5. Enviar teste
# O Resend pode enviar um evento de teste
```

### Opção 2: Cloudflare Tunnel

```bash
# 1. Instalar cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

# 2. Criar túnel
cloudflared tunnel --url http://localhost:3000

# 3. Usar URL gerada
# https://xyz.trycloudflare.com/api/webhooks/resend
```

### Opção 3: Testar Direto em Produção

Mais simples - configurar diretamente:
```
URL: https://vemgo.pages.dev/api/webhooks/resend
```

---

## 📝 Payload Exemplo

### email.sent

```json
{
  "type": "email.sent",
  "created_at": "2024-03-13T18:45:00.000Z",
  "data": {
    "email_id": "abc123-def456-ghi789",
    "from": "cursos@vemgo.com.br",
    "to": ["cliente@exemplo.com"],
    "subject": "✅ Confirmação de Compra - Marketing Digital Completo"
  }
}
```

### email.delivered

```json
{
  "type": "email.delivered",
  "created_at": "2024-03-13T18:45:05.000Z",
  "data": {
    "email_id": "abc123-def456-ghi789",
    "from": "cursos@vemgo.com.br",
    "to": ["cliente@exemplo.com"]
  }
}
```

### email.opened

```json
{
  "type": "email.opened",
  "created_at": "2024-03-13T18:50:00.000Z",
  "data": {
    "email_id": "abc123-def456-ghi789",
    "from": "cursos@vemgo.com.br",
    "to": ["cliente@exemplo.com"]
  }
}
```

### email.bounced

```json
{
  "type": "email.bounced",
  "created_at": "2024-03-13T18:45:10.000Z",
  "data": {
    "email_id": "abc123-def456-ghi789",
    "from": "cursos@vemgo.com.br",
    "to": ["invalido@exemplo.com"],
    "bounce_type": "hard",
    "bounce_reason": "mailbox_not_found"
  }
}
```

---

## 📊 Logs e Monitoramento

### Ver Logs no Cloudflare

```bash
# Logs em tempo real
npx wrangler pages deployment tail --project-name vemgo

# Filtrar webhooks
npx wrangler pages deployment tail --project-name vemgo | grep WEBHOOK
```

### Ver Logs Localmente

```bash
# PM2 logs
pm2 logs vemgo --nostream | grep WEBHOOK

# Últimos 50 logs
pm2 logs vemgo --nostream --lines 50 | grep WEBHOOK
```

---

## 🎯 Próximos Passos (Opcional)

### 1. Criar Tabela de Email Logs

```sql
CREATE TABLE email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id TEXT UNIQUE NOT NULL,
  sale_id INTEGER,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL, -- sent, delivered, bounced, opened, clicked
  event_type TEXT NOT NULL,
  event_data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

CREATE INDEX idx_email_logs_email_id ON email_logs(email_id);
CREATE INDEX idx_email_logs_sale_id ON email_logs(sale_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

### 2. Registrar Eventos no Banco

```typescript
app.post('/api/webhooks/resend', async (c) => {
  const { DB } = c.env
  const payload = await c.req.json()
  
  // Registrar evento
  await DB.prepare(`
    INSERT INTO email_logs (email_id, recipient, status, event_type, event_data)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    payload.data.email_id,
    payload.data.to[0],
    payload.type.replace('email.', ''),
    payload.type,
    JSON.stringify(payload.data)
  ).run()
  
  return c.json({ received: true })
})
```

### 3. Dashboard de Estatísticas

```typescript
// Endpoint para estatísticas
app.get('/api/email-stats', async (c) => {
  const { DB } = c.env
  
  const stats = await DB.prepare(`
    SELECT 
      status,
      COUNT(*) as count
    FROM email_logs
    GROUP BY status
  `).all()
  
  return c.json(stats)
})
```

---

## ✅ Checklist de Configuração

- [ ] Endpoint `/api/webhooks/resend` criado
- [ ] Acesso https://resend.com/webhooks
- [ ] Webhook criado com URL de produção
- [ ] Todos os eventos selecionados
- [ ] Signing secret copiado
- [ ] Secret configurado no Cloudflare (`RESEND_WEBHOOK_SECRET`)
- [ ] Deploy realizado
- [ ] Teste enviado pelo Resend
- [ ] Logs verificados
- [ ] Webhook funcionando ✅

---

## 🆘 Problemas Comuns

### "Webhook failed - 404"

```bash
# Verificar se rota existe
curl https://vemgo.pages.dev/api/webhooks/resend

# Deve retornar 405 (Method Not Allowed) ao invés de 404
# Se retornar 404, fazer deploy novamente
npm run build
npx wrangler pages deploy dist --project-name vemgo
```

### "Webhook failed - 500"

```bash
# Verificar logs
npx wrangler pages deployment tail --project-name vemgo

# Verificar erro no código
pm2 logs vemgo --lines 50 | grep ERROR
```

### "Signature validation failed"

```bash
# Verificar se secret está configurado
npx wrangler pages secret list --project-name vemgo

# Deve mostrar RESEND_WEBHOOK_SECRET
# Se não, configurar:
npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name vemgo
```

---

## 📚 Referências

- **Resend Webhooks**: https://resend.com/docs/dashboard/webhooks/introduction
- **Eventos**: https://resend.com/docs/dashboard/webhooks/event-types
- **Segurança**: https://resend.com/docs/dashboard/webhooks/security
- **Testar**: https://resend.com/docs/dashboard/webhooks/test

---

## 🎯 Status Atual

- ✅ **Endpoint criado**: `/api/webhooks/resend`
- ✅ **Eventos suportados**: 7 tipos
- ✅ **Logs implementados**: Console detalhado
- ⏳ **Configuração Resend**: Aguardando
- ⏳ **Teste**: Aguardando deploy

---

**Próximo passo**: Deploy para produção e configurar webhook no Resend! 🚀

**Última Atualização**: 2026-03-13
