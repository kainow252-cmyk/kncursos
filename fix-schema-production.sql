-- ========================================
-- FIX: Adicionar colunas faltantes
-- ========================================

-- Adicionar coluna category se não existir
ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Adicionar coluna featured se não existir  
ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);

-- Verificar schema atualizado
PRAGMA table_info(courses);
