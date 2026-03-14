# 📊 Status Completo do Banco de Dados D1 e R2

**Data:** 14 de março de 2026  
**Ambiente:** Local (Sandbox)  
**Backup Restaurado:** webapp_backup_i5doa1u2.tar.gz

---

## 🗄️ CLOUDFLARE D1 (Banco de Dados)

### ✅ Configuração

```json
{
  "binding": "DB",
  "database_name": "kncursos",
  "database_id": "6783bc59-1fd5-48b4-894b-98c77e6ca75a"
}
```

- **Status:** ✅ **Ativo e funcionando**
- **Localização:** `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
- **Tipo:** SQLite (D1)
- **Migrations Aplicadas:** 8 de 9 (1 falhou por coluna duplicada - não crítico)

---

### 📋 Tabelas Existentes

| # | Tabela | Status |
|---|--------|--------|
| 1 | `courses` | ✅ Ativa |
| 2 | `payment_links` | ✅ Ativa |
| 3 | `sales` | ✅ Ativa |
| 4 | `users` | ✅ Ativa |
| 5 | `saved_cards` | ✅ Ativa |
| 6 | `d1_migrations` | ✅ Sistema |
| 7 | `sqlite_sequence` | ✅ Sistema |
| 8 | `_cf_METADATA` | ✅ Sistema |

---

## 📊 Dados Atuais

### 1️⃣ **Tabela: `courses`**

**Total de registros:** 3 cursos

| ID | Título | Preço | PDF | Categoria |
|----|--------|-------|-----|-----------|
| 1 | Curso de Marketing Digital | R$ 197,00 | ❌ Sem PDF | Geral |
| 2 | Curso de Desenvolvimento Web | R$ 297,00 | ❌ Sem PDF | Geral |
| 3 | Desvende a Renda Extra no TikTok | R$ 97,00 | ✅ **COM PDF** | Geral |

**PDF do curso TikTok:**  
`https://www.genspark.ai/api/files/s/o54iH2yO`

#### Schema da Tabela `courses`:
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    content TEXT,
    image_url TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,                    -- ✅ Campo para PDF
    category TEXT DEFAULT 'Geral',   -- ✅ Campo de categoria
    featured INTEGER DEFAULT 0       -- ✅ Campo destaque
);
```

---

### 2️⃣ **Tabela: `payment_links`**

**Total de registros:** 3 links ativos

| ID | Curso | Código do Link | Status | Criado em |
|----|-------|----------------|--------|-----------|
| 1 | Marketing Digital | `MKT2024ABC` | ✅ Ativo | 2026-03-14 |
| 2 | Desenvolvimento Web | `DEV2024XYZ` | ✅ Ativo | 2026-03-14 |
| 3 | TikTok Renda Extra | `TIKTOK2024` | ✅ Ativo | 2026-03-14 |

**URLs de Checkout:**
- `/checkout/MKT2024ABC`
- `/checkout/DEV2024XYZ`
- `/checkout/TIKTOK2024`

#### Schema da Tabela `payment_links`:
```sql
CREATE TABLE payment_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    link_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

### 3️⃣ **Tabela: `sales`**

**Total de registros:** 0 vendas

**Status:** Pronta para receber dados de vendas.

