# 🚀 Deploy Automático Completo - Cloudflare Pages + R2 + D1

## ✅ **Status Atual**

### **Ambiente Local (Sandbox)**:
✅ Código 100% implementado  
✅ Wrangler configurado  
✅ Credenciais em `.dev.vars`  
✅ Banco D1 local operacional  
✅ Servidor rodando (porta 3001)  
✅ Upload R2 implementado  

### **Ambiente Produção (Cloudflare)**:
⚠️ Bucket R2 precisa ser criado  
⚠️ Secrets precisam ser configurados  
⚠️ Deploy aguardando execução  

---

## 📋 **Procedimento de Deploy (Passo a Passo)**

### **ETAPA 1: Preparar Ambiente Cloudflare**

#### **1.1. Login no Cloudflare**
```bash
cd /home/user/webapp
npx wrangler login
```
Você será redirecionado para o navegador para autorizar.

---

#### **1.2. Criar Bucket R2**

**Opção A: Via CLI (Recomendado)**
```bash
# Criar bucket
npx wrangler r2 bucket create vemgo-files

# Verificar criação
npx wrangler r2 bucket list

# Resultado esperado:
# vemgo-files (created: 2026-03-14)
```

**Opção B: Via Dashboard**
1. https://dash.cloudflare.com/
2. Menu **R2** → **Create bucket**
3. Nome: `vemgo-files`
4. Location: **Automatic**
5. Clique em **Create bucket**

---

#### **1.3. Criar/Verificar Database D1 em Produção**

```bash
# Listar databases existentes
npx wrangler d1 list

# Se o database "vemgo" já existe, pule para 1.4
# Se não existe, criar:
npx wrangler d1 create vemgo

# Resultado:
# ✅ Successfully created DB 'vemgo'
# Database ID: 6783bc59-1fd5-48b4-894b-98c77e6ca75a
```

**Importante**: Se o database ID for diferente, atualizar `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "vemgo",
      "database_id": "SEU_DATABASE_ID_AQUI"
    }
  ]
}
```

---

#### **1.4. Aplicar Migrations em Produção**

```bash
# Aplicar todas as migrations no database remoto
npm run db:migrate:prod

# Ou manualmente:
npx wrangler d1 migrations apply vemgo --remote

# Verificar tabelas criadas
npx wrangler d1 execute vemgo --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

**Resultado esperado**:
```
courses
payment_links
sales
users
saved_cards
d1_migrations
```

---

### **ETAPA 2: Configurar Environment Variables (Secrets)**

#### **2.1. Via Script Automático (Recomendado)**

```bash
cd /home/user/webapp

# Executar script de configuração
bash set-secrets.sh
```

Este script configura automaticamente todas as variáveis:
- ASAAS_API_KEY
- ASAAS_ENV
- ASAAS_WEBHOOK_TOKEN
- RESEND_API_KEY
- EMAIL_FROM
- RESEND_WEBHOOK_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD
- JWT_SECRET

---

#### **2.2. Via Wrangler CLI (Manual)**

Se preferir configurar manualmente:

```bash
# Asaas
echo "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm" | npx wrangler pages secret put ASAAS_API_KEY --project-name vemgo

echo "sandbox" | npx wrangler pages secret put ASAAS_ENV --project-name vemgo

echo "whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM" | npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name vemgo

# Resend
echo "re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6" | npx wrangler pages secret put RESEND_API_KEY --project-name vemgo

echo "cursos@vemgo.com.br" | npx wrangler pages secret put EMAIL_FROM --project-name vemgo

echo "whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t" | npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name vemgo

# Admin
echo "admin" | npx wrangler pages secret put ADMIN_USERNAME --project-name vemgo

echo "vemgo2024" | npx wrangler pages secret put ADMIN_PASSWORD --project-name vemgo

