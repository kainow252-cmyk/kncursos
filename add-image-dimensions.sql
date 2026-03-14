-- Adicionar colunas de dimensões de imagem
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;

-- Atualizar cursos existentes com dimensões padrão
UPDATE courses SET image_width = 400, image_height = 300 WHERE image_width IS NULL;
