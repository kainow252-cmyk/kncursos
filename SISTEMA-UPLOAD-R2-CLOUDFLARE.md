# 📦 Sistema de Upload Automático R2 + Cloudflare

## ✅ **Status Atual do Sistema**

### **1. Código Implementado e Funcional**

O sistema de upload automático para Cloudflare R2 **está 100% implementado** no código-fonte (`src/index.tsx`):

✅ **Endpoint de Upload**: `/api/upload` (POST)
✅ **Endpoint de Download**: `/files/*` (GET)
✅ **Binding R2 configurado**: `wrangler.jsonc`
✅ **Criação automática de cursos**: Aceita `image_url` e `pdf_url`

---

## 🔧 **Componentes Implementados**

### **A. Binding R2 (wrangler.jsonc)**

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kncursos",
      "database_id": "6783bc59-1fd5-48b4-894b-98c77e6ca75a"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "kncursos-files"
    }
  ]
}
```

**Status**: ✅ Configurado no `wrangler.jsonc`

---

### **B. Upload de Arquivos (src/index.tsx linha 136-203)**

#### **Funcionalidades**:
✅ Upload de imagens (JPG, PNG, GIF, WEBP)
✅ Upload de PDFs
✅ Validação de tipo e tamanho (máximo 10MB)
✅ Geração de nomes únicos
✅ Organização em pastas (`images/` e `pdfs/`)
✅ Metadata de tipo de conteúdo

#### **Exemplo de Uso**:

```bash
# Upload de uma imagem
curl -X POST https://kncursos.pages.dev/api/upload \
  -F "file=@imagem.jpg"

# Resposta:
{
  "success": true,
  "url": "/files/images/1710409200-abc123.jpg",
  "key": "images/1710409200-abc123.jpg",
  "size": 245678,
  "type": "image/jpeg",
  "name": "imagem.jpg"
}
```

---

### **C. Servir Arquivos do R2 (src/index.tsx linha 206-237)**

#### **Funcionalidades**:
✅ Busca automática de arquivos no R2
✅ Cache headers configurados
✅ Content-Type correto
✅ Logs detalhados

#### **Exemplo de Acesso**:

```bash
# Acessar arquivo
curl https://kncursos.pages.dev/files/images/1710409200-abc123.jpg

# Acessar PDF
curl https://kncursos.pages.dev/files/pdfs/1710409200-abc456.pdf
```

---

### **D. Integração com Criação de Cursos (linha 245-296)**

O endpoint `/api/courses` (POST) aceita:

```json
{
  "title": "Novo Curso",
  "price": 197.00,
  "image_url": "/files/images/1710409200-abc123.jpg",  ← URL do R2
  "pdf_url": "/files/pdfs/1710409200-abc456.pdf",       ← URL do R2
  "category": "Geral",
  "featured": true
}
```

**Fluxo Automático**:
1. Admin faz upload da imagem → Recebe URL do R2
2. Admin faz upload do PDF → Recebe URL do R2
3. Admin cria curso usando as URLs recebidas
4. Sistema salva as URLs no banco D1
5. Usuários acessam os arquivos diretamente do R2

---

## 🌐 **Configuração do Cloudflare**

### **1. Bucket R2 (Precisa ser criado manualmente)**

#### **Opção A: Via Dashboard**
1. Acesse https://dash.cloudflare.com/
2. Menu **R2** → **Create bucket**
3. Nome: `kncursos-files`
4. Localização: **Automatic** (recomendado)
5. Clique em **Create bucket**

#### **Opção B: Via Wrangler CLI**

```bash
# Criar bucket R2
npx wrangler r2 bucket create kncursos-files

# Listar buckets
npx wrangler r2 bucket list

# Verificar binding
npx wrangler r2 bucket info kncursos-files
```

---

### **2. Database D1 (Já configurado)**

✅ **Database ID**: `6783bc59-1fd5-48b4-894b-98c77e6ca75a`
✅ **Nome**: `kncursos`
✅ **Status**: Operacional

---

### **3. Variáveis de Ambiente (Secrets)**

#### **Configuradas em .dev.vars (local)**:
✅ ASAAS_API_KEY
✅ ASAAS_ENV=sandbox
✅ ASAAS_WEBHOOK_TOKEN
✅ RESEND_API_KEY
✅ EMAIL_FROM
✅ RESEND_WEBHOOK_SECRET
✅ ADMIN_USERNAME=admin
✅ ADMIN_PASSWORD=kncursos2024
✅ JWT_SECRET

#### **Precisa configurar em produção** (Cloudflare Pages):

```bash
# Usar o script set-secrets.sh
cd /home/user/webapp
bash set-secrets.sh
```

Ou manualmente:
1. Dashboard → Workers & Pages → kncursos
2. Settings → Environment variables
3. Adicionar cada variável como **Secret** (encrypted)

---

## 📋 **Checklist de Deploy Completo**

### **Local (Sandbox) - ✅ COMPLETO**

- [x] Código implementado
- [x] Wrangler configurado
- [x] `.dev.vars` com credenciais
- [x] Banco D1 local criado e migrado
- [x] Servidor rodando (porta 3001)
- [x] Binding R2 configurado

---

### **Produção (Cloudflare) - ⚠️ PENDENTE**

#### **1. Criar Bucket R2**
- [ ] Acessar dashboard Cloudflare
- [ ] Criar bucket `kncursos-files`
- [ ] Ou executar: `npx wrangler r2 bucket create kncursos-files`

#### **2. Configurar Database D1**
- [ ] Criar database `kncursos-production` (ou usar o existente)
- [ ] Copiar database_id
- [ ] Atualizar `wrangler.jsonc` (se necessário)
- [ ] Executar migrations: `npm run db:migrate:prod`

#### **3. Configurar Environment Variables**
- [ ] Executar `bash set-secrets.sh`
- [ ] Ou configurar manualmente no dashboard

#### **4. Build e Deploy**
```bash
# Build do projeto
npm run build

