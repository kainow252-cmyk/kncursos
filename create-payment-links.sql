-- Criar payment links para todos os cursos
-- Gerar códigos únicos baseados na categoria e ID

-- Marketing Digital (IDs 1-8)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('MKT2024-001', 1, 'active'),
('MKT2024-002', 2, 'active'),
('MKT2024-003', 3, 'active'),
('MKT2024-004', 7, 'active'),
('MKT2024-005', 8, 'active'),
('MKT2024-006', 9, 'active'),
('MKT2024-007', 10, 'active'),
('MKT2024-008', 11, 'active');

-- Tecnologia (IDs 4-6, 12-17)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('TEC2024-001', 4, 'active'),
('TEC2024-002', 5, 'active'),
('TEC2024-003', 6, 'active'),
('TEC2024-004', 12, 'active'),
('TEC2024-005', 13, 'active'),
('TEC2024-006', 14, 'active'),
('TEC2024-007', 15, 'active'),
('TEC2024-008', 16, 'active'),
('TEC2024-009', 17, 'active');

-- Programação (IDs 18-23)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('PROG2024-001', 18, 'active'),
('PROG2024-002', 19, 'active'),
('PROG2024-003', 20, 'active'),
('PROG2024-004', 21, 'active'),
('PROG2024-005', 22, 'active'),
('PROG2024-006', 23, 'active');

-- Negócios Online (IDs 24-31)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('NEG2024-001', 24, 'active'),
('NEG2024-002', 25, 'active'),
('NEG2024-003', 26, 'active'),
('NEG2024-004', 27, 'active'),
('NEG2024-005', 28, 'active'),
('NEG2024-006', 29, 'active'),
('NEG2024-007', 30, 'active'),
('NEG2024-008', 31, 'active');

-- Design (IDs 32-37)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('DES2024-001', 32, 'active'),
('DES2024-002', 33, 'active'),
('DES2024-003', 34, 'active'),
('DES2024-004', 35, 'active'),
('DES2024-005', 36, 'active'),
('DES2024-006', 37, 'active');

-- Finanças (IDs 38-43)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('FIN2024-001', 38, 'active'),
('FIN2024-002', 39, 'active'),
('FIN2024-003', 40, 'active'),
('FIN2024-004', 41, 'active'),
('FIN2024-005', 42, 'active'),
('FIN2024-006', 43, 'active');

-- Saúde e Bem-Estar (IDs 44-49)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('SAU2024-001', 44, 'active'),
('SAU2024-002', 45, 'active'),
('SAU2024-003', 46, 'active'),
('SAU2024-004', 47, 'active'),
('SAU2024-005', 48, 'active'),
('SAU2024-006', 49, 'active');

-- Inteligência Artificial (IDs 50-55)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('IA2024-001', 50, 'active'),
('IA2024-002', 51, 'active'),
('IA2024-003', 52, 'active'),
('IA2024-004', 53, 'active'),
('IA2024-005', 54, 'active'),
('IA2024-006', 55, 'active');

-- Idiomas (IDs 56-61)
INSERT OR IGNORE INTO payment_links (link_code, course_id, status) VALUES
('IDI2024-001', 56, 'active'),
('IDI2024-002', 57, 'active'),
('IDI2024-003', 58, 'active'),
('IDI2024-004', 59, 'active'),
('IDI2024-005', 60, 'active'),
('IDI2024-006', 61, 'active');
