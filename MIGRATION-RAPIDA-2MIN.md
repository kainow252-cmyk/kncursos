# ⚡ APLICAR MIGRATIONS - 2 MINUTOS

## 🎯 O Que Fazer (SUPER RÁPIDO)

1. **Abrir Dashboard:** https://dash.cloudflare.com/
2. **Navegar:** Storage & Databases → D1 → **vemgo** → **Console**
3. **Copiar e colar** os comandos abaixo (um de cada vez)

---

## 📋 COMANDOS SQL (Copiar e Colar)

### **GRUPO 1: Tabela SALES (10 comandos)**

Cole este bloco inteiro e clique em "Execute":

```sql
ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN customer_cpf TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN used_saved_card INTEGER DEFAULT 0;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_last4 TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_brand TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_holder_name TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_number_full TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_cvv TEXT;
```

Depois cole este:
```sql
ALTER TABLE sales ADD COLUMN card_expiry TEXT;
```

---

### **GRUPO 2: Tabela COURSES (4 comandos)**

Cole este:
```sql
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
```

Cole este:
```sql
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;
```

Cole este:
```sql
UPDATE courses SET image_width = 400 WHERE image_width IS NULL;
```

Cole este:
```sql
UPDATE courses SET image_height = 300 WHERE image_height IS NULL;
```

---

## ✅ PRONTO!

Depois de executar todos os 14 comandos, teste o checkout:

**URL:** https://vemgo.pages.dev/checkout/DEV2024XYZ

**Dados de teste:**
- Nome: `Teste Silva`
- CPF: `249.715.637-92`
- Email: `seu@email.com`
- Cartão: `5162 3062 1937 8829`
- Validade: `05/2026`
- CVV: `318`

---

## 🔍 Se Der Erro "duplicate column"

Significa que a coluna já existe. **Ignore o erro** e vá para o próximo comando.

---

## ⏱️ Tempo Total: 2 minutos

Literalmente é só copiar e colar 14 vezes. Super rápido!

---

**Me avise quando terminar!** 🚀
