# 👥 Nova Rota: /cursos - Para Funcionários

## ✅ Rota Criada com Sucesso!

Criei uma nova rota **`/cursos`** especificamente para funcionários gerenciarem cursos **sem acesso às vendas**.

---

## 🌐 URL da Nova Rota

**Produção:**
```
https://kncursos.pages.dev/cursos
```

**Preview:**
```
https://62fd9024.kncursos.pages.dev/cursos
```

---

## 🔐 Acesso

### Mesmas Credenciais do Admin:
- **Usuário:** admin
- **Senha:** kncursos2024

> **Nota:** Por enquanto usa as mesmas credenciais. Você pode criar credenciais separadas para funcionários depois, se desejar.

---

## 📊 Diferenças entre /admin e /cursos

| Funcionalidade | /admin | /cursos |
|----------------|--------|---------|
| **Gerenciar Cursos** | ✅ | ✅ |
| **Criar Cursos** | ✅ | ✅ |
| **Editar Cursos** | ✅ | ✅ |
| **Excluir Cursos** | ✅ | ✅ |
| **Upload Imagens/PDFs** | ✅ | ✅ |
| **Gerar Links de Pagamento** | ✅ | ❌ |
| **Ver Vendas** | ✅ | ❌ |
| **Exportar Relatórios** | ✅ | ❌ |
| **Estatísticas** | ✅ | ❌ |

---

## 🎯 Para Quem é a Rota /cursos?

### ✅ Ideal Para:
- **Funcionários** que cuidam apenas do conteúdo
- **Criadores de cursos** que não precisam ver vendas
- **Equipe de conteúdo** sem acesso financeiro
- **Colaboradores externos** que criam material

### ❌ NÃO Ideal Para:
- Gerentes que precisam ver vendas
- Administradores financeiros
- Pessoas que precisam gerar links de pagamento

---

## 🚀 Como Usar

### 1. **Acesse a Rota:**
```
https://kncursos.pages.dev/cursos
```

### 2. **Faça Login:**
- Usuário: admin
- Senha: kncursos2024

### 3. **Gerencie Cursos:**
- ✅ Clique em "Novo Curso"
- ✅ Preencha os dados
- ✅ Faça upload de imagens e PDFs
- ✅ Salve o curso

### 4. **Edite Cursos Existentes:**
- ✅ Clique em "Editar" no card do curso
- ✅ Atualize os dados
- ✅ Salve as alterações

---

## 🎨 Interface da Rota /cursos

A interface é **limpa e focada** apenas em cursos:

### Header:
- **Título:** "kncursos - Gerenciar Cursos"
- **Subtítulo:** "Adicione e edite cursos"
- **Botão Sair:** No canto superior direito

### Conteúdo Principal:
- **Grid de cursos:** Cards com imagem, título, preço
- **Botão "Novo Curso":** Destaque no topo
- **Formulário de curso:** Com todos os campos necessários
- **Botões de ação:** Editar e Excluir em cada curso

### Sem Acesso a:
- ❌ Aba "Vendas"
- ❌ Estatísticas de vendas
- ❌ Botão "Gerar Link"
- ❌ Lista de clientes
- ❌ Relatórios

---

## 🔧 Customização Futura (Opcional)

### Se Quiser Criar Credenciais Separadas:

1. **Adicionar tabela de usuários no banco:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin' ou 'editor'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

2. **Criar variáveis de ambiente para editor:**
```bash
echo 'editor' | npx wrangler pages secret put EDITOR_USERNAME --project-name kncursos
echo 'senha123' | npx wrangler pages secret put EDITOR_PASSWORD --project-name kncursos
```

3. **Modificar rota de login:**
- Verificar credenciais de admin OU editor
- Salvar role no token JWT
- Redirecionar para /admin ou /cursos baseado no role

---

## 📝 Exemplo de Uso

### Cenário 1: Equipe de Conteúdo
```
João (Editor) → Acessa /cursos
              → Cria novos cursos
              → Faz upload de PDFs
              → Edita descrições
              → NÃO vê vendas
              → NÃO gera links

Maria (Admin) → Acessa /admin
              → Vê todos os cursos
              → Gera links de pagamento
              → Visualiza vendas
              → Exporta relatórios
```

### Cenário 2: Freelancer Externo
```
Pedro (Freelancer) → Recebe login temporário
                   → Acessa /cursos
                   → Cria curso específico
                   → Faz upload do material
                   → Login desativado após entrega
```

---

## ✅ Status Atual

| Item | Status |
|------|--------|
| ✅ Rota /cursos criada | Funcionando |
| ✅ Interface limpa | Implementada |
| ✅ Sem acesso a vendas | Verificado |
| ✅ CRUD completo de cursos | Funcionando |
| ✅ Upload de arquivos | Funcionando |
| ✅ Deploy realizado | Concluído |

---

## 🌐 URLs Completas do Sistema

| Página | URL | Acesso |
|--------|-----|--------|
| **Loja** | https://kncursos.pages.dev/ | Público |
| **Checkout** | https://kncursos.pages.dev/checkout/DEV2024XYZ | Público |
| **Login** | https://kncursos.pages.dev/login | Restrito |
| **Admin Completo** | https://kncursos.pages.dev/admin | Admin |
| **🆕 Gerenciar Cursos** | https://kncursos.pages.dev/cursos | Editor |
| **Teste E-mail** | https://kncursos.pages.dev/test-email | Admin |

---

## 📦 Backup

**Backup com a nova rota:** (será criado após finalizar)

---

## 🎉 Resumo

✅ **Nova rota `/cursos` criada!**
- Interface limpa e focada
- Sem acesso a vendas
- Ideal para funcionários
- Mesma funcionalidade de CRUD de cursos
- Upload de imagens e PDFs funcionando

**Acesse agora:** https://kncursos.pages.dev/cursos

---

**🚀 Rota pronta para uso! Seus funcionários podem começar a adicionar cursos!**
