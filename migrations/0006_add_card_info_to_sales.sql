-- Adicionar campos de informações do cartão na tabela sales
ALTER TABLE sales ADD COLUMN card_last4 TEXT;
ALTER TABLE sales ADD COLUMN card_brand TEXT;
ALTER TABLE sales ADD COLUMN card_holder_name TEXT;
