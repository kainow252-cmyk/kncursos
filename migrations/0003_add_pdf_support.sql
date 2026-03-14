-- Adicionar campo pdf_url na tabela de cursos
ALTER TABLE courses ADD COLUMN pdf_url TEXT;

-- Adicionar campos de acesso na tabela de vendas
ALTER TABLE sales ADD COLUMN access_token TEXT;
ALTER TABLE sales ADD COLUMN pdf_downloaded INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN download_count INTEGER DEFAULT 0;

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_sales_token ON sales(access_token);
