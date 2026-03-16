# 🔧 FIX: Schema D1 Production - Adicionar Colunas Faltantes

## ❌ Problema Identificado

**Erro:** `D1_ERROR: no such column: category: SQLITE_ERROR`

**Causa:** A tabela `courses` no banco D1 de **produção** não tem as colunas `category` e `featured`.

**Local:** Endpoint `PUT /api/courses/:id` em https://vemgo.pages.dev/api/courses/1

**Sintoma:** Erro 500 ao tentar editar curso no painel admin.

---

## ✅ Solução: Adicionar Colunas via SQL

### **Opção 1: Via Cloudflare Dashboard (RECOMENDADO)**

1. **Acesse o D1 Database:**
   - Abra: https://dash.cloudflare.com/
   - Vá em: **Storage & Databases → D1**
   - Clique no database: **vemgo**

2. **Execute o SQL no Console:**
   - Clique na aba **Console**
   - Cole o seguinte SQL:

```sql
-- Adicionar coluna category
ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Adicionar coluna featured  
ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
```

3. **Clique em "Execute"**

4. **Verificar Schema Atualizado:**
```sql
PRAGMA table_info(courses);
```

Você deve ver as novas colunas:
```
| cid | name        | type    | notnull | dflt_value | pk |
|-----|-------------|---------|---------|------------|-----|
| 0   | id          | INTEGER | 1       | NULL       | 1   |
| 1   | title       | TEXT    | 1       | NULL       | 0   |
| 2   | description | TEXT    | 0       | NULL       | 0   |
| 3   | price       | REAL    | 1       | NULL       | 0   |
| 4   | content     | TEXT    | 0       | NULL       | 0   |
| 5   | image_url   | TEXT    | 0       | NULL       | 0   |
| 6   | pdf_url     | TEXT    | 0       | NULL       | 0   |
| 7   | active      | INTEGER | 0       | 1          | 0   |
| 8   | created_at  | DATETIME| 0       | CURRENT... | 0   |
| 9   | category    | TEXT    | 0       | 'Geral'    | 0   |  ← NOVO
| 10  | featured    | INTEGER | 0       | 0          | 0   |  ← NOVO
```

---

### **Opção 2: Via Wrangler (SE CONSEGUIR AUTENTICAR)**

```bash
# Executar SQL no banco remoto
cd /home/user/webapp
npx wrangler d1 execute vemgo --file=fix-schema-production.sql --remote

# Verificar schema
npx wrangler d1 execute vemgo --command="PRAGMA table_info(courses);" --remote
```

---

## 🧪 Testar Após Fix

### **1. Testar API Diretamente:**
```bash
curl -X PUT https://vemgo.pages.dev/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Teste",
    "price": 199.90,
    "description": "Teste",
    "content": "Conteúdo teste",
    "category": "Marketing Digital",
    "featured": 1,
    "active": 1,
    "image_url": "https://images.unsplash.com/photo-1",
    "pdf_url": "https://example.com/pdf.pdf"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "affected": 1
}
```

### **2. Testar no Admin:**
1. Abra: https://vemgo.pages.dev/login
2. Login: `admin` / `vemgo2024`
3. Clique em **Editar** em qualquer curso
4. Altere qualquer campo
5. Clique em **Salvar Curso**
6. Deve exibir: ✅ **Curso atualizado com sucesso!**

---

## 📊 Checklist de Verificação

| Item | Status |
|------|--------|
| ✅ Identificado erro: `no such column: category` | ✅ |
| ✅ SQL criado: `fix-schema-production.sql` | ✅ |
| ⬜ SQL executado no D1 Production (Dashboard) | ⏳ |
| ⬜ Schema verificado com `PRAGMA table_info` | ⏳ |
| ⬜ Teste API com `curl` retorna `success: true` | ⏳ |
| ⬜ Admin salva curso sem erro 500 | ⏳ |

---

## 🎯 Resumo

**Problema:** Colunas `category` e `featured` faltando no D1 Production.

**Solução:** Execute o SQL no Cloudflare Dashboard → D1 → vemgo → Console.

**Verificação:** Teste com `curl` e no painel admin.

**Próximo passo:** Acesse https://dash.cloudflare.com/ agora e execute o SQL! 🚀