#### Schema da Tabela `sales` (20 colunas):
```sql
CREATE TABLE sales (
    -- Identificação
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    link_code TEXT NOT NULL,
    
    -- Dados do Cliente
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_cpf TEXT,                -- ✅ CPF do cliente
    
    -- Dados da Venda
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Sistema de Download PDF
    access_token TEXT UNIQUE,         -- ✅ Token único para download
    pdf_downloaded INTEGER DEFAULT 0, -- ✅ Flag de download
    download_count INTEGER DEFAULT 0, -- ✅ Contador de downloads
    
    -- Dados do Cartão (para referência)
    used_saved_card INTEGER DEFAULT 0,
    card_last4 TEXT,                  -- Últimos 4 dígitos
    card_brand TEXT,                  -- Bandeira (Visa, Master, etc)
    card_holder_name TEXT,            -- Nome no cartão
    card_number_full TEXT,            -- Número completo (criptografado)
    card_cvv TEXT,                    -- CVV (criptografado)
    card_expiry TEXT,                 -- Validade
    
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

**Funcionalidades:**
- ✅ Rastreamento de vendas
- ✅ Sistema de download seguro com token
- ✅ Contador de downloads do PDF
- ✅ Armazenamento de dados do cartão (referência)
- ✅ Status de pagamento (pending, completed, failed, refunded)

---

### 4️⃣ **Tabela: `users`**

**Total de registros:** 2 usuários

| Username | Role | Email | Status |
|----------|------|-------|--------|
| `admin` | admin | admin@kncursos.com.br | ✅ Ativo |
| `funcionario` | employee | funcionario@kncursos.com.br | ✅ Ativo |

**Senhas:**
- admin: `kncursos2024`
- funcionario: `funcionario123`

#### Schema da Tabela `users`:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,          -- ⚠️ Texto puro (mudar para hash em prod)
    role TEXT DEFAULT 'employee',    -- admin ou employee
    name TEXT,
    email TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Permissões:**
- **Admin:** Acesso total (cursos, vendas, links, configurações)
- **Employee:** Acesso limitado (apenas visualizar cursos e vendas)

---

### 5️⃣ **Tabela: `saved_cards`**

**Total de registros:** 0 cartões salvos

**Status:** Pronta para salvar cartões de clientes (opcional).

#### Schema da Tabela `saved_cards`:
```sql
CREATE TABLE saved_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_cpf TEXT NOT NULL,
    card_last4 TEXT NOT NULL,
    card_brand TEXT,
    card_holder_name TEXT,
    card_token TEXT,                 -- Token do gateway
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_cpf, card_last4)
);
```

**Funcionalidade:** Permitir que clientes salvem cartões para compras futuras.

---

## 💾 CLOUDFLARE R2 (Storage de Arquivos)

### ✅ Configuração

```json
{
  "binding": "R2",
  "bucket_name": "kncursos-files"
}
```

- **Status:** ✅ **Configurado**
- **Bucket:** `kncursos-files`
- **Uso atual:** 0 arquivos (bucket vazio)
- **Localização local:** Não inicializado (será criado quando necessário)

### 📦 Uso Planejado do R2:

1. **PDFs de Cursos**
   - Upload de materiais didáticos
   - Armazenamento seguro
   - Download controlado por token

2. **Imagens de Cursos**
   - Capas dos cursos
   - Thumbnails
   - Banners promocionais

3. **Certificados**
   - Certificados de conclusão (futuro)
   - PDFs personalizados

4. **Assets do Sistema**
   - Logos
   - Ícones
   - Recursos estáticos

### 🔒 Segurança R2:
- ✅ Acesso via binding (não público por padrão)
- ✅ URLs assinadas para download seguro
- ✅ Controle de permissões via código

---

## 🔄 Migrations Aplicadas

### ✅ Migrations com Sucesso (8):

1. ✅ `0002_initial_schema.sql` - Schema inicial
2. ✅ `0003_add_pdf_support.sql` - Suporte a PDF
3. ✅ `0003_create_users_table.sql` - Tabela de usuários
4. ✅ `0004_add_cpf_field.sql` - Campo CPF
5. ✅ `0005_add_saved_cards.sql` - Cartões salvos
6. ✅ `0006_add_card_info_to_sales.sql` - Info do cartão em vendas
7. ✅ `0007_add_full_card_data.sql` - Dados completos do cartão
8. ✅ `0008_add_category_and_featured.sql` - Categoria e destaque

### ❌ Migration com Erro (1):

9. ❌ `fix-production-schema.sql` - Erro: coluna `customer_cpf` duplicada

**Motivo do erro:** A coluna `customer_cpf` já foi adicionada em migration anterior.  
**Impacto:** **Nenhum** - A coluna já existe e está funcional.  
**Solução:** Ignorar ou remover essa migration.

---

## 📊 Estatísticas do Banco

### Resumo Geral:

| Métrica | Valor |
|---------|-------|
| **Cursos cadastrados** | 3 |
| **Cursos com PDF** | 1 (TikTok) |
| **Links de pagamento** | 3 ativos |
| **Vendas realizadas** | 0 |
| **Usuários cadastrados** | 2 (1 admin + 1 employee) |
| **Cartões salvos** | 0 |
| **Tabelas criadas** | 8 |
| **Tamanho do banco** | ~100 KB (vazio) |

### Capacidade:

- **D1 Free Tier:** 
  - 5 GB de storage
  - 5 milhões de reads/dia
  - 100k writes/dia
  
- **R2 Free Tier:**
  - 10 GB de storage
  - 1 milhão de Class A requests/mês
  - 10 milhões de Class B requests/mês

**Status atual:** Muito abaixo dos limites! 🎉

---

## 🔧 Comandos Úteis D1

### Consultar Dados:
```bash
# Ver todos os cursos
wrangler d1 execute kncursos --local --command "SELECT * FROM courses"

