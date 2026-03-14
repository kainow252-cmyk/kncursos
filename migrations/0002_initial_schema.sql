-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  content TEXT,
  image_url TEXT,
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
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_links_code ON payment_links(link_code);
CREATE INDEX IF NOT EXISTS idx_sales_course ON sales(course_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);
