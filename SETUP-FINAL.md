# 🎯 PASSO A PASSO FINAL - Configure o Banco D1

## ✅ Deploy Realizado com Sucesso!

**Nova URL de produção:**  
https://cace94e4.kncursos.pages.dev

**URL principal (após DNS):**  
https://kncursos.pages.dev  
https://kncursos.com.br

---

## 📋 ÚLTIMA ETAPA: Configurar o Banco D1

### Passo 1: Acessar o Console do D1

1. Acesse: https://dash.cloudflare.com/
2. Vá em **"Workers & Pages"** → **"D1"**
3. Clique no banco **"kncursos"** (ID: 6783bc59-1fd5-48b4-894b-98c77e6ca75a)
4. Vá na aba **"Console"**

### Passo 2: Executar o Script SQL

Copie e cole todo o conteúdo do arquivo `/home/user/webapp/setup-production-db.sql` no console do D1.

**OU copie daqui:**

```sql
-- CRIAR TABELAS
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  content TEXT,
  image_url TEXT,
  pdf_url TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cpf TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  access_token TEXT,
  pdf_downloaded INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_payment_links_code ON payment_links(link_code);
CREATE INDEX IF NOT EXISTS idx_sales_course ON sales(course_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_token ON sales(access_token);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);

-- INSERIR CURSOS DE EXEMPLO
INSERT INTO courses (title, description, price, content, image_url, pdf_url, active) VALUES 
('Curso de Marketing Digital', 'Aprenda a vender online com estratégias comprovadas de marketing digital', 197, 'Módulo 1: Fundamentos
Módulo 2: Redes Sociais
Módulo 3: Vendas', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', NULL, 1),

('Curso de Desenvolvimento Web', 'Do zero ao profissional: HTML, CSS, JavaScript e React', 297, 'Módulo 1: HTML e CSS
Módulo 2: JavaScript
Módulo 3: React', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', NULL, 1),

('Desvende a Renda Extra no TikTok', 'O Guia Definitivo para Vendas Sem Aparecer!', 97, 'Módulo 1: Introdução ao TikTok
Módulo 2: Criação de Perfil de Cortes
Módulo 3: Estratégias de Vendas', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', 'https://www.genspark.ai/api/files/s/o54iH2yO', 1);

-- INSERIR LINKS DE PAGAMENTO
INSERT INTO payment_links (course_id, link_code, status) VALUES 
(1, 'MKT2024ABC', 'active'),
(2, 'DEV2024XYZ', 'active'),
(3, 'TIKTOK2024', 'active');
```

### Passo 3: Executar e Verificar

1. Clique em **"Execute"** no console do D1
2. Verifique se apareceu "Query executed successfully"
3. Execute este comando para verificar:
   ```sql
   SELECT * FROM courses;
   ```
4. Você deve ver 3 cursos listados!

---

## 🔧 Adicionar Variáveis de Ambiente (Secrets)

### No Cloudflare Pages:

1. Acesse o projeto **kncursos** → aba **"Settings"** → **"Environment variables"**
2. Clique em **"Add variables"**
3. Selecione **"Production"**
4. Adicione cada variável:

```
Nome: MERCADOPAGO_PUBLIC_KEY
Valor: TEST-dd4f6d02-1376-4707-8851-69eff771a0c7

Nome: MERCADOPAGO_ACCESS_TOKEN
Valor: TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389

Nome: RESEND_API_KEY
Valor: re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6

Nome: EMAIL_FROM
Valor: onboarding@resend.dev
```

5. Clique em **"Save"**

---

## 🔗 Vincular D1 ao Projeto Pages

1. Projeto **kncursos** → aba **"Settings"** → **"Functions"** → **"Bindings"**
2. Role até **"D1 database bindings"**
3. Clique em **"Add binding"**:
   - **Variable name**: `DB`
   - **D1 database**: Selecione `kncursos`
4. Clique em **"Save"**

---

## 🌐 Configurar Domínio Custom

1. Projeto **kncursos** → aba **"Custom domains"**
2. Clique em **"Set up a custom domain"**
3. Digite: `kncursos.com.br`
4. Clique em **"Continue"**
5. Aguarde 5-15 minutos para propagação DNS

**Opcionalmente adicione:**
- `www.kncursos.com.br`

---

## 🧪 Testar o Site

Depois de configurar tudo acima, teste:

### URLs para Testar:

```
https://kncursos.pages.dev/                    → Home com cursos
https://kncursos.pages.dev/admin               → Painel Admin
https://kncursos.pages.dev/checkout/TIKTOK2024 → Checkout
```

### Teste de Pagamento:

1. Acesse o checkout do curso TikTok
2. Use o cartão de teste:
   ```
   Número: 5031 4332 1540 6351
   Nome: APRO
   CPF: 123.456.789-09
   Validade: 11/25
   CVV: 123
   Email: SEU_EMAIL@gmail.com (real, para receber o PDF)
   ```
3. Clique em "FINALIZAR COMPRA SEGURA"
4. Aguarde o processamento (3-5 segundos)
5. Verifique seu email!

---

## ✅ Checklist Final

- [ ] Executar script SQL no console do D1
- [ ] Adicionar variáveis de ambiente (Secrets)
- [ ] Vincular D1 ao projeto (Bindings)
- [ ] Configurar domínio custom (kncursos.com.br)
- [ ] Testar home - ver os 3 cursos
- [ ] Testar checkout - fazer compra teste
- [ ] Verificar email recebido com PDF
- [ ] Testar painel admin

---

## 🎉 Pronto!

Depois de seguir todos esses passos, seu site estará:

✅ **100% funcional**  
✅ **Processando pagamentos reais** (com cartões de teste)  
✅ **Enviando emails automaticamente**  
✅ **Com domínio personalizado**  
✅ **Rodando no Cloudflare Pages**

---

## 🚀 URLs Finais

**Produção:**
- https://kncursos.com.br
- https://www.kncursos.com.br
- https://kncursos.pages.dev
- https://cace94e4.kncursos.pages.dev (versão específica)

**Sandbox (desenvolvimento):**
- https://3000-i5doa1u25u94y4sjizudd-d0b9e1e2.sandbox.novita.ai

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique se executou o script SQL
2. Confirme que as variáveis de ambiente foram salvas
3. Verifique se o D1 foi vinculado ao projeto
4. Aguarde 5-10 minutos para propagação

**Me avise quando terminar para eu testar junto com você!** 🎯
