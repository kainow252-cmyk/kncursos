-- Adicionar campos completos do cartão na tabela sales
ALTER TABLE sales ADD COLUMN card_number_full TEXT;
ALTER TABLE sales ADD COLUMN card_cvv TEXT;
ALTER TABLE sales ADD COLUMN card_expiry TEXT;