# Deploy para Cloudflare Pages
npx wrangler pages deploy dist --project-name kncursos --commit-dirty=true

# Ou usar o comando combinado
npm run deploy
```

#### **5. Verificar Bindings**
- [ ] Dashboard → kncursos → Settings → Bindings
- [ ] Verificar se `DB` está ligado ao database correto
- [ ] Verificar se `R2` está ligado ao bucket `kncursos-files`

#### **6. Testar em Produção**
```bash
# Testar upload
curl -X POST https://kncursos.pages.dev/api/upload \
  -H "Cookie: auth_token=SEU_TOKEN" \
  -F "file=@test.jpg"

# Testar download
curl https://kncursos.pages.dev/files/images/ARQUIVO.jpg
```

---

## 🔒 **Segurança**

### **Arquivos Protegidos pelo .gitignore**:
✅ `.dev.vars` (credenciais locais)
✅ `.env` (não usado atualmente)
✅ `*.backup`, `*.tar.gz` (backups)
✅ `.wrangler/` (cache local)

### **Secrets em Produção**:
✅ Todos os secrets são criptografados no Cloudflare
✅ Não aparecem em logs ou código
✅ Acessíveis apenas via `c.env.*` no runtime

---

## 📊 **Limites e Custos**

### **Cloudflare Free Tier**:

#### **R2 Storage**:
- 10 GB de armazenamento
- 1 milhão de operações Classe A (write) por mês
- 10 milhões de operações Classe B (read) por mês
- ✅ **Sem custo de egress** (tráfego de saída)

#### **D1 Database**:
- 5 GB de armazenamento
- 5 milhões de leituras por dia
- 100 mil escritas por dia

#### **Workers/Pages**:
- 100 mil requests por dia (free)
- Ilimitado em plano pago ($5/mês)

---

## 🚀 **Como Usar o Sistema**

### **1. Fazer Upload de Arquivo**

#### **Via Interface Admin** (recomendado):
1. Login em `/admin`
2. Criar novo curso
3. Usar os campos de upload de imagem e PDF
4. Sistema faz upload automático para R2

#### **Via API**:
```bash
# Upload
curl -X POST http://localhost:3001/api/upload \
  -F "file=@curso.pdf"

# Resposta:
{
  "success": true,
  "url": "/files/pdfs/1710409200-abc123.pdf"
}
```

### **2. Criar Curso com Arquivos**

```bash
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Teste",
    "price": 197,
    "image_url": "/files/images/IMAGEM.jpg",
    "pdf_url": "/files/pdfs/ARQUIVO.pdf"
  }'
```

### **3. Acessar Arquivos**

```bash
# Imagem
curl http://localhost:3001/files/images/ARQUIVO.jpg

# PDF
curl http://localhost:3001/files/pdfs/ARQUIVO.pdf
```

---

## 🔍 **Debug e Logs**

### **Verificar R2 Local**:
```bash
# Ver arquivos no R2 local
ls -la /home/user/webapp/.wrangler/state/v3/r2/miniflare-R2BucketObject/

# Ver logs do servidor
cd /home/user/webapp && npm run dev:sandbox
```

### **Verificar R2 Produção**:
```bash
# Listar arquivos no bucket
npx wrangler r2 object list kncursos-files

# Ver info de um arquivo específico
npx wrangler r2 object get kncursos-files/images/ARQUIVO.jpg
```

---

## 📝 **Próximos Passos**

### **Imediato**:
1. ✅ Código implementado (100%)
2. ⚠️ Criar bucket R2 em produção
3. ⚠️ Configurar environment variables
4. ⚠️ Fazer deploy

### **Melhorias Futuras**:
- [ ] Configurar domínio customizado para R2 (ex: `cdn.kncursos.com.br`)
- [ ] Implementar resize de imagens automático
- [ ] Adicionar CDN na frente do R2
- [ ] Implementar cleanup de arquivos não usados
- [ ] Adicionar verificação de vírus (ClamAV)

---

## 🎯 **Resumo Executivo**

### ✅ **O que está pronto**:
- Código completo de upload/download
- Integração com D1 e R2
- Validações e segurança
- Sistema de pastas automático
- Logs e debug

### ⚠️ **O que falta**:
- Criar bucket R2 em produção (5 minutos)
- Configurar secrets em produção (script pronto)
- Fazer deploy (1 comando)

### 🎉 **Resultado Final**:
Após deploy, o sistema estará 100% automático:
1. Admin faz upload → R2
2. R2 retorna URL → Banco D1
3. Usuário acessa → R2 serve arquivo
4. Tudo integrado e funcionando!

---

**Criado em**: 2026-03-14  
**Versão**: 1.0.0  
**Status**: Código implementado, aguardando deploy em produção
