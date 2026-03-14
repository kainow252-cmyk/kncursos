-- Dados de exemplo para teste
INSERT OR IGNORE INTO courses (id, title, description, price, content, image_url, pdf_url) VALUES 
  (1, 'Curso de Marketing Digital', 'Aprenda a vender online com estratégias comprovadas de marketing digital', 197.00, 'Módulo 1: Fundamentos\nMódulo 2: Redes Sociais\nMódulo 3: Vendas', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', NULL),
  (2, 'Curso de Desenvolvimento Web', 'Do zero ao profissional: HTML, CSS, JavaScript e React', 297.00, 'Módulo 1: HTML e CSS\nMódulo 2: JavaScript\nMódulo 3: React', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', NULL),
  (3, 'Desvende a Renda Extra no TikTok', 'O Guia Definitivo para Vendas Sem Aparecer! Aprenda estratégias comprovadas para gerar renda extra através de perfis de cortes no TikTok', 97.00, 'Módulo 1: Introdução ao TikTok\nMódulo 2: Criação de Perfil de Cortes\nMódulo 3: Estratégias de Vendas\nMódulo 4: Monetização Sem Aparecer\nMódulo 5: Escala e Automação', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', 'https://www.genspark.ai/api/files/s/o54iH2yO');

-- Gerar alguns links de exemplo
INSERT OR IGNORE INTO payment_links (course_id, link_code) VALUES 
  (1, 'MKT2024ABC'),
  (2, 'DEV2024XYZ'),
  (3, 'TIKTOK2024');
