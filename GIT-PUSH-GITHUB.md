# 📤 Guia de Push para GitHub - KN Cursos

## ✅ **Status Atual do Git**

### **Repositório Local**:
- ✅ Branch principal: `main`
- ✅ Remote configurado: `https://github.com/kainow252-cmyk/kncursos.git`
- ✅ Commits realizados: 15 commits (incluindo sessão atual)
- ✅ Último commit: `8ca8f2f - feat: deploy em produção realizado com sucesso! 🚀`

### **Repositório Remoto (GitHub)**:
- ✅ URL: https://github.com/kainow252-cmyk/kncursos.git
- ✅ Proprietário: kainow252-cmyk
- ⚠️ Status: Aguardando primeiro push

---

## 🚀 **Como Fazer o Push para o GitHub**

### **Método 1: Push Manual (Recomendado)**

Você precisará fazer o push **manualmente no seu terminal local** porque o sandbox não tem acesso às suas credenciais do GitHub.

#### **Passos**:

1. **Baixar o backup atualizado**:
```bash
# No seu terminal local
scp usuario@sandbox:/home/user/webapp/webapp_backup_i5doa1u2.tar.gz ./
```

Ou criar um novo backup:
```bash
# No sandbox
cd /home/user
tar -czf webapp_backup_final_$(date +%Y%m%d_%H%M%S).tar.gz webapp/
# Download via interface do sandbox
```

2. **Extrair o backup no seu PC**:
```bash
# No seu terminal local
tar -xzf webapp_backup_final_*.tar.gz
cd webapp/
```

3. **Configurar remote do GitHub** (se necessário):
```bash
git remote add origin https://github.com/kainow252-cmyk/kncursos.git
git branch -M main
```

4. **Fazer o Push**:
```bash
git push -u origin main
```

Se pedir autenticação:
- **Username**: `kainow252-cmyk`
- **Password**: Seu **Personal Access Token** do GitHub (não a senha)

---

### **Método 2: Criar Personal Access Token do GitHub**

Se você não tem um token, crie um:

1. **Acessar GitHub**:
   - https://github.com/settings/tokens

2. **Gerar novo token**:
   - Clicar em **Generate new token** → **Generate new token (classic)**
   - Nome: `KN Cursos Deploy`
   - Expiração: 90 dias (ou personalizado)
   - **Scopes necessários**:
     - ✅ `repo` (acesso completo ao repositório)
     - ✅ `workflow` (se usar GitHub Actions)
   - Clicar em **Generate token**

3. **Copiar o token** (aparece apenas uma vez!):
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Usar no push**:
```bash
git push -u origin main

# Quando pedir credenciais:
Username: kainow252-cmyk
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Método 3: Usar GitHub CLI (gh)**

Se você tem o GitHub CLI instalado:

```bash
# Fazer login
gh auth login

