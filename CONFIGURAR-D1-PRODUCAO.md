# 🔧 Configurar Banco D1 no Cloudflare Pages

## 🚨 Problema Identificado

```
❌ ERROR 500: Failed to load resource
❌ Edição de cursos não funciona
```

**Causa**: O banco de dados D1 não está vinculado (bind) ao projeto Cloudflare Pages em produção.

---

## ✅ Solução: Vincular D1 Database

### Passo 1: Verificar Database ID

**Seu Database ID** (de wrangler.jsonc):
```
database_id: 6783bc59-1fd5-48b4-894b-98c77e6ca75a
database_name: vemgo
```

### Passo 2: Acessar Cloudflare Dashboard

1. **Login**: https://dash.cloudflare.com/
2. **Workers & Pages** (menu lateral)
3. Selecione o projeto **vemgo**
4. Clique na aba **Settings**
5. Role até a seção **Bindings**

### Passo 3: Adicionar D1 Binding

1. Na seção **Functions**, clique em **Add**
2. Selecione **D1 database**
3. Preencha:
   - **Variable name**: `DB` (exatamente assim, maiúsculo)
   - **D1 database**: Selecione `vemgo` da lista
4. Clique em **Save**

**Screenshot de referência**:
```
┌─────────────────────────────────────────────┐
│ Add binding                                 │
├─────────────────────────────────────────────┤
│ Type: D1 database                           │
│                                             │
│ Variable name: DB                           │
│ D1 database: vemgo ▼                     │
│                                             │
│ [Cancel]  [Save]                            │
└─────────────────────────────────────────────┘
```

---

## 🔍 Verificar se D1 Existe

### Opção 1: Via CLI

```bash
# Listar todos os databases D1
npx wrangler d1 list

# Você deve ver:
# ┌──────────────────────────────────┬──────────┬─────────────┐
# │ Database ID                      │ Name     │ Created     │
# ├──────────────────────────────────┼──────────┼─────────────┤
# │ 6783bc59-1fd5-48b4-894b-98c77e6ca75a │ vemgo │ 2024-03-13  │
# └──────────────────────────────────┴──────────┴─────────────┘
```

### Opção 2: Via Dashboard

1. Acesse: https://dash.cloudflare.com/
2. **Storage & Databases** → **D1**
3. Você deve ver o database **vemgo**

---

## 🆕 Se o Database NÃO Existir em Produção

Se o database D1 só existe localmente, você precisa criá-lo em produção:

### Criar D1 em Produção

```bash
# 1. Criar database remoto
npx wrangler d1 create vemgo

# 2. Copiar o database_id retornado
# Exemplo: 6783bc59-1fd5-48b4-894b-98c77e6ca75a

# 3. Verificar migrations
ls migrations/

# 4. Aplicar migrations no database remoto
npx wrangler d1 migrations apply vemgo --remote

# 5. Verificar se funcionou
npx wrangler d1 execute vemgo --remote --command="SELECT COUNT(*) FROM courses"

# Deve retornar: {"count": 60}
```

### Popular Banco em Produção

Se o banco estiver vazio, execute os scripts:

```bash
# 1. Adicionar cursos
npx wrangler d1 execute vemgo --remote --file=./seed-add-courses.sql

# 2. Adicionar payment links
npx wrangler d1 execute vemgo --remote --file=./fix-payment-links.sql

# 3. Adicionar PDFs
npx wrangler d1 execute vemgo --remote --file=./add-pdfs.sql

# 4. Verificar
npx wrangler d1 execute vemgo --remote --command="SELECT COUNT(*) FROM courses"
npx wrangler d1 execute vemgo --remote --command="SELECT COUNT(*) FROM payment_links"
```

---

## 🧪 Testar Após Configuração

### Teste 1: API de Cursos

```bash
# Listar cursos
curl https://vemgo.pages.dev/api/courses | jq 'length'

# Deve retornar: 60
```

### Teste 2: Editar Curso (Admin)

```bash
# 1. Fazer login
curl -X POST https://vemgo.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"vemgo2024"}' \
  -c /tmp/cookies.txt

# 2. Editar curso
curl -X PUT https://vemgo.pages.dev/api/courses/1 \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{
    "title": "Curso Atualizado",
    "description": "Descrição atualizada",
    "price": 199.90,
    "content": "Novo conteúdo",
    "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    "pdf_url": "https://example.com/pdf1.pdf",
    "category": "Marketing Digital",
    "featured": 1,
    "active": 1
  }'

# Deve retornar: {"success": true}
```

### Teste 3: Ver no Admin

1. Acesse: https://vemgo.pages.dev/login
2. Login: `admin` / `vemgo2024`
3. Dashboard deve mostrar os cursos
4. Editar um curso deve funcionar

---

## 📋 Checklist Completo

### Database D1