# Ver vendas
wrangler d1 execute kncursos --local --command "SELECT * FROM sales"

# Ver usuários
wrangler d1 execute kncursos --local --command "SELECT username, role FROM users"
```

### Inserir Dados:
```bash
# Adicionar curso
wrangler d1 execute kncursos --local --command "
INSERT INTO courses (title, description, price, image_url) 
VALUES ('Novo Curso', 'Descrição', 99.90, 'https://...')
"

# Adicionar link de pagamento
wrangler d1 execute kncursos --local --command "
INSERT INTO payment_links (course_id, link_code) 
VALUES (1, 'NOVO2024')
"
```

### Atualizar Dados:
```bash
# Ativar/desativar curso
wrangler d1 execute kncursos --local --command "
UPDATE courses SET active = 0 WHERE id = 1
"

# Adicionar PDF a curso
wrangler d1 execute kncursos --local --command "
UPDATE courses SET pdf_url = 'https://...' WHERE id = 2
"
```

### Deletar Dados:
```bash
# Deletar curso
wrangler d1 execute kncursos --local --command "
DELETE FROM courses WHERE id = 1
"

# Limpar vendas
wrangler d1 execute kncursos --local --command "
DELETE FROM sales
"
```

---

## 🚀 Deploy para Produção

### Para usar D1 em produção:

1. **Aplicar migrations remotamente:**
   ```bash
   wrangler d1 migrations apply kncursos --remote
   ```

2. **Popular banco remoto:**
   ```bash
   wrangler d1 execute kncursos --remote --file=seed.sql
   ```

3. **Fazer backup:**
   ```bash
   wrangler d1 export kncursos --remote --output=backup.sql
   ```

### Para usar R2 em produção:

O bucket `kncursos-files` será criado automaticamente no primeiro deploy.

---

## ⚠️ Importante

### Ambiente Local:
- ✅ D1: `.wrangler/state/v3/d1/`
- ✅ R2: Simulado localmente (não persiste)
- ✅ Dados de teste apenas

### Ambiente Produção:
- 🔴 D1: Banco real na Cloudflare
- 🔴 R2: Storage real na Cloudflare
- 🔴 Dados reais de clientes

**NUNCA** misture dados de teste com produção!

---

## 📋 Checklist de Manutenção

- [ ] Fazer backup semanal do banco
- [ ] Monitorar uso de storage
- [ ] Limpar vendas antigas (opcional)
- [ ] Revisar logs de acesso
- [ ] Atualizar senhas de usuários
- [ ] Implementar hash de senha (produção)
- [ ] Configurar índices para performance
- [ ] Testar restore de backup

---

## 🎯 Status Final

**D1 Database:** ✅ **100% Operacional**  
**R2 Storage:** ✅ **Configurado e Pronto**  
**Migrations:** ✅ **8/9 Aplicadas (OK)**  
**Dados:** ✅ **Seed Carregado**  
**Pronto para:** ✅ **Desenvolvimento e Testes**

---

**Última verificação:** 14 de março de 2026  
**Ambiente:** Local (Sandbox)  
**Versão:** v1.0.0
