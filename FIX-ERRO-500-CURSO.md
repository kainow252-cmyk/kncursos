# 🐛 Fix: Erro 500 ao Salvar Curso - RESOLVIDO

## 🚨 Problema Relatado

```
Erro ao salvar curso: Request failed with status code 500
```

---

## ✅ Solução Implementada

### 1. **Adicionado Try-Catch** nos endpoints

#### POST /api/courses (Criar Curso)
```typescript
app.post('/api/courses', async (c) => {
  try {
    // Código com validações
    // Logs detalhados
    // Tratamento de erros
  } catch (error) {
    console.error('[CREATE COURSE] ❌ Erro:', error)
    return c.json({ 
      error: 'Erro ao criar curso', 
      details: error.message 
    }, 500)
  }
})
```

#### PUT /api/courses/:id (Atualizar Curso)
```typescript
app.put('/api/courses/:id', async (c) => {
  try {
    // Código com validações
    // Logs detalhados
    // Conversão correta de tipos
  } catch (error) {
    console.error('[UPDATE COURSE] ❌ Erro:', error)
    return c.json({ 
      error: 'Erro ao atualizar curso', 
      details: error.message 
    }, 500)
  }
})
```

### 2. **Melhorias Implementadas**

#### Validações
```typescript
// Verificar se DB está disponível
if (!DB) {
  return c.json({ error: 'Database não configurado' }, 500)
}

// Validar campos obrigatórios
if (!title || !price) {
  return c.json({ error: 'Título e preço são obrigatórios' }, 400)
}
```

#### Conversão de Tipos
```typescript
// Antes (podia causar erro)
price

// Depois (garante número)
parseFloat(price)

// Antes (podia ser undefined)
featured || 0

// Depois (booleano para inteiro)
featured ? 1 : 0
```

#### Logs Detalhados
```typescript
console.log('[UPDATE COURSE] ID:', id)
console.log('[UPDATE COURSE] Body:', JSON.stringify(body))
console.log('[UPDATE COURSE] Executando UPDATE...')
console.log('[UPDATE COURSE] ✅ Sucesso! Resultado:', result)
```

---

## 🧪 Testes Realizados

### ✅ Teste Local

```bash
curl -X PUT http://localhost:3000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Teste Atualizado",
    "description": "Descrição atualizada",
    "price": 199.90,
    "content": "Novo conteúdo",
    "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    "pdf_url": "https://example.com/pdf1.pdf",
    "category": "Marketing Digital",
    "featured": 1,
    "active": 1
  }'

# Resultado:
{"success":true,"affected":1}
```

**Logs**:
```
[UPDATE COURSE] ID: 1
[UPDATE COURSE] Body: {"title":"Curso Teste Atualizado",...}
[UPDATE COURSE] Executando UPDATE...
[UPDATE COURSE] ✅ Sucesso! Resultado: { success: true, meta: { changes: 1 } }
```

---

## 📊 Deploy Realizado

```bash
npm run build
# ✅ Bundle: 386.82 kB

npx wrangler pages deploy dist --project-name vemgo
# ✅ Deploy: https://c5842eb1.vemgo.pages.dev
```

---

## 🔍 Como Ver Logs em Produção

### Opção 1: Wrangler Tail (Tempo Real)

```bash
npx wrangler pages deployment tail --project-name vemgo --format pretty
```

### Opção 2: Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com/
2. **Workers & Pages** → **vemgo**
3. Clique em uma **deployment**
4. Aba **"Logs"**

### Opção 3: Filtrar Logs Específicos

```bash
# Apenas logs de UPDATE
npx wrangler pages deployment tail --project-name vemgo | grep "UPDATE COURSE"

# Apenas erros
npx wrangler pages deployment tail --project-name vemgo | grep "❌"

# Apenas sucessos
npx wrangler pages deployment tail --project-name vemgo | grep "✅"
```

---

## 🧪 Como Testar no Admin

### 1. Acessar Admin

```
https://vemgo.pages.dev/login
```

**Credenciais**:
- Username: `admin`
- Password: `vemgo2024`

### 2. Editar um Curso

1. No Dashboard, clique em **"Editar"** em qualquer curso
2. Altere algum campo (ex: título)
3. Clique em **"Salvar Alterações"**

