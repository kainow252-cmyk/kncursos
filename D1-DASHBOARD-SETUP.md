# 🔑 Configuração de API Token para D1

## 🚨 Erro de Autenticação

```
❌ ERROR: Authentication error [code: 10000]
❌ A request to the Cloudflare API failed
```

**Causa**: O API Token atual não tem permissões para gerenciar D1 databases.

---

## ✅ Solução: Configurar via Dashboard (Mais Fácil)

Ao invés de usar CLI, vamos configurar tudo pelo **Cloudflare Dashboard**.

### Passo 1: Verificar se D1 Database Existe

1. **Acesse**: https://dash.cloudflare.com/
2. **Menu lateral** → **Storage & Databases** → **D1**
3. Veja se existe um database chamado **vemgo**

---

## 📊 Cenário 1: Database NÃO Existe

### Criar Database pelo Dashboard

1. Na página D1, clique em **Create database**
2. Preencha:
   - **Database name**: `vemgo`
   - **Location**: **Automatic** (ou South America/São Paulo se disponível)
3. Clique em **Create**
4. **Copie o Database ID** mostrado (ex: `6783bc59-1fd5-48b4-894b-98c77e6ca75a`)

### Criar Tabelas Manualmente

1. Clique no database **vemgo**
2. Clique na aba **Console**
3. Execute os seguintes SQLs **um por vez**:

```sql
-- Tabela de cursos
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  content TEXT,
  image_url TEXT,
  pdf_url TEXT,
  category TEXT DEFAULT 'Geral',
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de payment links
CREATE TABLE payment_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabela de vendas
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  access_token TEXT UNIQUE,
  card_last4 TEXT,
  card_brand TEXT,
  card_holder_name TEXT,
  card_number_full TEXT,
  card_cvv TEXT,
  card_expiry TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Índices
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_featured ON courses(featured);
CREATE INDEX idx_payment_links_course ON payment_links(course_id);
CREATE INDEX idx_sales_access_token ON sales(access_token);
```

### Importar Dados

Você tem **duas opções** para importar os 60 cursos:

#### Opção A: Usar API Local (Upload Manual)

1. Na mesma aba **Console**, execute os INSERTs dos cursos
2. Copie o conteúdo de `seed-add-courses.sql`
3. Cole e execute (pode demorar alguns segundos)

#### Opção B: Criar Manualmente os Principais

Execute no Console D1:

```sql
-- Curso 1
INSERT INTO courses (title, description, price, content, image_url, pdf_url, category, featured) 
VALUES (
  'Marketing Digital Completo',
  'Aprenda estratégias completas de marketing digital',
  197.00,
  '- Módulo 1: Fundamentos\n- Módulo 2: Redes Sociais\n- Módulo 3: Tráfego Pago',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
  'https://www.genspark.ai/api/files/s/placeholder_1.pdf',
  'Marketing Digital',
  1
);

-- Curso 2
INSERT INTO courses (title, description, price, content, image_url, pdf_url, category, featured) 
VALUES (
  'Python do Zero ao Avançado',
  'Domine Python com projetos práticos',
  197.00,
  '- Módulo 1: Sintaxe Básica\n- Módulo 2: POO\n- Módulo 3: Projetos',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  'https://www.genspark.ai/api/files/s/placeholder_2.pdf',
  'Programação',
  1
);

-- Repita para mais cursos...
```

### Criar Payment Links

```sql
-- Links para os cursos criados
INSERT INTO payment_links (course_id, link_code) VALUES (1, 'MKT2024-001');
INSERT INTO payment_links (course_id, link_code) VALUES (2, 'PROG2024-001');
-- Continue para outros cursos...
```

---

## 📊 Cenário 2: Database JÁ Existe

### Apenas Vincular ao Projeto

1. **Acesse**: https://dash.cloudflare.com/
2. **Workers & Pages** → **vemgo**
3. **Settings** → **Functions**
4. **Bindings** → **Add binding**
5. Selecione:
   - **Type**: D1 database
   - **Variable name**: `DB` (exatamente assim)
   - **D1 database**: Selecione `vemgo` da lista
6. Clique em **Save**

---

## 🧪 Testar Configuração

### Teste 1: Verificar API

```bash
# Listar cursos
curl https://vemgo.pages.dev/api/courses

# Deve retornar JSON com lista de cursos
# Se retornar "[]", o banco está vazio
# Se retornar erro 500, binding não está configurado
```

### Teste 2: Verificar Admin

1. Acesse: https://vemgo.pages.dev/login
2. Login: `admin` / `vemgo2024`
3. Dashboard deve mostrar os cursos

### Teste 3: Console SQL Direto

1. **Storage & Databases** → **D1** → **vemgo**
2. Aba **Console**
3. Execute:
   ```sql
   SELECT COUNT(*) as total FROM courses;
   SELECT COUNT(*) as total FROM payment_links;
   ```

---

## 📝 Arquivo de Importação Completo

Se quiser importar todos os 60 cursos de uma vez pelo Console D1, vou gerar um arquivo SQL otimizado:

```bash
# Gerar arquivo otimizado
cd /home/user/webapp

# Criar arquivo único com todos os dados
cat seed-add-courses.sql fix-payment-links.sql add-pdfs.sql > import-all.sql

# Copiar conteúdo
cat import-all.sql
```

Então:
1. Copie todo o conteúdo de `import-all.sql`
2. Vá para D1 Console no Cloudflare
3. Cole e execute

---

## ✅ Checklist de Configuração

### Database D1

- [ ] Acessar: https://dash.cloudflare.com/ → Storage & Databases → D1
- [ ] Database `vemgo` existe (se não, criar)
- [ ] Tabelas criadas (courses, payment_links, sales)
- [ ] Dados importados (60 cursos)
- [ ] Payment links criados

### Cloudflare Pages Binding

- [ ] Acessar: https://dash.cloudflare.com/ → Workers & Pages → vemgo → Settings
- [ ] Functions → Bindings → Add binding
- [ ] Type: D1 database
- [ ] Variable name: `DB`
- [ ] D1 database: `vemgo`
- [ ] Salvar

### Testes

- [ ] GET /api/courses retorna cursos (não erro 500)
- [ ] Admin login funciona
- [ ] Dashboard mostra cursos
- [ ] Editar curso funciona

---

## 🎯 Resumo Rápido

**Caminho mais fácil**:

1. **Criar/Verificar D1**: https://dash.cloudflare.com/ → Storage & Databases → D1
2. **Criar tabelas**: Console D1 → executar SQLs
3. **Importar dados**: Console D1 → executar seed-add-courses.sql
4. **Vincular ao Pages**: Workers & Pages → vemgo → Settings → Bindings → Add D1
5. **Testar**: https://vemgo.pages.dev/api/courses

---

**Tempo estimado**: 10-15 minutos  
**Dificuldade**: Média  
**Método**: 100% via Dashboard (sem CLI)

---

**Última atualização**: 2026-03-13  
**Status**: Aguardando configuração manual
