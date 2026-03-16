# 🔍 Debug Erro 500 - Logs Detalhados Ativados

## ✅ Deploy Realizado com Logs Completos

**URL de teste**: https://ccae7e64.vemgo.pages.dev  
**Bundle**: 388.01 kB

---

## 🧪 Como Testar e Ver os Logs

### Passo 1: Abrir Terminal

Abra um terminal e execute:

```bash
cd /home/user/webapp
npx wrangler pages deployment list --project-name vemgo
```

Copie o **Deployment ID** mais recente (ex: `ccae7e64`)

### Passo 2: Monitorar Logs em Tempo Real

```bash
npx wrangler pages deployment tail vemgo ccae7e64
```

Deixe este terminal aberto!

### Passo 3: Editar Curso no Admin

1. Abra nova aba do navegador
2. Acesse: https://vemgo.pages.dev/login
3. Login: `admin` / `vemgo2024`
4. Clique em **"Editar"** em qualquer curso
5. Altere algum campo (ex: título)
6. Clique em **"Salvar Alterações"**

### Passo 4: Ver os Logs

Volte para o terminal com os logs. Você verá algo como:

**Se funcionar** ✅:
```
[UPDATE COURSE] ==================== INÍCIO ====================
[UPDATE COURSE] Step 1: Parsing request...
[UPDATE COURSE] Step 2: Request parsed successfully
[UPDATE COURSE] ID: 1
[UPDATE COURSE] Body: {
  "title": "Curso Atualizado",
  "price": 199.90,
  ...
}
[UPDATE COURSE] Step 3: Validating...
[UPDATE COURSE] Step 4: Preparing values...
[UPDATE COURSE] Prepared values:
  - title: Curso Atualizado
  - price: 199.9
  - featured: 1
  - active: 1
[UPDATE COURSE] Step 5: Executing UPDATE...
[UPDATE COURSE] Step 6: UPDATE executed successfully!
[UPDATE COURSE] ✅ Sucesso! Affected rows: 1
[UPDATE COURSE] ==================== FIM ====================
```

**Se der erro** ❌:
```
[UPDATE COURSE] ==================== INÍCIO ====================
[UPDATE COURSE] Step 1: Parsing request...
[UPDATE COURSE] ==================== ERRO ====================
[UPDATE COURSE] ❌ Error type: TypeError
[UPDATE COURSE] ❌ Error message: Cannot read property 'prepare' of undefined
[UPDATE COURSE] ❌ Error stack: ...
[UPDATE COURSE] ==================== FIM ERRO ====================
```

---

## 🔍 Alternativa: Ver Logs no Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com/
2. **Workers & Pages** → **vemgo**
3. Clique no deployment mais recente (https://ccae7e64.vemgo.pages.dev)
4. Aba **"Logs"** ou **"Real-time Logs"**
5. Edite curso no admin
6. Veja logs aparecerem em tempo real

---

## 📋 Possíveis Erros e Soluções

### Erro 1: "DB is not defined"

```
❌ [UPDATE COURSE] ❌ DB não está disponível
```

**Causa**: Binding D1 não configurado  
**Solução**:
1. Verificar `wrangler.jsonc` tem binding D1
2. Fazer novo deploy
3. Verificar em Cloudflare Dashboard → Settings → Bindings

### Erro 2: "Cannot read property 'prepare' of undefined"

```
❌ TypeError: Cannot read property 'prepare' of undefined
```

**Causa**: DB é undefined  
**Solução**: Mesmo que Erro 1

### Erro 3: "SQLITE_ERROR: no such table"

```
❌ Error: SQLITE_ERROR: no such table: courses
```

**Causa**: Tabela não existe no database  
**Solução**: Criar tabelas via D1 Console (ver guias anteriores)

### Erro 4: "Título e preço são obrigatórios"

```
❌ [UPDATE COURSE] ❌ Campos obrigatórios faltando
```

**Causa**: Frontend não está enviando title ou price  
**Solução**: Verificar formulário do admin

### Erro 5: "SQLITE_CONSTRAINT"

```
❌ Error: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
```

**Causa**: Tentando inserir/atualizar com referência inválida  
**Solução**: Verificar integridade dos dados

---

## 🧪 Teste Local Primeiro

Antes de testar em produção, teste localmente:

```bash
# Terminal 1: Ver logs
pm2 logs vemgo --nostream --lines 100 | grep "UPDATE COURSE"

# Terminal 2: Testar API
curl -X PUT http://localhost:3000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste Local",
    "price": 199.90,
    "description": "Teste",
    "content": "Conteúdo",
    "category": "Marketing Digital",
    "featured": 1,
    "active": 1
  }'
```

**Resultado esperado**:
```
{"success":true,"affected":1}
```

---

## 📝 O Que Mudou

### Logs Adicionados (Step by Step)

```typescript
console.log('[UPDATE COURSE] Step 1: Parsing request...')
console.log('[UPDATE COURSE] Step 2: Request parsed successfully')
console.log('[UPDATE COURSE] Step 3: Validating...')
console.log('[UPDATE COURSE] Step 4: Preparing values...')
console.log('[UPDATE COURSE] Step 5: Executing UPDATE...')
console.log('[UPDATE COURSE] Step 6: UPDATE executed successfully!')
```

### Tratamento de Null

**Antes**:
```typescript
description || ''  // String vazia
```

**Depois**:
```typescript
description || null  // NULL do SQL
```

### Logs de Erro Detalhados

```typescript
catch (error) {
  console.error('[UPDATE COURSE] ❌ Error type:', error.constructor.name)
  console.error('[UPDATE COURSE] ❌ Error message:', error.message)
  console.error('[UPDATE COURSE] ❌ Error stack:', error.stack)
}
```

---

## 🎯 Checklist de Debug

- [ ] Deploy feito (https://ccae7e64.vemgo.pages.dev)
- [ ] Terminal aberto com `wrangler pages deployment tail`
- [ ] Admin aberto (https://vemgo.pages.dev/login)
- [ ] Tentou editar curso
- [ ] Viu logs no terminal
- [ ] Identificou em qual "Step" o erro aconteceu
- [ ] Copiou mensagem de erro completa

---

## 📞 Próximo Passo

**Faça o teste** e me envie os logs que aparecerem!

Especificamente:
1. Em qual **Step** o erro aconteceu?
2. Qual a **mensagem de erro** completa?
3. O que está no **Body** que foi enviado?

Com essas informações, posso identificar exatamente o problema! 🔍

---

**Última atualização**: 2026-03-13  
**Deploy**: https://ccae7e64.vemgo.pages.dev  
**Status**: Aguardando teste com logs