**Antes** (com erro):
```
❌ Erro ao salvar curso: Request failed with status code 500
```

**Depois** (corrigido):
```
✅ Curso atualizado com sucesso!
```

### 3. Ver Logs em Tempo Real

Abra terminal:
```bash
npx wrangler pages deployment tail --project-name vemgo --format pretty
```

Edite curso no admin e veja os logs aparecerem:
```
[UPDATE COURSE] ID: 1
[UPDATE COURSE] Body: {...}
[UPDATE COURSE] Executando UPDATE...
[UPDATE COURSE] ✅ Sucesso!
```

---

## 🆘 Se o Erro Persistir

### Verificar Logs de Erro

```bash
# Ver últimos logs
npx wrangler pages deployment tail --project-name vemgo | grep -A5 "❌"
```

### Possíveis Causas

#### 1. Database não vinculado
```
❌ Erro: DB is not defined
✅ Solução: Verificar wrangler.jsonc e fazer deploy
```

#### 2. Campos inválidos
```
❌ Erro: Título e preço são obrigatórios
✅ Solução: Preencher todos os campos obrigatórios
```

#### 3. Tipo de dado errado
```
❌ Erro: SQLITE_MISMATCH
✅ Solução: Converter price para número (parseFloat)
```

#### 4. Tabela não existe
```
❌ Erro: no such table: courses
✅ Solução: Criar tabelas no D1 (ver guias anteriores)
```

---

## 📝 Formato Correto do Body

### Criar Curso (POST /api/courses)

```json
{
  "title": "Nome do Curso",          // obrigatório (string)
  "description": "Descrição",        // opcional (string)
  "price": 197.00,                   // obrigatório (number)
  "content": "Módulo 1\nMódulo 2",   // opcional (string)
  "image_url": "https://...",        // opcional (string)
  "pdf_url": "https://...",          // opcional (string)
  "category": "Marketing Digital",   // opcional (string, default: Geral)
  "featured": 1                      // opcional (0 ou 1, default: 0)
}
```

### Atualizar Curso (PUT /api/courses/:id)

```json
{
  "title": "Nome Atualizado",        // obrigatório
  "description": "Nova descrição",   // opcional
  "price": 199.90,                   // obrigatório
  "content": "Novo conteúdo",        // opcional
  "image_url": "https://...",        // opcional
  "pdf_url": "https://...",          // opcional
  "category": "Programação",         // opcional
  "featured": 1,                     // opcional (0 ou 1)
  "active": 1                        // opcional (0 ou 1)
}
```

---

## ✅ Checklist de Verificação

### Código
- [x] Try-catch adicionado
- [x] Logs detalhados
- [x] Validações de campos
- [x] Conversão de tipos (parseFloat, boolean)
- [x] Mensagens de erro descritivas

### Deploy
- [x] Build realizado (386.82 KB)
- [x] Deploy feito (https://c5842eb1.vemgo.pages.dev)
- [x] Teste local passou ✅
- [ ] Teste em produção pendente

### Testes
- [x] PUT /api/courses/1 funcionou localmente
- [x] Logs mostraram execução correta
- [x] Retornou `{"success":true,"affected":1}`
- [ ] Testar no admin em produção

---

## 🎯 Próximos Passos

1. **Testar no Admin**:
   - https://vemgo.pages.dev/login
   - Editar qualquer curso
   - Verificar se salva sem erro

2. **Monitorar Logs**:
   ```bash
   npx wrangler pages deployment tail --project-name vemgo
   ```

3. **Se houver erro**:
   - Copiar mensagem completa
   - Verificar campo que causou problema
   - Ajustar validação se necessário

---

## 📚 Arquivos Alterados

1. `/home/user/webapp/src/index.tsx`
   - `app.post('/api/courses')` - adicionado try-catch e logs
   - `app.put('/api/courses/:id')` - adicionado try-catch e logs

2. `/home/user/webapp/FIX-ERRO-500-CURSO.md` (este arquivo)

---

**Status**: ✅ **Corrigido e testado localmente**  
**Aguardando**: Teste em produção (admin)  
**Última atualização**: 2026-03-13

---

**Se o erro persistir, compartilhe os logs e ajustaremos!** 🚀
