# 🎯 Instruções Baseadas na Sua Tela

## O que vejo na sua tela

```
Associações (?)
Defina o conjunto de recursos disponíveis às Pages Functions

Tipo          | Nome           | Valor
Banco de dados D1 | DB         | Vincular
```

---

## ✅ Passo a Passo

### 1. Clique no botão **"Adicionar"** (azul, no canto superior direito da seção Associações)

### 2. No formulário que abrir, preencha:

**Tipo de recurso:**
```
Banco de dados D1
```

**Nome da variável:**
```
DB
```
(Exatamente assim, em MAIÚSCULAS)

**Banco de dados D1:**
```
Procure por: vemgo
```

Se aparecer `vemgo` na lista → Selecione ✅

Se NÃO aparecer → Veja próxima seção

### 3. Clique em **"Salvar"**

---

## 🔍 Se "vemgo" NÃO aparecer na lista

Significa que você precisa criar o database D1 primeiro.

### Criar Database D1

1. **Abra nova aba**: https://dash.cloudflare.com/
2. No menu lateral esquerdo, procure por:
   ```
   Armazenamento e Bancos de Dados
   ou
   Storage & Databases
   ```
3. Clique em **D1**
4. Clique em **"Criar"** ou **"Create database"**
5. Preencha:
   - **Nome**: `vemgo`
   - **Localização**: Automatic (ou South America se disponível)
6. Clique em **"Criar"**

### Criar Tabelas

1. Após criar, clique no database **vemgo**
2. Vá para aba **"Console"**
3. Cole e execute este SQL (um por vez):

```sql
-- 1. Tabela de cursos
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
```

```sql
-- 2. Tabela de payment links
CREATE TABLE payment_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

```sql
-- 3. Tabela de vendas
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
```

```sql
-- 4. Índices
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_featured ON courses(featured);
CREATE INDEX idx_payment_links_course ON payment_links(course_id);
CREATE INDEX idx_sales_access_token ON sales(access_token);
```

### Adicionar Cursos de Teste

```sql
INSERT INTO courses (title, description, price, content, image_url, pdf_url, category, featured) VALUES
('Marketing Digital Completo', 'Aprenda estratégias completas de marketing digital do zero ao avançado', 197.00, '- Módulo 1: Fundamentos do Marketing\n- Módulo 2: Redes Sociais\n- Módulo 3: Tráfego Pago\n- Módulo 4: Email Marketing', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'https://example.com/pdf1.pdf', 'Marketing Digital', 1),

('Python do Zero ao Avançado', 'Domine Python com projetos práticos e aplicações reais', 197.00, '- Módulo 1: Sintaxe Básica\n- Módulo 2: POO\n- Módulo 3: APIs e Web\n- Módulo 4: Projetos', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 'https://example.com/pdf2.pdf', 'Programação', 1),

('JavaScript Completo', 'Do básico ao avançado com ES6+, React e Node.js', 207.00, '- Módulo 1: JavaScript Básico\n- Módulo 2: ES6+\n- Módulo 3: React\n- Módulo 4: Node.js', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a', 'https://example.com/pdf3.pdf', 'Programação', 1);
```

```sql
INSERT INTO payment_links (course_id, link_code) VALUES
(1, 'MKT2024-001'),
(2, 'PROG2024-001'),
(3, 'PROG2024-002');
```

### Voltar para Associações

Agora volte para a aba **Workers & Pages → vemgo → Settings → Associações** e adicione o binding. Agora `vemgo` deve aparecer!

---

## 🧪 Testar Após Salvar

### Teste 1: API

Abra em nova aba:
```
https://vemgo.pages.dev/api/courses
```

**Antes** (sem binding):
```
Error 500
```

**Depois** (com binding):
```json
[
  {
    "id": 1,
    "title": "Marketing Digital Completo",
    ...
  }
]
```

### Teste 2: Admin

1. https://vemgo.pages.dev/login
2. Login: `admin` / `vemgo2024`
3. Dashboard deve mostrar os cursos

---

## 📸 Como Deve Ficar Após Configurar

Na seção **Associações**, você verá:

```
Tipo              | Nome | Valor
Banco de dados D1 | DB   | vemgo
```

---

## ✅ Resumo

1. ✅ Você já tem as 8 variáveis configuradas
2. ⏳ Falta vincular o banco D1
3. 🔵 Clique em **"Adicionar"** na seção Associações
4. 📝 Preencha: Tipo = D1, Nome = DB, Database = vemgo
5. 💾 Salvar
6. 🧪 Testar: https://vemgo.pages.dev/api/courses

---

**Próximo passo**: Clique no botão azul **"Adicionar"** na seção Associações da sua tela! 🚀
