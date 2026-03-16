# 🔗 Configurar D1 Binding no Cloudflare Pages

## ✅ Variáveis Já Configuradas

Você já tem todas as variáveis de ambiente:
- ✅ ADMIN_PASSWORD
- ✅ ADMIN_USERNAME  
- ✅ EMAIL_FROM
- ✅ JWT_SECRET
- ✅ MERCADOPAGO_ACCESS_TOKEN
- ✅ MERCADOPAGO_PUBLIC_KEY
- ✅ RESEND_API_KEY
- ✅ RESEND_WEBHOOK_SECRET

---

## 🚨 O que está faltando: D1 Binding

**O erro 500** acontece porque o **banco de dados D1 não está vinculado** ao projeto Pages.

---

## 🔧 Solução: Adicionar D1 Binding

### Passo 1: Na mesma página de Settings

Você está em:
```
https://dash.cloudflare.com/...
→ Workers & Pages
→ vemgo  
→ Settings
→ Variáveis e segredos ← VOCÊ ESTÁ AQUI
```

### Passo 2: Ir para Associações (Bindings)

**Role a página para baixo** ou clique na aba **"Associações"** (pode estar como "Bindings" ou "Functions")

Você verá uma seção parecida com:

```
┌─────────────────────────────────────────────────┐
│ Associações (Bindings)                          │
│                                                 │
│ Vincule recursos do Cloudflare ao seu projeto  │
│                                                 │
│ [ Adicionar ]  ou  [ Add ]                      │
└─────────────────────────────────────────────────┘
```

### Passo 3: Adicionar D1 Database

1. Clique em **"Adicionar"** ou **"Add"** (botão azul)
2. Aparecerá um formulário:

```
┌─────────────────────────────────────────────────┐
│ Adicionar associação                            │
├─────────────────────────────────────────────────┤
│ Tipo: [Selecione um tipo ▼]                     │
│                                                 │
│ Opções disponíveis:                             │
│  • D1 database                    ← SELECIONE   │
│  • KV namespace                                 │
│  • R2 bucket                                    │
│  • Durable Object                               │
│  • Service binding                              │
│  • Queue                                        │
└─────────────────────────────────────────────────┘
```

3. **Selecione**: `D1 database`

### Passo 4: Preencher Formulário

Após selecionar D1, aparecerá:

```
┌─────────────────────────────────────────────────┐
│ Adicionar associação D1                         │
├─────────────────────────────────────────────────┤
│ Nome da variável:                               │
│ [DB                            ]  ← DIGITE ISSO │
│                                                 │
│ Banco de dados D1:                              │
│ [Selecione um banco de dados ▼]                 │
│                                                 │
│ Opções:                                         │
│  • vemgo                      ← SE EXISTIR   │
│  • Criar novo banco de dados                    │
└─────────────────────────────────────────────────┘
```

**Preencha**:
- **Nome da variável**: `DB` (exatamente assim, em MAIÚSCULAS)
- **Banco de dados D1**: 
  - Se `vemgo` aparecer na lista → Selecione
  - Se não aparecer → Veja "Cenário B" abaixo

### Passo 5: Salvar

Clique em **"Salvar"** ou **"Save"**

---

## 📊 Cenário A: Database "vemgo" Aparece na Lista

✅ **Perfeito!** Apenas selecione e salve.

Após salvar, você verá:

```
┌─────────────────────────────────────────────────┐
│ Associações (Bindings)                          │
├─────────────────────────────────────────────────┤
│ Tipo         Nome    Valor                      │
│ D1 database  DB      vemgo                   │
└─────────────────────────────────────────────────┘
```

---

## 📊 Cenário B: Database NÃO Aparece na Lista

Se `vemgo` não aparecer, você precisa criar o database primeiro.

### Criar Database D1

1. **Abra uma nova aba** do navegador
2. Acesse: https://dash.cloudflare.com/
3. Menu lateral → **Storage & Databases** → **D1**
4. Clique em **"Create"** ou **"Criar banco de dados"**
5. Preencha:
   - **Nome**: `vemgo`
   - **Localização**: Automatic (ou South America se disponível)
6. Clique em **Create**
7. O database será criado

### Criar Tabelas

1. Clique no database **vemgo** recém-criado
2. Vá para a aba **Console**
3. Cole e execute este SQL:

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

### Adicionar Dados de Teste

Execute no Console D1 (alguns cursos para teste):

```sql
INSERT INTO courses (title, description, price, content, image_url, pdf_url, category, featured) VALUES
('Marketing Digital Completo', 'Aprenda estratégias completas', 197.00, 'Módulos: Fundamentos, Social Media, Tráfego', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'https://example.com/pdf1.pdf', 'Marketing Digital', 1),
('Python Avançado', 'Domine Python', 197.00, 'Módulos: POO, APIs, Projetos', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 'https://example.com/pdf2.pdf', 'Programação', 1);

INSERT INTO payment_links (course_id, link_code) VALUES
(1, 'MKT2024-001'),
(2, 'PROG2024-001');
```

### Voltar para Associações

Agora volte para:
```
Workers & Pages → vemgo → Settings → Associações
```

E adicione o binding conforme **Passo 3** acima. Agora `vemgo` deve aparecer na lista!

---

## 🧪 Testar Após Configuração

### Teste 1: API

```bash
curl https://vemgo.pages.dev/api/courses
```

**Antes** (sem binding):
```json
{"error": "Internal Server Error"}
```

**Depois** (com binding):
```json
[
  {
    "id": 1,
    "title": "Marketing Digital Completo",
    "price": 197,
    ...
  },
  ...
]
```

### Teste 2: Admin Dashboard

1. Acesse: https://vemgo.pages.dev/login
2. Login: `admin` / `vemgo2024`
3. Dashboard deve mostrar cursos
4. Editar curso deve funcionar (sem erro 500)

---

## 📸 Visual da Configuração Final

Após tudo configurado, suas **Settings** devem ter:

### Variáveis e segredos (8 variáveis)
```
✅ ADMIN_PASSWORD
✅ ADMIN_USERNAME  
✅ EMAIL_FROM
✅ JWT_SECRET
✅ MERCADOPAGO_ACCESS_TOKEN
✅ MERCADOPAGO_PUBLIC_KEY
✅ RESEND_API_KEY
✅ RESEND_WEBHOOK_SECRET
```

### Associações (1 binding)
```
✅ D1 database: DB → vemgo
```

---

## ✅ Checklist

- [x] 8 variáveis de ambiente configuradas
- [ ] D1 binding adicionado (Nome: `DB`, Database: `vemgo`)
- [ ] Database `vemgo` existe em D1
- [ ] Tabelas criadas no database
- [ ] Dados de teste adicionados
- [ ] API testada (retorna cursos)
- [ ] Admin testado (carrega cursos)

---

## 🎯 Resumo: O que fazer AGORA

1. **Rolar a página** na mesma tela de Settings
2. Procurar seção **"Associações"** ou **"Bindings"**
3. Clicar em **"Adicionar"**
4. Tipo: **D1 database**
5. Nome da variável: **`DB`**
6. Banco de dados: **`vemgo`** (se não existir, criar primeiro)
7. **Salvar**
8. **Testar**: `curl https://vemgo.pages.dev/api/courses`

---

**Tempo**: 2-5 minutos  
**Resultado**: API funcionando + Admin funcionando + Erro 500 resolvido ✅

---

**Última atualização**: 2026-03-13
