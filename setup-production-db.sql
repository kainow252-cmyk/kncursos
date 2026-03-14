-- ========================================
-- SCHEMA COMPLETO DO BANCO KNCURSOS
-- Execute este script no Console do D1
-- ========================================

-- 1. CRIAR TABELAS
-- ========================================

-- Tabela de cursos
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

-- Tabela de links de pagamento
CREATE TABLE IF NOT EXISTS payment_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  link_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabela de vendas
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

-- 2. CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_payment_links_code ON payment_links(link_code);
CREATE INDEX IF NOT EXISTS idx_sales_course ON sales(course_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_token ON sales(access_token);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);

-- 3. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Cursos de exemplo
INSERT INTO courses (title, description, price, content, image_url, pdf_url, active) VALUES 
('Curso de Marketing Digital', 'Aprenda a vender online com estratégias comprovadas de marketing digital', 197, 'Módulo 1: Fundamentos
Módulo 2: Redes Sociais
Módulo 3: Vendas', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', NULL, 1),

('Curso de Desenvolvimento Web', 'Do zero ao profissional: HTML, CSS, JavaScript e React', 297, 'Módulo 1: HTML e CSS
Módulo 2: JavaScript
Módulo 3: React', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', NULL, 1),

('Desvende a Renda Extra no TikTok', 'O Guia Definitivo para Vendas Sem Aparecer! Aprenda estratégias comprovadas para gerar renda extra através de perfis de cortes no TikTok', 97, 'Módulo 1: Introdução ao TikTok
Módulo 2: Criação de Perfil de Cortes
Módulo 3: Estratégias de Vendas
Módulo 4: Monetização Sem Aparecer
Módulo 5: Escala e Automação', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', 'https://www.genspark.ai/api/files/s/o54iH2yO', 1);

-- Links de pagamento para cada curso
INSERT INTO payment_links (course_id, link_code, status) VALUES 
(1, 'MKT2024ABC', 'active'),
(2, 'DEV2024XYZ', 'active'),
(3, 'TIKTOK2024', 'active');

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Para verificar se funcionou, execute:
-- SELECT * FROM courses;
-- SELECT * FROM payment_links;
-- SELECT * FROM sales;