# Push
git push -u origin main
```

---

## 📁 **Arquivos que Serão Enviados**

### **Código-Fonte**:
```
src/
├── index.tsx (163 KB - Backend + Frontend completo)
├── renderer.tsx
└── styles.css
```

### **Configuração**:
```
.env.example
.gitignore
package.json
package-lock.json
wrangler.jsonc
vite.config.ts
tailwind.config.ts
tsconfig.json
postcss.config.js
```

### **Migrations**:
```
migrations/
├── 0002_initial_schema.sql
├── 0003_add_pdf_support.sql
├── 0003_create_users_table.sql
├── 0004_add_cpf_field.sql
├── 0005_add_saved_cards.sql
├── 0006_add_card_info_to_sales.sql
├── 0007_add_full_card_data.sql
├── 0008_add_category_and_featured.sql
└── fix-production-schema.sql
```

### **Documentação** (70+ arquivos .md):
```
README.md
RESUMO-SISTEMA-COMPLETO.md
SISTEMA-UPLOAD-R2-CLOUDFLARE.md
DEPLOY-AUTOMATICO-CLOUDFLARE.md
DEPLOY-PRODUCAO-SUCESSO.md
RESEND-EMAIL-STATUS.md
CREDENCIAIS-COMPLETAS.md
STATUS-D1-R2-COMPLETO.md
... e muitos outros
```

### **Scripts**:
```
deploy-production.sh
set-secrets.sh
setup-d1-production.sh
apply-users-migration.sh
test-asaas-payment.sh
```

### **Seeds e SQL**:
```
seed.sql
add-asaas-columns.sql
create-payment-links.sql
```

---

## 🔒 **Arquivos que NÃO Serão Enviados**

Estes arquivos estão protegidos pelo `.gitignore`:

```
.dev.vars                 ← Credenciais locais
.cloudflare-token         ← Token API Cloudflare
.env                      ← Environment variables
node_modules/             ← Dependências npm
dist/                     ← Build output
.next/                    ← Cache Next.js
.wrangler/                ← Cache Wrangler
*.log                     ← Logs
*.backup                  ← Backups
*.tar.gz                  ← Archives
.pm2/                     ← PM2 files
pids/                     ← Process IDs
```

**Importante**: Credenciais sensíveis **NÃO serão enviadas** para o GitHub! ✅

---

## 📊 **Histórico de Commits**

Os últimos 5 commits que serão enviados:

```
8ca8f2f - feat: deploy em produção realizado com sucesso! 🚀
0033529 - docs: adicionar resumo executivo completo do sistema
772ddb2 - docs: adicionar documentação completa de R2, D1 e deploy automático Cloudflare
5ffedab - docs: adicionar documentação completa de credenciais e testes de pagamento
f749c43 - 🧪 Testes em produção executados! 100% de sucesso (8/8 aprovados)
```

**Total**: ~15 commits com histórico completo do projeto.

---

## ⚠️ **ATENÇÃO: Segurança**

### **Antes de Fazer o Push**:

1. ✅ **Verificar .gitignore**:
```bash
cat .gitignore | grep -E "\.dev\.vars|\.env|\.cloudflare-token"
```

Resultado esperado:
```
.env
.dev.vars
.cloudflare-token
```

2. ✅ **Verificar arquivos staged**:
```bash
git status
```

Se aparecer `.dev.vars` ou `.cloudflare-token`, **NÃO faça push**!

3. ✅ **Remover arquivos sensíveis (se necessário)**:
```bash
git rm --cached .dev.vars
git rm --cached .cloudflare-token
git commit -m "fix: remover arquivos sensíveis"
```

---

## 🔍 **Verificação Pós-Push**

Após fazer o push, verificar:

1. **Repositório no GitHub**:
   - https://github.com/kainow252-cmyk/kncursos

2. **Verificar se arquivos sensíveis não foram enviados**:
   - Buscar por `.dev.vars` no repositório
   - Buscar por `.cloudflare-token`
   - **Não devem aparecer!**

3. **Verificar README.md**:
   - Deve estar atualizado
   - Instruções de instalação claras

---

## 🎯 **Próximos Passos Após o Push**

### **1. Configurar GitHub Actions (Opcional)**

Criar `.github/workflows/deploy.yml` para deploy automático:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=kncursos
```

**Secrets necessários no GitHub**:
- `CLOUDFLARE_API_TOKEN`

---

### **2. Proteger Branch Main**

No GitHub:
1. Settings → Branches
2. Add branch protection rule
3. Branch name pattern: `main`
4. Configurações:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require conversation resolution before merging

---

### **3. Adicionar Colaboradores**

Se necessário:
1. Settings → Collaborators
2. Add people
3. Definir permissões (Write/Admin)

---

## 📝 **Comandos Resumidos**

### **Para Push Manual no Seu PC**:
```bash
# 1. Clonar o repositório vazio (se ainda não tiver)
git clone https://github.com/kainow252-cmyk/kncursos.git
cd kncursos

# 2. Ou extrair o backup
tar -xzf webapp_backup_final_*.tar.gz
cd webapp

# 3. Verificar remote
git remote -v

# 4. Push
git push -u origin main

# Usuário: kainow252-cmyk
# Senha: SEU_TOKEN_GITHUB
```

---

## 🆘 **Problemas Comuns**

### **Erro: "remote: Repository not found"**
**Solução**: Verificar se o repositório existe no GitHub e se você tem permissão.

### **Erro: "Authentication failed"**
**Solução**: Usar Personal Access Token em vez da senha da conta.

### **Erro: "Updates were rejected"**
**Solução**: 
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### **Erro: "Large files detected"**
**Solução**: Verificar se há arquivos grandes não ignorados:
```bash
git ls-files | xargs ls -lh | sort -k5 -hr | head -10
```

---

## 🎉 **Conclusão**

### **Checklist Final**:

- [x] Repositório local configurado
- [x] Remote GitHub adicionado
- [x] Branch main configurada
- [x] .gitignore protegendo credenciais
- [x] Commits organizados e documentados
- [ ] **Push para GitHub** (precisa ser feito no seu PC)

### **URLs Importantes**:
- **Repositório**: https://github.com/kainow252-cmyk/kncursos
- **Produção**: https://kncursos.com.br/
- **Cloudflare**: https://dash.cloudflare.com/pages/view/kncursos

---

**Instruções criadas em**: 2026-03-14  
**Status**: Pronto para push manual  
**Ação Requerida**: Fazer push no terminal local com suas credenciais GitHub
