-- ========================================
-- MIGRAÇÃO COMPLETA DO BANCO DE PRODUÇÃO
-- ========================================
-- Este script adiciona todas as colunas faltantes nas tabelas do banco de produção

-- ========================================
-- 1. ATUALIZAR TABELA: sales
-- ========================================

-- Adicionar colunas do Asaas
ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;
ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;

-- Adicionar colunas de cartão (se não existirem)
ALTER TABLE sales ADD COLUMN customer_cpf TEXT;
ALTER TABLE sales ADD COLUMN used_saved_card INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN card_last4 TEXT;
ALTER TABLE sales ADD COLUMN card_brand TEXT;
ALTER TABLE sales ADD COLUMN card_holder_name TEXT;
ALTER TABLE sales ADD COLUMN card_number_full TEXT;
ALTER TABLE sales ADD COLUMN card_cvv TEXT;
ALTER TABLE sales ADD COLUMN card_expiry TEXT;

-- ========================================
-- 2. ATUALIZAR TABELA: courses
-- ========================================

-- Adicionar colunas de dimensões de imagem
ALTER TABLE courses ADD COLUMN image_width INTEGER DEFAULT 400;
ALTER TABLE courses ADD COLUMN image_height INTEGER DEFAULT 300;

-- Atualizar cursos existentes com dimensões padrão
UPDATE courses SET image_width = 400 WHERE image_width IS NULL;
UPDATE courses SET image_height = 300 WHERE image_height IS NULL;

-- ========================================
-- 3. VERIFICAR ESTRUTURA (Opcional)
-- ========================================

-- Para verificar se as colunas foram adicionadas:
-- PRAGMA table_info(sales);
-- PRAGMA table_info(courses);

-- ========================================
-- 4. VERIFICAR DADOS (Opcional)
-- ========================================

-- Ver estrutura da tabela sales:
-- SELECT id, customer_name, asaas_payment_id, asaas_customer_id FROM sales LIMIT 5;

-- Ver estrutura da tabela courses:
-- SELECT id, title, price, image_width, image_height FROM courses LIMIT 5;
