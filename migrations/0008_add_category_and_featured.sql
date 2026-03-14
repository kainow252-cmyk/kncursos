-- Adicionar campos de categoria e destaque aos cursos

-- Adicionar coluna category (padrão: 'Geral')
ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Adicionar coluna featured (padrão: 0 = não destacado)
ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0;

-- Criar índice para melhorar performance de queries por categoria
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Criar índice para cursos em destaque
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
