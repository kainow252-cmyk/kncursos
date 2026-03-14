-- Criar links para cursos sem payment_link
-- Marketing Digital
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'MKT2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Marketing Digital' AND id NOT IN (SELECT course_id FROM payment_links);

-- Tecnologia
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'TEC2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Tecnologia' AND id NOT IN (SELECT course_id FROM payment_links);

-- Programação
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'PROG2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Programação' AND id NOT IN (SELECT course_id FROM payment_links);

-- Negócios Online
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'NEG2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Negócios Online' AND id NOT IN (SELECT course_id FROM payment_links);

-- Design
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'DES2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Design' AND id NOT IN (SELECT course_id FROM payment_links);

-- Finanças
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'FIN2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Finanças' AND id NOT IN (SELECT course_id FROM payment_links);

-- Saúde e Bem-Estar
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'SAU2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Saúde e Bem-Estar' AND id NOT IN (SELECT course_id FROM payment_links);

-- Inteligência Artificial
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'IA2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Inteligência Artificial' AND id NOT IN (SELECT course_id FROM payment_links);

-- Idiomas
INSERT OR IGNORE INTO payment_links (link_code, course_id, status)
SELECT 'IDI2024-' || printf('%03d', ROW_NUMBER() OVER ()), id, 'active'
FROM courses WHERE category = 'Idiomas' AND id NOT IN (SELECT course_id FROM payment_links);
