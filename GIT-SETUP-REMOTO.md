# 🔧 Guia de Configuração do Repositório Remoto

## ✅ Status Atual

- ✅ **Git inicializado**
- ✅ **Branch:** main
- ✅ **Commits:** 11 commits (último: 5ffedab)
- ✅ **Usuário Git configurado:** Vemgo Dev <dev@vemgo.com.br>
- ⚠️ **Remote:** NÃO configurado ainda

---

## 📦 Último Commit Realizado

```
commit 5ffedab
Author: Vemgo Dev <dev@vemgo.com.br>
Date: Hoje

docs: adicionar documentação completa de credenciais e testes de pagamento

- CREDENCIAIS-COMPLETAS.md: todas credenciais Asaas, Resend e Admin
- PAGAMENTO-CARTAO-APENAS.md: configuração de pagamento via cartão
- CHECKLIST-TESTE-PAGAMENTO.md: roteiro completo de testes

Sistema configurado com:
- Asaas Sandbox (teste)
- Apenas cartão de crédito habilitado
- Taxa: 3.49%
```

---

## 🚀 Como Adicionar Repositório Remoto

### Opção 1: Criar Novo Repositório no GitHub

#### Passo 1: Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `vemgo` (ou outro nome)
3. Descrição: "Sistema de vendas de cursos online com Asaas"
4. **NÃO** inicialize com README (já temos commits)
5. Clique em **"Create repository"**

#### Passo 2: Adicionar Remote e Fazer Push
```bash
cd /home/user/webapp

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/vemgo.git

# Verificar remote
git remote -v

# Fazer push da branch main
git push -u origin main
```

---

### Opção 2: Usar Repositório Existente

Se você já tem um repositório:

```bash
cd /home/user/webapp

# Adicionar remote
git remote add origin URL-DO-SEU-REPOSITORIO

# Exemplo:
# git remote add origin https://github.com/usuario/vemgo.git

# Fazer push
git push -u origin main
```

---

### Opção 3: Usar GitHub CLI (gh)

Se você tem o GitHub CLI instalado:

```bash
cd /home/user/webapp

# Criar repositório e fazer push automaticamente
gh repo create vemgo --private --source=. --remote=origin --push

# Ou público:
# gh repo create vemgo --public --source=. --remote=origin --push
```

---

## 🔐 Autenticação no GitHub

### Método 1: Personal Access Token (Recomendado)

1. **Gerar Token:**
   - Acesse: https://github.com/settings/tokens
   - Clique em **"Generate new token (classic)"**
   - Marque: `repo` (Full control of private repositories)
   - Gere e copie o token

2. **Usar Token no Push:**
   ```bash
   # Quando pedir senha, cole o token (não a senha do GitHub)
   git push -u origin main
   Username: seu-usuario
   Password: [COLE O TOKEN AQUI]
   ```

3. **Salvar Token (opcional):**
   ```bash
   git config --global credential.helper store
   # Na próxima vez que fizer push, o token será salvo
   ```

---

### Método 2: SSH Key

1. **Gerar chave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "dev@vemgo.com.br"
   # Pressione Enter para aceitar local padrão
   # Pressione Enter para senha vazia (ou defina uma)
   ```

2. **Adicionar chave ao GitHub:**
   ```bash
   # Copiar chave pública
   cat ~/.ssh/id_ed25519.pub
   
   # Vá em: https://github.com/settings/keys
   # Clique em "New SSH key"
   # Cole a chave e salve
   ```

3. **Usar SSH no remote:**
   ```bash
   git remote add origin git@github.com:SEU-USUARIO/vemgo.git
   git push -u origin main
   ```

---

## 🌿 Workflow com Branches

### Criar Branch para Desenvolvimento

```bash
# Criar branch genspark_ai_developer
git checkout -b genspark_ai_developer

# Fazer mudanças...
git add .
git commit -m "feat: nova funcionalidade"

# Push da branch
git push -u origin genspark_ai_developer
```

### Criar Pull Request

1. Acesse seu repositório no GitHub
2. Clique em **"Compare & pull request"**
3. Descreva as mudanças
4. Clique em **"Create pull request"**

---

## 📋 Comandos Úteis

### Verificar Status
```bash
cd /home/user/webapp

