# 🚀 Integração Asaas - Documentação Completa

## ✅ O que foi implementado

### **1. Substituição do Mercado Pago por Asaas**

**Motivos da troca:**
- ✅ **Taxas menores:** 3.49% (Asaas) vs 4.99% (Mercado Pago)
- ✅ **API mais simples:** REST puro, sem SDKs complexos
- ✅ **Tokenização backend:** Mais seguro, sem JavaScript no frontend
- ✅ **Sandbox funcional:** Cartões de teste prontos
- ✅ **Suporte brasileiro:** Email, responde rápido

---

## 📋 Estrutura da Integração

### **Backend (Hono + Cloudflare Workers)**

```
/api/sales (POST)
├── 1. Buscar informações do curso e link de pagamento
├── 2. Criar/buscar cliente no Asaas (por CPF)
├── 3. Processar pagamento com cartão de crédito
├── 4. Registrar venda no banco D1
├── 5. Enviar email com PDF via Resend
└── 6. Retornar sucesso com ID da venda

/api/webhooks/asaas (POST)
├── PAYMENT_CONFIRMED → Atualizar status completed
├── PAYMENT_OVERDUE → Atualizar status overdue
├── PAYMENT_REFUNDED → Atualizar status refunded
└── PAYMENT_REPROVED → Atualizar status failed
```

---

## 🔑 Variáveis de Ambiente

### **.dev.vars** (Local)
```bash
# Asaas - API Key (Sandbox)
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm

# Asaas - Ambiente (sandbox ou production)
ASAAS_ENV=sandbox

# Resend - API Key para envio de emails
RESEND_API_KEY=re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6

# Email do remetente (domínio verificado)
EMAIL_FROM=cursos@kncursos.com.br

# Resend Webhook Signing Secret
RESEND_WEBHOOK_SECRET=whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kncursos2024

# JWT Secret
JWT_SECRET=kncursos-jwt-secret-change-in-production-2024
```

### **Cloudflare Pages (Produção)**

Adicionar as mesmas variáveis via Dashboard:
```
Workers & Pages → kncursos → Settings → Environment Variables
```

**Tipo:** Secret (para chaves sensíveis)  
**Environment:** Production

---

## 💳 Cartões de Teste (Sandbox)

### **Cartão Aprovado:**
```
Número: 5162306219378829
Titular: Marcelo Henrique Almeida
Validade: 05/2025
CVV: 318
```

### **Outros cartões de teste:**

| Status | Número do Cartão | Titular |
|--------|------------------|---------|
| ✅ Aprovado | 5162306219378829 | João Silva |
| ❌ Recusado | 5111111111111111 | Maria Santos |
| ⏳ Timeout | 5555555555555555 | Pedro Costa |
| 🚫 Fraude | 4111111111111111 | Ana Souza |

**Dados do cliente (teste):**
- CPF: 123.456.789-00
- Email: teste@exemplo.com
- Telefone: (47) 99999-9999

---

## 🧪 Testes Locais

### **1. Testar criação de cliente:**
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024-001",
    "customer_name": "João Silva",
    "customer_cpf": "123.456.789-00",
    "customer_email": "joao@exemplo.com",
    "customer_phone": "(47) 99999-9999",
    "card_number": "5162306219378829",
    "card_holder_name": "Joao Silva",
    "card_expiration_month": "05",
    "card_expiration_year": "2025",
    "card_cvv": "318"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "sale_id": 1,
  "amount": 197.00,
  "status": "completed",
  "payment_id": "pay_123456789",
  "asaas_payment_id": "pay_123456789",
  "asaas_customer_id": "cus_000005219613",
  "access_token": "abc123...",
  "download_url": "/download/abc123...",
  "course_title": "Marketing Digital Completo",
  "message": "Pagamento aprovado! Verifique seu email para acessar o curso."
}
```

### **2. Verificar logs:**
```bash
pm2 logs kncursos --nostream | grep -E "ASAAS|EMAIL"
```

**Logs esperados:**
```
[ASAAS] Iniciando processamento de pagamento
[ASAAS] Ambiente: sandbox
[ASAAS] Criando cliente...
[ASAAS] Novo cliente criado: cus_000005219613
[ASAAS] Processando pagamento...
[ASAAS] Resposta do pagamento: { status: 'CONFIRMED', id: 'pay_123456789' }
[EMAIL] Verificando envio de email...
[EMAIL] ✅ Email enviado com sucesso!
```

---

## 🔔 Webhooks Asaas

### **Configurar no Dashboard Asaas:**

1. **Login no Asaas:** https://sandbox.asaas.com/ (ou producao)
2. **Menu:** Integrações → Webhooks
3. **Adicionar Webhook:**
   - **URL:** `https://kncursos.pages.dev/api/webhooks/asaas`
   - **Eventos:**
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_DELETED
     - ✅ PAYMENT_REFUNDED
     - ✅ PAYMENT_REPROVED_BY_RISK_ANALYSIS
   - **Versão:** v3