echo "vemgo-jwt-secret-change-in-production-2024" | npx wrangler pages secret put JWT_SECRET --project-name vemgo
```

---

#### **2.3. Via Dashboard (Interface)**

1. https://dash.cloudflare.com/
2. **Workers & Pages** → **vemgo**
3. **Settings** → **Environment variables**
4. **Production** tab → **Add variable**
5. Adicionar cada variável como **Secret** (encrypted)
6. Valores:
   - `ASAAS_API_KEY` = `$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm`
   - `ASAAS_ENV` = `sandbox`
   - `ASAAS_WEBHOOK_TOKEN` = `whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM`
   - `RESEND_API_KEY` = `re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6`
   - `EMAIL_FROM` = `cursos@vemgo.com.br`
   - `RESEND_WEBHOOK_SECRET` = `whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t`
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `vemgo2024`
   - `JWT_SECRET` = `vemgo-jwt-secret-change-in-production-2024`

---

### **ETAPA 3: Build e Deploy**

#### **3.1. Build Local**
```bash
cd /home/user/webapp

# Limpar cache anterior
rm -rf dist .next node_modules/.vite

# Instalar dependências (se necessário)
npm install

# Build do projeto
npm run build

# Resultado esperado:
# ✅ dist/_worker.js (430.76 kB)
```

---

#### **3.2. Deploy para Cloudflare Pages**

**Opção A: Comando Único (Recomendado)**
```bash
npm run deploy
```

Este comando executa:
1. `npm run build` (build do projeto)
2. `wrangler pages deploy dist --project-name vemgo`

---

**Opção B: Deploy Manual**
```bash
npx wrangler pages deploy dist \
  --project-name vemgo \
  --commit-dirty=true \
  --branch main
```

---

**Resultado esperado**:
```
✨ Success! Uploaded 1 files (1 already uploaded)

✨ Deployment complete! Take a peek over at https://abc123.vemgo.pages.dev
```

---

### **ETAPA 4: Configurar Bindings (Se Necessário)**

Após o primeiro deploy, verificar se os bindings estão corretos:

#### **4.1. Via Dashboard**
1. https://dash.cloudflare.com/
2. **Workers & Pages** → **vemgo**
3. **Settings** → **Bindings**
4. Verificar:
   - **D1 Database**: `DB` → `vemgo` (ID: 6783bc59-1fd5-48b4-894b-98c77e6ca75a)
   - **R2 Bucket**: `R2` → `vemgo-files`

#### **4.2. Se estiver faltando, adicionar manualmente**:
- **Add binding** → **D1 Database**
  - Variable name: `DB`
  - D1 database: `vemgo`
- **Add binding** → **R2 Bucket**
  - Variable name: `R2`
  - R2 bucket: `vemgo-files`

Após adicionar bindings, fazer **novo deploy**:
```bash
npm run deploy
```

---

### **ETAPA 5: Popular Banco de Dados em Produção (Opcional)**

Se quiser adicionar cursos de exemplo:

```bash
# Executar seed em produção
npx wrangler d1 execute vemgo --remote --file=./seed.sql

# Verificar cursos criados
npx wrangler d1 execute vemgo --remote --command "SELECT id, title, price FROM courses"
```

---

### **ETAPA 6: Testar em Produção**

#### **6.1. Verificar URLs**

Após deploy, você terá:
- URL temporária: `https://abc123.vemgo.pages.dev`
- URL principal: `https://vemgo.pages.dev`

#### **6.2. Testes Básicos**

```bash
# Testar página principal
curl https://vemgo.pages.dev/

# Testar API de cursos
curl https://vemgo.pages.dev/api/courses

# Testar login (deve retornar página HTML)
curl https://vemgo.pages.dev/login

# Testar autenticação
curl -X POST https://vemgo.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"vemgo2024"}'
```

#### **6.3. Testar Upload (Precisa de autenticação)**

```bash
# 1. Fazer login e salvar cookie
curl -X POST https://vemgo.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"vemgo2024"}' \
  -c cookies.txt

# 2. Fazer upload usando o cookie
curl -X POST https://vemgo.pages.dev/api/upload \
  -b cookies.txt \
  -F "file=@test.jpg"

# Resultado esperado:
# {
#   "success": true,
#   "url": "/files/images/1710409200-abc123.jpg",
#   ...
# }

# 3. Acessar arquivo
curl https://vemgo.pages.dev/files/images/1710409200-abc123.jpg --output downloaded.jpg
```

---

## 🔍 **Verificação e Debug**