# Ver status atual
git status

# Ver histórico de commits
git log --oneline

# Ver remotes configurados
git remote -v

# Ver branches
git branch -a
```

### Adicionar/Remover Remote
```bash
# Adicionar remote
git remote add origin URL

# Remover remote
git remote remove origin

# Mudar URL do remote
git remote set-url origin NOVA-URL
```

### Fazer Push
```bash
# Push da branch atual
git push

# Push forçado (cuidado!)
git push -f

# Push de todas as branches
git push --all

# Push de todas as tags
git push --tags
```

---

## 🔒 Arquivos Protegidos (.gitignore)

Estes arquivos **NÃO** serão commitados (estão no .gitignore):

```
✅ .dev.vars           # Credenciais locais (PROTEGIDO)
✅ .env                # Variáveis de ambiente (PROTEGIDO)
✅ node_modules/       # Dependências (não necessário)
✅ .wrangler/          # Cache Wrangler (temporário)
✅ dist/               # Build (gerado automaticamente)
✅ *.log               # Logs (temporários)
```

---

## ⚠️ IMPORTANTE

### Antes de Fazer Push:

1. **Verifique o .gitignore:**
   ```bash
   cat .gitignore
   ```
   Confirme que `.dev.vars` está listado!

2. **Verifique o que será enviado:**
   ```bash
   git status
   git diff --cached
   ```

3. **NUNCA commite:**
   - ❌ `.dev.vars` (credenciais)
   - ❌ Tokens de API
   - ❌ Senhas
   - ❌ Chaves privadas

---

## 📊 Estrutura Atual do Repositório

```
webapp/
├── .git/                    # Git repository
├── .gitignore              # Arquivos ignorados ✅
├── .dev.vars               # Credenciais (PROTEGIDO) ✅
├── src/                    # Código fonte
├── migrations/             # Migrações do banco
├── public/                 # Arquivos estáticos
├── dist/                   # Build (ignorado)
├── node_modules/           # Dependências (ignorado)
├── package.json            # Config NPM
├── wrangler.jsonc          # Config Cloudflare
├── README.md               # Documentação principal
├── CREDENCIAIS-COMPLETAS.md         # ✅ Commitado
├── PAGAMENTO-CARTAO-APENAS.md       # ✅ Commitado
├── CHECKLIST-TESTE-PAGAMENTO.md     # ✅ Commitado
└── [70+ arquivos .md de documentação]
```

---

## 🎯 Próximos Passos

1. **Criar repositório no GitHub**
2. **Adicionar remote:**
   ```bash
   git remote add origin URL-DO-REPOSITORIO
   ```
3. **Fazer push:**
   ```bash
   git push -u origin main
   ```
4. **Verificar no GitHub:** Todos os 11 commits devem aparecer!

---

## 📞 Comandos Prontos para Usar

### Criar Repositório e Fazer Push (GitHub)

```bash
# 1. Crie o repositório no GitHub primeiro!
# 2. Execute:
cd /home/user/webapp
git remote add origin https://github.com/SEU-USUARIO/vemgo.git
git push -u origin main
```

### Se der erro de "branch diverged"

```bash
# Force push (cuidado, use apenas se tiver certeza!)
git push -f origin main
```

---

## 📝 Exemplo Completo

```bash
# 1. Criar repo no GitHub (interface web)
# 2. Adicionar remote
git remote add origin https://github.com/meuusuario/vemgo.git

# 3. Verificar
git remote -v

# 4. Push
git push -u origin main

# Resultado esperado:
# Enumerating objects: 50, done.
# Counting objects: 100% (50/50), done.
# Writing objects: 100% (50/50), 2.1 MiB | 1.5 MiB/s, done.
# Total 50 (delta 0), reused 0 (delta 0)
# To https://github.com/meuusuario/vemgo.git
#  * [new branch]      main -> main
# Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

**✅ Repositório configurado e pronto para push!**

Quando quiser adicionar o remote, é só seguir este guia! 🚀
