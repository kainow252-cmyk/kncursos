-- Inserir dados de exemplo (cursos e links)
-- Execute este script no Console do D1

-- Limpar dados anteriores (opcional)
DELETE FROM sales;
DELETE FROM payment_links;
DELETE FROM courses;

-- Inserir cursos
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

-- Inserir links de pagamento
INSERT INTO payment_links (course_id, link_code, status) VALUES 
(1, 'MKT2024ABC', 'active'),
(2, 'DEV2024XYZ', 'active'),
(3, 'TIKTOK2024', 'active');

-- Verificar
SELECT 'Cursos cadastrados:' as info, COUNT(*) as total FROM courses;
SELECT 'Links criados:' as info, COUNT(*) as total FROM payment_links;