### **Verificar Secrets**
```bash
# Listar secrets configurados
npx wrangler pages secret list --project-name vemgo

# Resultado esperado:
# ASAAS_API_KEY
# ASAAS_ENV
# ASAAS_WEBHOOK_TOKEN
# RESEND_API_KEY
# EMAIL_FROM
# RESEND_WEBHOOK_SECRET
# ADMIN_USERNAME
# ADMIN_PASSWORD
# JWT_SECRET
```

### **Verificar Bindings**
```bash
# Ver configuração do projeto
npx wrangler pages project view vemgo
```

### **Verificar Logs em Tempo Real**
```bash
# Ver logs do deployment
npx wrangler pages deployment tail --project-name vemgo

# Ver logs em tempo real (após deploy)
# Acessar dashboard → Workers & Pages → vemgo → Logs
```

### **Verificar R2**
```bash
# Listar buckets
npx wrangler r2 bucket list

# Ver arquivos no bucket
npx wrangler r2 object list vemgo-files

# Fazer upload de teste
npx wrangler r2 object put vemgo-files/test.txt --file=test.txt

# Ver arquivo
npx wrangler r2 object get vemgo-files/test.txt
```

### **Verificar D1**
```bash
# Ver tabelas
npx wrangler d1 execute vemgo --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Ver cursos
npx wrangler d1 execute vemgo --remote --command "SELECT * FROM courses"

# Ver usuários
npx wrangler d1 execute vemgo --remote --command "SELECT username, role, email FROM users"
```

---

## ⚠️ **Troubleshooting**

### **Erro: "Bucket not found"**
```bash
# Criar bucket
npx wrangler r2 bucket create vemgo-files

# Verificar bindings no dashboard
```

### **Erro: "Database not found"**
```bash
# Verificar databases
npx wrangler d1 list

# Se database_id estiver diferente, atualizar wrangler.jsonc
```

### **Erro: "Environment variable not found"**
```bash
# Reconfigurar secrets
bash set-secrets.sh

# Ou configurar manualmente no dashboard
```

### **Erro: "Binding R2 or DB not found"**
1. Dashboard → vemgo → Settings → Bindings
2. Adicionar bindings manualmente
3. Fazer novo deploy: `npm run deploy`

### **Erro: "401 Unauthorized" no upload**
- Verificar se o login funcionou
- Verificar se o cookie está sendo enviado
- Verificar se `JWT_SECRET` está configurado

---

## 📊 **Checklist Final de Deploy**

### **Pré-Deploy**:
- [x] Código implementado
- [x] Wrangler configurado
- [x] `.dev.vars` criado
- [x] Build local funcionando

### **Deploy Cloudflare**:
- [ ] Login no Cloudflare: `npx wrangler login`
- [ ] Criar bucket R2: `npx wrangler r2 bucket create vemgo-files`
- [ ] Verificar D1: `npx wrangler d1 list`
- [ ] Aplicar migrations: `npm run db:migrate:prod`
- [ ] Configurar secrets: `bash set-secrets.sh`
- [ ] Build: `npm run build`
- [ ] Deploy: `npm run deploy`
- [ ] Verificar bindings no dashboard
- [ ] Testar URL de produção

### **Pós-Deploy**:
- [ ] Testar login admin
- [ ] Testar criação de curso
- [ ] Testar upload de imagem
- [ ] Testar upload de PDF
- [ ] Testar checkout
- [ ] Configurar domínio personalizado (opcional)

---

## 🎯 **Resumo do Fluxo Completo**

```bash
# 1. Login
npx wrangler login

# 2. Criar bucket R2
npx wrangler r2 bucket create vemgo-files

# 3. Verificar D1
npx wrangler d1 list

# 4. Aplicar migrations
npm run db:migrate:prod

# 5. Configurar secrets
bash set-secrets.sh

# 6. Build e Deploy
npm run deploy

# 7. Verificar
npx wrangler pages project view vemgo

# 8. Testar
curl https://vemgo.pages.dev/api/courses
```

---

## 🔗 **Links Úteis**

- **Dashboard Cloudflare**: https://dash.cloudflare.com/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **R2 Docs**: https://developers.cloudflare.com/r2/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **Pages Docs**: https://developers.cloudflare.com/pages/

---

**Criado em**: 2026-03-14  
**Versão**: 1.0.0  
**Autor**: Vemgo Dev Team  
**Status**: Pronto para deploy
