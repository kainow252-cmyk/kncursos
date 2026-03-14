# 🎯 PROBLEMA ENCONTRADO: Coluna "category" não existe

## ❌ Erro Identificado

```json
{
  "error": "Erro ao atualizar curso",
  "details": "D1_ERROR: no such column: category: SQLITE_ERROR",
  "type": "Error"
}
```

**Causa**: A tabela `courses` em **produção** não tem a coluna `category`!

---

## ✅ Solução: Adicionar Coluna "category"

### Opção 1: Via Cloudflare Dashboard (Mais Fácil)

1. **Acesse**: https://dash.cloudflare.com/
2. **Storage & Databases** → **D1**
3. Clique no database **kncursos**
4. Aba **"Console"**
5. Execute este SQL:

```sql
-- Adicionar coluna category
ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Verificar
SELECT id, title, category FROM courses LIMIT 5;
```

6. **Pronto!** A coluna foi adicionada.

---

### Opção 2: Via Migration (Melhor Prática)

#### Criar Migration

```bash
cd /home/user/webapp

# Criar arquivo de migration
cat > migrations/0002_add_category_column.sql << 'EOF'
-- Migration: Adicionar coluna category
-- Created: 2026-03-13

ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Atualizar cursos existentes com categorias apropriadas
UPDATE courses SET category = 'Marketing Digital' WHERE id IN (1, 4, 7, 8, 9);
UPDATE courses SET category = 'Tecnologia' WHERE id IN (2, 5, 12, 13, 14, 15, 16, 17);
UPDATE courses SET category = 'Programação' WHERE id IN (18, 19, 20, 21, 22, 23);
UPDATE courses SET category = 'Negócios Online' WHERE id IN (24, 25, 26, 27, 28, 29, 30, 31);
UPDATE courses SET category = 'Design' WHERE id IN (32, 33, 34, 35, 36, 37);
UPDATE courses SET category = 'Finanças' WHERE id IN (38, 39, 40, 41, 42, 43);
UPDATE courses SET category = 'Saúde e Bem-Estar' WHERE id IN (44, 45, 46, 47, 48, 49);
UPDATE courses SET category = 'Inteligência Artificial' WHERE id IN (50, 51, 52, 53, 54, 55);
UPDATE courses SET category = 'Idiomas' WHERE id IN (56, 57, 58, 59, 60, 61);
EOF
```

#### Aplicar Migration

```bash
# Produção
npx wrangler d1 migrations apply kncursos --remote

# Local (se necessário)
npx wrangler d1 migrations apply kncursos --local
```

---

## 🧪 Testar Após Correção

### Via cURL

```bash
curl -X PUT https://kncursos.pages.dev/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Atualizado",
    "price": 199.90,
    "description": "Teste",
    "content": "Conteúdo",
    "category": "Marketing Digital",
    "featured": 1,
    "active": 1
  }'

# Resultado esperado:
# {"success":true,"affected":1}
```

### Via Admin

1. https://kncursos.pages.dev/login
2. Login: `admin` / `kncursos2024`
3. Editar qualquer curso
4. Salvar
5. ✅ Deve funcionar!

---

## 📊 Por Que Aconteceu?

### Banco Local vs Produção

**Local** (funcionando):
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  price REAL,
  content TEXT,
  image_url TEXT,
  pdf_url TEXT,
  category TEXT DEFAULT 'Geral',  ← TEM
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Produção** (desatualizado):
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  price REAL,
  content TEXT,
  image_url TEXT,
  pdf_url TEXT,
  -- category TEXT DEFAULT 'Geral',  ← NÃO TEM!
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Causa**: O database em produção foi criado antes da coluna `category` ser adicionada, e a migration nunca foi aplicada.

---

## ✅ Checklist de Correção

- [ ] Acessar D1 Console no Cloudflare
- [ ] Executar `ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';`
- [ ] Verificar com `SELECT * FROM courses LIMIT 1;`
- [ ] Testar API: `curl -X PUT .../api/courses/1`
- [ ] Testar Admin: Editar curso e salvar
- [ ] Confirmar que funciona ✅

---

## 🚀 Comandos Rápidos

```bash
# Opção A: Via Dashboard (RECOMENDADO)
# 1. Acesse: https://dash.cloudflare.com/
# 2. Storage & Databases → D1 → kncursos → Console
# 3. Execute: ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

# Opção B: Via CLI (se funcionar)
npx wrangler d1 execute kncursos --remote \
  --command="ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';"

# Verificar
npx wrangler d1 execute kncursos --remote \
  --command="SELECT id, title, category FROM courses LIMIT 3;"
```

---

## 📝 Resumo

| Item | Status | Ação |
|------|--------|------|
| **Erro identificado** | ✅ | `no such column: category` |
| **Causa encontrada** | ✅ | Coluna não existe em produção |
| **Solução** | ⏳ | Adicionar coluna via D1 Console |
| **Teste** | ⏳ | Editar curso no admin |

---

**Próximo passo**: 
1. Adicione a coluna `category` via D1 Console
2. Teste novamente
3. Deve funcionar! ✅

---

**Última atualização**: 2026-03-13  
**Erro**: `SQLITE_ERROR: no such column: category`  
**Solução**: `ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';`
