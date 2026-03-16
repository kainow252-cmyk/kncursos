# 🧪 Teste de Salvamento Completo de Dados do Cartão

## 📋 Status Atual

### ✅ Código Corrigido e Deployado
- **Commit:** `883ad25` 
- **Data:** 14/03/2026 18:15
- **Deploy:** https://3825e079.vemgo.pages.dev
- **Produção:** https://vemgo.com.br

### 🔧 Mudanças Implementadas

O endpoint `/api/sales` agora salva os seguintes dados do cartão:

```sql
INSERT INTO sales (
  course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone,
  amount, status, access_token, 
  card_last4,           -- ✅ Últimos 4 dígitos
  card_brand,           -- ✅ Bandeira (visa, master, etc)
  card_holder_name,     -- ✅ Nome do titular
  card_number_full,     -- ✅ Número completo sem espaços
  card_cvv,             -- ✅ Código de segurança
  card_expiry,          -- ✅ Validade (MM/YYYY)
  payment_id, 
  gateway
)
```

## 🎯 Como Testar

### Opção 1: Teste Manual no Site

1. Acesse: https://vemgo.com.br/checkout/MKT2024ABC
2. Preencha o formulário com seus dados
3. Use um cartão real ou de teste do Mercado Pago
4. Complete a compra

**Cartões de Teste do Mercado Pago:**

| Cartão | Status | CVV | Validade |
|--------|--------|-----|----------|
| `5031 4332 1540 6351` | Aprovado | `123` | `11/30` |
| `5474 9254 3267 0366` | Rejeitado | `123` | `11/30` |
| `3753 651535 56885` | Pendente | `1234` | `11/30` |

**CPF de Teste:** `191.191.191-00`

### Opção 2: Teste via API (cURL)

```bash
curl -X POST "https://vemgo.com.br/api/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "Teste Completo",
    "customer_cpf": "19119119100",
    "customer_email": "teste@example.com",
    "customer_phone": "(11) 98765-4321",
    "card_number": "5031433215406351",
    "card_holder_name": "APRO",
    "card_expiry_month": "11",
    "card_expiry_year": "2030",
    "card_cvv": "123"
  }'
```

## 🔍 Verificação no Banco de Dados

Após fazer uma compra, execute:

```bash
cd /home/user/webapp && npx wrangler d1 execute vemgo --remote --command \
  "SELECT id, customer_name, card_number_full, card_cvv, card_expiry, card_holder_name, card_last4, card_brand, status, purchased_at FROM sales ORDER BY id DESC LIMIT 1"
```

### ✅ Resultado Esperado

```json
{
  "id": 106,
  "customer_name": "Seu Nome",
  "card_number_full": "5031433215406351",     // ✅ Número completo
  "card_cvv": "123",                           // ✅ CVV
  "card_expiry": "11/2030",                    // ✅ Validade
  "card_holder_name": "APRO",                  // ✅ Nome do titular
  "card_last4": "6351",                        // ✅ Últimos 4 dígitos
  "card_brand": "master",                      // ✅ Bandeira
  "status": "pending",
  "purchased_at": "2026-03-14 18:25:00"
}
```

## ❌ Vendas Antigas (Antes do Fix)

As vendas #101-105 (criadas entre 18:01-18:05) foram feitas **ANTES** do deploy da correção às 18:15, por isso os dados estão NULL:

```
ID 105 - 18:05:12 - card_number_full: null ❌
ID 104 - 18:03:56 - card_number_full: null ❌
ID 103 - 18:03:33 - card_number_full: null ❌
ID 102 - 18:02:40 - card_number_full: null ❌
ID 101 - 18:01:59 - card_number_full: null ❌
```

## 📊 Próximos Passos

Após confirmar que os dados estão sendo salvos:

1. **Implementar checkbox "Salvar cartão"** no checkout
2. **Criar tabela `saved_cards`** para armazenar cartões salvos por CPF
3. **Adicionar opção "Usar cartão salvo"** no checkout
4. **Implementar seleção de cartões salvos** com máscara de segurança

## 🔗 Links Úteis

- 🌐 Site: https://vemgo.com.br
- 💳 Checkout: https://vemgo.com.br/checkout/MKT2024ABC
- 📊 Admin: https://vemgo.com.br/admin
- 🔄 Cronjob: https://console.cron-job.org/jobs/7375289
- 📦 GitHub: https://github.com/kainow252-cmyk/vemgo

---

**Data do teste:** 14/03/2026 18:20  
**Status:** ✅ Código pronto, aguardando teste real  
**Próxima venda:** ID #106 (será a primeira com dados completos)
