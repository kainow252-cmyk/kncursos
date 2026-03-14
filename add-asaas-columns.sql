-- Adicionar coluna asaas_payment_id para guardar ID da transação Asaas
ALTER TABLE sales ADD COLUMN asaas_payment_id TEXT;

-- Adicionar coluna asaas_customer_id para guardar ID do cliente Asaas
ALTER TABLE sales ADD COLUMN asaas_customer_id TEXT;

-- Verificar schema
PRAGMA table_info(sales);
