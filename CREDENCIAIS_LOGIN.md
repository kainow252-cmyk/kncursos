# 🔐 CREDENCIAIS DE LOGIN - kncursos

## 👑 ADMIN (Acesso Total)

```
Usuário: kncursos
Senha: kncursos2024
```

**Nome**: Administrador  
**Role**: `admin`

### Acesso
- URL: https://kncursos.com.br/login
- Redireciona para: `/admin`
- Permissões: **Todas** (Cursos + Vendas + Relatórios)

---

## 👨‍💼 FUNCIONÁRIO (Acesso Limitado)

```
Usuário: kncursos-func
Senha: kncursos123
```

**Nome**: Funcionário Teste  
**Role**: `employee`

### Acesso
- URL: https://kncursos.com.br/login
- Redireciona para: `/cursos`
- Permissões: **Apenas Cursos** (SEM Vendas)

---

## 🎯 Diferenças

| Item | Admin | Funcionário |
|------|-------|-------------|
| **Usuário** | `kncursos` | `kncursos-func` |
| **Senha** | `kncursos2024` | `kncursos123` |
| **URL após login** | `/admin` | `/cursos` |
| **Aba Cursos** | ✅ | ✅ |
| **Aba Vendas** | ✅ | ❌ |
| **Criar Curso** | ✅ | ✅ |
| **Editar Curso** | ✅ | ✅ |
| **Excluir Curso** | ✅ | ✅ |
| **Ver Vendas** | ✅ | ❌ |
| **Exportar CSV/PDF** | ✅ | ❌ |
| **Estatísticas** | ✅ | ❌ |

---

## 🧪 Como Testar

### ✅ Teste 1: Login Admin
```
1. Acesse: https://kncursos.com.br/login
2. Digite:
   Usuário: kncursos
   Senha: kncursos2024
3. Clique em "Entrar"
4. ✅ Redireciona para /admin
5. ✅ Você verá: [Cursos] [Vendas]
```

### ✅ Teste 2: Login Funcionário
```
1. Acesse: https://kncursos.com.br/login
2. Digite:
   Usuário: kncursos-func
   Senha: kncursos123
3. Clique em "Entrar"
4. ✅ Redireciona para /cursos
5. ✅ Você verá: [Meus Cursos] (SEM Vendas)
```

---

## 🔧 Criar Novo Funcionário

Se quiser criar mais funcionários:

```bash
npx wrangler d1 execute kncursos --remote --command="
INSERT INTO users (username, password, name, role, active) 
VALUES ('maria', 'senha123', 'Maria Silva', 'employee', 1);
"
```

Depois faça login com:
- **Usuário**: maria
- **Senha**: senha123

---

## 🔐 Alterar Senha

### Admin
```bash
npx wrangler d1 execute kncursos --remote --command="
UPDATE users SET password = 'nova_senha' 
WHERE username = 'kncursos' AND role = 'admin';
"
```

### Funcionário
```bash
npx wrangler d1 execute kncursos --remote --command="
UPDATE users SET password = 'nova_senha' 
WHERE username = 'kncursos-func';
"
```

---

## 🗑️ Deletar Usuário

```bash
npx wrangler d1 execute kncursos --remote --command="
DELETE FROM users WHERE username = 'kncursos-func';
"
```

---

## 📋 Listar Todos os Usuários

```bash
npx wrangler d1 execute kncursos --remote --command="
SELECT username, name, role FROM users;
"
```

---

## ⚠️ IMPORTANTE

### Segurança
- ✅ As senhas estão em **texto plano** no banco
- ⚠️ Para produção, recomenda-se usar **hash** (bcrypt)
- 🔒 Guarde essas credenciais em local seguro

### ⚠️ Nota sobre Username
- Os usernames devem ser **únicos**
- Admin: `kncursos`
- Funcionário: `kncursos-func` (com sufixo `-func`)
- Não é possível ter 2 usuários com o mesmo username

---

## 🎯 RESUMO RÁPIDO

### 👑 Acesso TOTAL (Admin)
```
Login: kncursos
Senha: kncursos2024
Vê: Cursos + Vendas ✅
```

### 👨‍💼 Acesso SÓ Cursos (Funcionário)
```
Login: kncursos-func
Senha: kncursos123
Vê: Apenas Cursos ❌ Vendas
```

---

## 📱 URL de Login

**https://kncursos.com.br/login**

---

## 🎉 TUDO PRONTO!

✅ Admin configurado  
✅ Funcionário configurado  
✅ Credenciais atualizadas  
✅ Pronto para usar!

**Teste agora mesmo!** 🚀
