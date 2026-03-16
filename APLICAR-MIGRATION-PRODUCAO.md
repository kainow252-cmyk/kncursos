# 🔧 APLICAR MIGRATION NO BANCO DE PRODUÇÃO

## ⚠️ IMPORTANTE: Aplicar Manualmente via Dashboard

O Wrangler CLI não tem permissão para executar scripts SQL complexos no banco remoto. Você precisa aplicar manualmente via Dashboard do Cloudflare.

---

## 📋 Passo a Passo

### 1️⃣ **Acessar o Console D1**
1. Acesse: https://dash.cloudflare.com/
2. Vá em: **Storage & Databases** → **D1**
3. Clique no banco: **vemgo**
4. Clique na aba: **Console**

### 2️⃣ **Executar os Comandos SQL Abaixo**

Copie e cole **CADA COMANDO** individualmente no console D1:

---

## 📝 COMANDOS SQL (Copiar e Colar)

### **Passo 1: Adicionar Colunas na Tabela SALES**

```sql
ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN customer_cpf TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN used_saved_card INTEGER DEFAULT 0;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_last4 TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_brand TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_holder_name TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_number_full TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_cvv TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE sales ADD COLUMN card_expiry TEXT;
```
*(Clique em "Execute" e aguarde confirmação)*

---

### **Passo 2: Adicionar Colunas na Tabela COURSES**

```sql
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
UPDATE courses SET image_width = 400 WHERE image_width IS NULL;
```
*(Clique em "Execute" e aguarde confirmação)*

```sql
UPDATE courses SET image_height = 300 WHERE image_height IS NULL;
```
*(Clique em "Execute" e aguarde confirmação)*

---

### **Passo 3: VERIFICAR se Funcionou**

Execute este comando para ver as colunas da tabela `sales`:
```sql
PRAGMA table_info(sales);
```

Deve aparecer:
- ✅ `asaas_payment_id`
- ✅ `asaas_customer_id`
- ✅ `customer_cpf`
- ✅ `card_last4`
- ✅ `card_brand`
- ✅ `card_holder_name`
- ✅ E outras...

Execute este comando para ver as colunas da tabela `courses`:
```sql
PRAGMA table_info(courses);
```

Deve aparecer:
- ✅ `image_width`
- ✅ `image_height`

---

## ✅ Após Aplicar Todos os Comandos

### 1. **Testar o Checkout Novamente:**
```
https://vemgo.pages.dev/checkout/DEV2024XYZ
```

### 2. **Preencher com Dados de Teste:**
- Nome: `Teste Silva`
- CPF: `249.715.637-92`
- Email: `seu@email.com`
- Telefone: `(11) 99999-9999`
- Cartão: `5162 3062 1937 8829`
- Validade: `05/2026`
- CVV: `318`

### 3. **Resultado Esperado:**
- ✅ Pagamento processado
- ✅ **SEM ERRO** de "table sales has no column named asaas_payment_id"
- ✅ Redirecionamento para página de sucesso
- ✅ E-mail enviado

---

## 🔍 Se Aparecer Erro ao Adicionar Coluna

Se aparecer erro como **"duplicate column name"**, significa que a coluna já existe. Pule esse comando e vá para o próximo.

**Exemplo:**
```
Error: duplicate column name: asaas_payment_id
```
→ Significa que `asaas_payment_id` já existe. Continue com o próximo comando.

---

## 📊 Checklist de Execução

**Tabela SALES (10 comandos):**
- [ ] `ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN customer_cpf TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN used_saved_card INTEGER DEFAULT 0;`
- [ ] `ALTER TABLE sales ADD COLUMN card_last4 TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN card_brand TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN card_holder_name TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN card_number_full TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN card_cvv TEXT;`
- [ ] `ALTER TABLE sales ADD COLUMN card_expiry TEXT;`

**Tabela COURSES (4 comandos):**
- [ ] `ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;`
- [ ] `ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;`
- [ ] `UPDATE courses SET image_width = 400 WHERE image_width IS NULL;`
- [ ] `UPDATE courses SET image_height = 300 WHERE image_height IS NULL;`

**Verificação:**
- [ ] `PRAGMA table_info(sales);` - Confirmar colunas
- [ ] `PRAGMA table_info(courses);` - Confirmar colunas
- [ ] Testar checkout novamente

---

## 🚀 Depois de Aplicar

Me avise quando terminar de executar todos os comandos SQL para que eu possa verificar se está tudo funcionando!

---

## 📝 Notas

- **Por que manualmente?** O token API do Cloudflare não tem permissão para executar scripts SQL complexos via CLI
- **Segurança:** As migrations via Dashboard são mais seguras para produção
- **Backup:** O Cloudflare faz backup automático antes de cada mudança
- **Rollback:** Se algo der errado, o Cloudflare pode reverter automaticamente

---

## 🆘 Se Precisar de Ajuda

Se tiver dúvidas ao executar os comandos:
1. Tire print da tela
2. Me envie o erro específico
3. Posso ajudar a resolver comando por comando

---

**🎯 Próximo Passo: Aplicar os 14 comandos SQL via Dashboard do Cloudflare**