4. **Salvar**

### **Testar webhook localmente:**
```bash
curl -X POST http://localhost:3000/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_123456789",
      "status": "CONFIRMED",
      "value": 197.00
    }
  }'
```

**Resposta esperada:**
```json
{
  "received": true,
  "event": "PAYMENT_CONFIRMED"
}
```

---

## 📊 Banco de Dados (D1)

### **Novas colunas na tabela `sales`:**

```sql
ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;
ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;
```

### **Schema atualizado:**
```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  access_token TEXT UNIQUE,
  card_last4 TEXT,
  card_brand TEXT,
  card_holder_name TEXT,
  card_number_full TEXT,
  card_cvv TEXT,
  card_expiry TEXT,
  asaas_payment_id TEXT,    -- ← NOVO
  asaas_customer_id TEXT,   -- ← NOVO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

## 🚀 Deploy para Produção

### **1. Atualizar variáveis no Cloudflare:**

```bash
# Obter API Key de PRODUÇÃO do Asaas
# Ir em: https://www.asaas.com/ → Integrações → API → Produção

# Adicionar no Cloudflare Pages:
ASAAS_API_KEY=sua_chave_de_producao_aqui
ASAAS_ENV=production
```

**Via Dashboard:**
1. https://dash.cloudflare.com/
2. Workers & Pages → **kncursos** → Settings → **Environment Variables**
3. Edit **ASAAS_API_KEY** → Trocar para chave de produção
4. Edit **ASAAS_ENV** → Mudar para `production`
5. Save

### **2. Aplicar migrations no D1 Production:**

```bash
cd /home/user/webapp
npx wrangler d1 execute kncursos --file=add-asaas-columns.sql --remote
```

### **3. Build e Deploy:**

```bash
npm run build
npx wrangler pages deploy dist --project-name kncursos
```

### **4. Configurar webhook em produção:**

1. Login no Asaas **PRODUÇÃO:** https://www.asaas.com/
2. Menu: Integrações → Webhooks
3. Adicionar webhook com URL de produção:
   - **URL:** `https://kncursos.pages.dev/api/webhooks/asaas`
   - **Eventos:** Mesmos do sandbox
   - **Versão:** v3

---

## 🔍 Troubleshooting

### **Erro: "Transação não autorizada"**

**Solução:**
- Verificar se os dados do cartão estão corretos
- Em sandbox, usar cartões de teste do Asaas
- Verificar se `ASAAS_ENV=sandbox` está configurado

### **Erro: "Cliente já existe"**

**Solução:**
- API busca automaticamente por CPF antes de criar
- Se cliente existir, reutiliza o ID

### **Erro: "Webhook não recebido"**

**Solução:**
- Verificar URL do webhook no dashboard Asaas
- Confirmar que URL está acessível publicamente
- Verificar logs: `npx wrangler pages deployment tail`

### **Email não enviado:**

**Solução:**
- Verificar `RESEND_API_KEY` configurado
- Confirmar domínio verificado no Resend
- Checar logs para erros de envio

---

## 📈 Comparação: Antes vs Depois

| Aspecto | Mercado Pago | Asaas |
|---------|--------------|-------|
| Taxa | 4.99% + R$ 0,40 | 3.49% |
| SDK Frontend | Obrigatório (SDK 3MB) | ❌ Não necessário |
| Tokenização | Frontend (JS) | ✅ Backend (seguro) |
| Sandbox | Limitado | ✅ Completo |
| Webhooks | Complexo | ✅ Simples |
| Bundle Size | 391.91 KB + SDK | 391.91 KB |
| Economia/mês* | - | **R$ 190** |

*Considerando R$ 10.000 em vendas/mês

---

## 📝 Próximos Passos

1. ✅ **Testar localmente** com cartões de teste
2. ✅ **Deploy para staging** (verificar)
3. ⏳ **Migrar D1 production** (adicionar colunas)
4. ⏳ **Deploy para produção**
5. ⏳ **Configurar webhook produção**
6. ⏳ **Fazer teste real** com cartão real
7. ⏳ **Monitorar primeiras vendas**

---

## 🎯 Status da Implementação

- ✅ Backend Asaas completo
- ✅ Webhook Asaas implementado
- ✅ Banco de dados atualizado (local)
- ✅ Mercado Pago removido
- ✅ Build funcionando (391.91 KB)
- ✅ Servidor local testado
- ⏳ Checkout frontend (não modificado ainda)
- ⏳ Deploy produção
- ⏳ Testes com cartões reais

---

## 📞 Suporte

**Asaas:**
- Documentação: https://docs.asaas.com/
- Email: [email protected]
- Chat: Dashboard → Suporte

**kncursos:**
- Email: gelci.silva252@gmail.com
- Dashboard: https://kncursos.pages.dev/admin

---

**Última atualização:** 2026-03-13  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e testado localmente
