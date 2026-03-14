-- Adicionar colunas image_width e image_height se não existirem
-- SQLite não suporta ALTER TABLE IF NOT EXISTS, então vamos tentar adicionar
-- Se falhar, significa que já existe

-- Para verificar se as colunas existem, use:
PRAGMA table_info(courses);

-- Se as colunas não existirem, execute:
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;

-- Atualizar cursos existentes
UPDATE courses SET image_width = 400 WHERE image_width IS NULL;
UPDATE courses SET image_height = 300 WHERE image_height IS NULL;
