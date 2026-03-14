# 🔐 Sistema de Login e Autenticação Admin

## ✅ Implementação Concluída

O dashboard administrativo agora está **protegido por login e senha** usando autenticação JWT.

## 🔑 Credenciais Padrão

**Para ambiente local (.dev.vars):**
- **Usuário**: `admin`
- **Senha**: `kncursos2024`
- **JWT Secret**: `kncursos-jwt-secret-change-in-production-2024`

## 🏗️ Arquitetura de Segurança

### 1. **Página de Login** (`/login`)
- Design moderno com gradiente
- Formulário de autenticação
- Validação em tempo real
- Feedback de erros
- Link para voltar à home

### 2. **Endpoints de Autenticação**

#### POST `/api/auth/login`
```json
// Request
{
  "username": "admin",
  "password": "kncursos2024"
}

// Response (sucesso)
{
  "success": true,
  "message": "Login realizado com sucesso"
}

// Response (erro)
{
  "success": false,
  "message": "Usuário ou senha inválidos"
}
```

#### POST `/api/auth/logout`
```json
// Response
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### GET `/api/auth/check`
```json
// Response (autenticado)
{
  "authenticated": true
}

// Response (não autenticado)
{
  "authenticated": false
}
```

### 3. **Sistema de Tokens JWT**

- **Token armazenado**: Cookie HTTP-only
- **Duração**: 24 horas
- **Renovação**: Automática a cada login
- **Segurança**: 
  - `httpOnly: true` - Previne acesso via JavaScript
  - `secure: true` - Apenas HTTPS em produção
  - `sameSite: 'Lax'` - Proteção contra CSRF

### 4. **Proteção da Rota Admin**

A rota `/admin` agora:
1. Verifica se existe cookie de autenticação
2. Valida o token JWT
3. Se inválido/ausente → Redireciona para `/login`
4. Se válido → Exibe dashboard

### 5. **Botão de Logout**

- Localizado no header do dashboard
- Cor vermelha para destacar
- Limpa o cookie de autenticação
- Redireciona para `/login`

## 🔐 Configuração de Produção

### Variáveis de Ambiente Cloudflare

**IMPORTANTE**: Configure as seguintes secrets na Cloudflare Pages:

```bash
# 1. Definir usuário admin
npx wrangler pages secret put ADMIN_USERNAME --project-name kncursos
# Digite: admin (ou outro usuário de sua preferência)

# 2. Definir senha admin
npx wrangler pages secret put ADMIN_PASSWORD --project-name kncursos
# Digite: SuaSenhaForte123! (MUDE a senha padrão!)

# 3. Definir JWT secret
npx wrangler pages secret put JWT_SECRET --project-name kncursos
# Digite: Um string aleatório longo e complexo

# 4. Listar secrets configurados
npx wrangler pages secret list --project-name kncursos
```

### Gerar JWT Secret Seguro

Use um gerador de strings aleatórias:
```bash
# Exemplo de JWT secret seguro (use um diferente!)
openssl rand -base64 32
# Resultado exemplo: xK9mP2nQ7wE8vT3zL5yB4sR1cD6fG0hJ
```

## 🚀 Fluxo de Autenticação

```
1. Usuário acessa /admin
   ↓
2. Sistema verifica cookie JWT
   ↓
3a. SEM TOKEN → Redireciona para /login
   ↓
4. Usuário digita credenciais
   ↓
5. POST /api/auth/login valida credenciais
   ↓
6a. VÁLIDO → Gera JWT token + Define cookie → Redireciona para /admin
6b. INVÁLIDO → Exibe mensagem de erro

7. Usuário autenticado acessa /admin
   ↓
8. Sistema valida token JWT
   ↓
9. Exibe dashboard

10. Usuário clica em "Sair"
    ↓
11. POST /api/auth/logout → Limpa cookie → Redireciona para /login
```

## 📁 Arquivos Modificados

### `src/index.tsx`
- Imports: `sign`, `verify` (hono/jwt), `getCookie`, `setCookie` (hono/cookie)
- Bindings: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Rotas de autenticação: `/api/auth/login`, `/api/auth/logout`, `/api/auth/check`
- Página de login: `/login`
- Proteção do admin: `app.get('/admin')` com verificação JWT
- Botão de logout no header do admin

### `.dev.vars` (local development)
```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kncursos2024
JWT_SECRET=kncursos-jwt-secret-change-in-production-2024
```

## 🌐 URLs

- **Home**: https://kncursos.pages.dev/
- **Login**: https://kncursos.pages.dev/login
- **Admin Protegido**: https://kncursos.pages.dev/admin (requer autenticação)
- **Local Login**: http://localhost:3000/login
- **Local Admin**: http://localhost:3000/admin

## 🎨 Design da Página de Login

- **Background**: Gradiente azul → roxo → rosa
- **Card Central**: Branco com sombra suave
- **Logo**: Ícone de graduation cap em círculo gradiente
- **Campos**: Username e password com ícones
- **Botão**: Gradiente azul → roxo com efeito hover
- **Feedback**: Alert vermelho para erros
- **Loading**: Spinner durante autenticação
- **Link**: Voltar para home

## ✅ Segurança Implementada

- [x] Autenticação JWT
- [x] Cookies HTTP-only
- [x] Proteção contra XSS (httpOnly)
- [x] Proteção contra CSRF (sameSite)
- [x] HTTPS obrigatório em produção
- [x] Token expira em 24h
- [x] Validação de credenciais server-side
- [x] Redirecionamento automático para login
- [x] Logout seguro com limpeza de cookie

## 🧪 Como Testar

### 1. Testar Login (Local)
```bash
# Acesse: http://localhost:3000/login
# Usuário: admin
# Senha: kncursos2024
```

### 2. Testar Proteção Admin
```bash
# Acesse: http://localhost:3000/admin
# Deve redirecionar para /login se não autenticado
```

### 3. Testar Logout
```bash
# 1. Faça login
# 2. Acesse /admin
# 3. Clique no botão "Sair" no header
# 4. Deve redirecionar para /login
```

### 4. Testar API (curl)
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"kncursos2024"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout

# Verificar autenticação
curl http://localhost:3000/api/auth/check
```

## ⚠️ Importante - Produção

**ANTES de fazer deploy para produção:**

1. **MUDE a senha padrão** `kncursos2024` para uma senha forte
2. **Configure JWT_SECRET** com um valor aleatório e complexo
3. **Use wrangler secrets** para definir variáveis de ambiente
4. **NÃO commite** o arquivo `.dev.vars` no Git (já está no .gitignore)

## 📝 Próximos Passos Sugeridos

- [ ] Adicionar recuperação de senha
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Log de tentativas de login
- [ ] Bloqueio após múltiplas tentativas falhas
- [ ] Múltiplos usuários admin
- [ ] Diferentes níveis de permissão (roles)

---

**Data**: 2026-03-13  
**Status**: ✅ Concluído  
**Credenciais Padrão**: admin / kncursos2024
