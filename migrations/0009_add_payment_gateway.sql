-- Migration: Adicionar suporte para múltiplos gateways de pagamento
-- Data: 2026-03-14
-- Descrição: Adiciona colunas para identificar qual gateway foi usado (Asaas ou SuitPay)

ALTER TABLE sales ADD COLUMN payment_gateway TEXT DEFAULT 'asaas';
ALTER TABLE sales ADD COLUMN suitpay_payment_id TEXT;
ALTER TABLE sales ADD COLUMN suitpay_customer_id TEXT;

-- Atualizar vendas existentes para terem o gateway definido
UPDATE sales SET payment_gateway = 'asaas' WHERE payment_gateway IS NULL;
