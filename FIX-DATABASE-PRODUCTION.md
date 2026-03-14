# 🔧 Fix: Atualizar Schema do Banco de Produção

## Problema
O erro 500 ao editar cursos acontece porque o banco de **produção** não tem as colunas `image_width` e `image_height` que foram adicionadas recentemente.

## Solução

### Opção 1: Via Cloudflare Dashboard (RECOMENDADO)

1. Acesse: https://dash.cloudflare.com/
2. Vá em: **Storage & Databases** → **D1** → **kncursos**
3. Clique na aba **"Console"**
4. Execute os comandos SQL abaixo **um por um**:

```sql
-- 1. Verificar estrutura atual
PRAGMA table_info(courses);
```

Se as colunas `image_width` e `image_height` **NÃO** aparecerem, execute:

```sql
-- 2. Adicionar colunas
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;

-- 3. Atualizar cursos existentes
UPDATE courses SET image_width = 400 WHERE image_width IS NULL;
UPDATE courses SET image_height = 300 WHERE image_height IS NULL;

-- 4. Verificar se funcionou
SELECT id, title, price, image_width, image_height FROM courses LIMIT 5;
```

### Opção 2: Via Wrangler (se tiver autenticação configurada)

```bash
# Adicionar colunas
npx wrangler d1 execute kncursos --remote --command="ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400"
npx wrangler d1 execute kncursos --remote --command="ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300"

# Atualizar existentes
npx wrangler d1 execute kncursos --remote --command="UPDATE courses SET image_width = 400 WHERE image_width IS NULL"
npx wrangler d1 execute kncursos --remote --command="UPDATE courses SET image_height = 300 WHERE image_height IS NULL"
```

## Verificação

Depois de executar o SQL:

1. Acesse: https://kncursos.pages.dev/admin
2. Login: `admin` / `kncursos2024`
3. Clique em **"Editar"** em qualquer curso
4. Altere o preço
5. Clique em **"Atualizar Curso"**
6. ✅ Deve mostrar "Curso atualizado com sucesso!"

## Status Atual

- ✅ **Local**: Funcionando (colunas adicionadas)
- ⏳ **Produção**: Aguardando execução do SQL

## Arquivos

- `fix-production-db.sql` - Script SQL completo
- `add-image-dimensions.sql` - Script original (já aplicado no local)