- [ ] Database `vemgo` existe em produção
- [ ] Database ID: `6783bc59-1fd5-48b4-894b-98c77e6ca75a`
- [ ] Migrations aplicadas com `--remote`
- [ ] Dados populados (60 cursos)
- [ ] Payment links criados

### Cloudflare Pages Bindings

- [ ] D1 binding configurado
- [ ] Variable name: `DB`
- [ ] Database selecionado: `vemgo`
- [ ] Binding salvo

### Testes

- [ ] GET /api/courses retorna 60 cursos
- [ ] PUT /api/courses/:id funciona (status 200)
- [ ] Dashboard admin mostra cursos
- [ ] Edição no admin funciona

---

## 🔍 Debug

### Ver Logs de Erro

```bash
# Logs em tempo real
npx wrangler pages deployment tail --project-name vemgo

# Testar API
curl https://vemgo.pages.dev/api/courses/1

# Ver erro completo
npx wrangler pages deployment tail --project-name vemgo | grep -i error
```

### Erros Comuns

#### "DB is not defined"

```
❌ Erro: DB is not defined
✅ Solução: Adicionar D1 binding no Cloudflare Pages
```

#### "no such table: courses"

```
❌ Erro: no such table: courses
✅ Solução: Aplicar migrations com --remote
```

#### "database_id not found"

```
❌ Erro: database_id not found
✅ Solução: Criar database D1 em produção
```

---

## 📚 Comandos Úteis

```bash
# Listar databases
npx wrangler d1 list

# Criar database remoto
npx wrangler d1 create vemgo

# Aplicar migrations (remoto)
npx wrangler d1 migrations apply vemgo --remote

# Executar SQL (remoto)
npx wrangler d1 execute vemgo --remote --command="SELECT * FROM courses LIMIT 5"

# Executar arquivo SQL (remoto)
npx wrangler d1 execute vemgo --remote --file=./seed-add-courses.sql

# Ver info do database
npx wrangler d1 info vemgo

# Backup (local)
npx wrangler d1 execute vemgo --local --command="SELECT * FROM courses" > backup-courses.json

# Restaurar (remoto)
npx wrangler d1 execute vemgo --remote --file=./backup-courses.sql
```

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────┐
│ LOCAL (funcionando)                             │
│ ✅ Database: .wrangler/state/v3/d1/vemgo     │
│ ✅ 60 cursos                                    │
│ ✅ API funcionando                              │
└─────────────────────────────────────────────────┘
                    ↓
              [PROBLEMA]
                    ↓
┌─────────────────────────────────────────────────┐
│ PRODUÇÃO (não configurado)                      │
│ ❌ D1 binding: NÃO configurado                  │
│ ❌ API: Erro 500                                │
│ ❌ Admin: Não carrega cursos                    │
└─────────────────────────────────────────────────┘
                    ↓
              [SOLUÇÃO]
                    ↓
┌─────────────────────────────────────────────────┐
│ 1. Criar D1 remoto (se não existir)            │
│    npx wrangler d1 create vemgo              │
│                                                 │
│ 2. Aplicar migrations                           │
│    npx wrangler d1 migrations apply --remote    │
│                                                 │
│ 3. Popular dados                                │
│    npx wrangler d1 execute --remote --file=...  │
│                                                 │
│ 4. Adicionar binding no Cloudflare             │
│    Settings → Bindings → Add → D1              │
│    Variable: DB, Database: vemgo             │
│                                                 │
│ 5. Testar                                       │
│    curl /api/courses                            │
└─────────────────────────────────────────────────┘
                    ↓
              [RESULTADO]
                    ↓
┌─────────────────────────────────────────────────┐
│ PRODUÇÃO (funcionando)                          │
│ ✅ D1 binding: Configurado                      │
│ ✅ API: 200 OK                                  │
│ ✅ Admin: Carrega cursos                        │
│ ✅ Edição: Funciona                             │
└─────────────────────────────────────────────────┘
```

---

## ✅ Passo a Passo Rápido

1. **Verificar se D1 existe**:
   ```bash
   npx wrangler d1 list
   ```

2. **Se não existir, criar**:
   ```bash
   npx wrangler d1 create vemgo
   npx wrangler d1 migrations apply vemgo --remote
   ```

3. **Popular dados**:
   ```bash
   npx wrangler d1 execute vemgo --remote --file=./seed-add-courses.sql
   ```

4. **Configurar binding no Cloudflare**:
   - https://dash.cloudflare.com/
   - Workers & Pages → vemgo → Settings
   - Bindings → Add → D1
   - Variable: `DB`, Database: `vemgo`

5. **Testar**:
   ```bash
   curl https://vemgo.pages.dev/api/courses
   ```

---

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: Fácil  
**Prioridade**: 🚨 **ALTA** (API não funciona sem isso)

---

**Última atualização**: 2026-03-13
