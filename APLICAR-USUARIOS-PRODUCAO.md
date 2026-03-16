# 🔐 Aplicar Tabela de Usuários na Produção

## ❌ Problema Atual

A rota `/cursos` usa as **mesmas credenciais** do `/admin`:
- Qualquer pessoa com `admin/vemgo2024` pode acessar **ambas as rotas**
- Não há diferenciação de permissões

## ✅ Solução

Criar tabela `users` com campo `role` para diferenciar:
- **admin** → Acesso completo (`/admin` + `/cursos`)
- **employee** → Acesso limitado (apenas `/cursos`)

---

## 🚀 Como Aplicar (3 Passos Simples)

### 1️⃣ Acesse o Dashboard D1
```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/workers-and-pages/d1
```

### 2️⃣ Abra o Console do Banco `vemgo`
1. Clique no banco **"vemgo"**
2. Clique na aba **"Console"**
3. Cole o SQL abaixo no editor

### 3️⃣ Execute os 3 Comandos SQL

**Comando 1: Criar Tabela**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
  name TEXT,
  email TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Comando 2: Inserir Admin**
```sql
INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES 
('admin', 'vemgo2024', 'admin', 'Administrador', 'admin@vemgo.com.br');
```

**Comando 3: Inserir Funcionário**
```sql
INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES 
('funcionario', 'funcionario123', 'employee', 'Funcionário Teste', 'funcionario@vemgo.com.br');
```

---

## 📋 Verificar se Funcionou

Execute este SQL para ver os usuários criados:

```sql
SELECT * FROM users;
```

**Resultado esperado:**
```
id | username    | password        | role     | name              | email
---+-------------+-----------------+----------+-------------------+-------------------------
1  | admin       | vemgo2024    | admin    | Administrador     | admin@vemgo.com.br
2  | funcionario | funcionario123  | employee | Funcionário Teste | funcionario@vemgo.com.br
```

---

## 🔑 Credenciais Após Aplicação

### Admin (Acesso Completo)
- **Rota:** `/admin` e `/cursos`
- **Usuário:** `admin`
- **Senha:** `vemgo2024`
- **Permissões:** Ver vendas, gerar links, gerenciar cursos

### Funcionário (Apenas Cursos)
- **Rota:** `/cursos` (bloqueado em `/admin`)
- **Usuário:** `funcionario`
- **Senha:** `funcionario123`
- **Permissões:** Apenas gerenciar cursos

---

## 🔄 Próximo Passo

Depois de aplicar o SQL, preciso **atualizar o código** para:
1. ✅ Validar login contra tabela `users`
2. ✅ Verificar `role` nas rotas
3. ✅ Bloquear `/admin` para `employee`
4. ✅ Permitir `/cursos` para ambos

---

## ⚠️ IMPORTANTE

**NÃO delete** as 3 queries SQL acima! Depois de aplicar, avise para eu continuar a implementação.

---

**Status:** ⏳ Aguardando aplicação manual no Dashboard  
**Próximo:** Atualizar código de autenticação com verificação de role
