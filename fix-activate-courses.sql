-- Ativar todos os cursos existentes
UPDATE courses SET active = 1 WHERE active IS NULL OR active = 0;

-- Verificar quantos foram ativados
SELECT COUNT(*) as total_courses_active FROM courses WHERE active = 1;
