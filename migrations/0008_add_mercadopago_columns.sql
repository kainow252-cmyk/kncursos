-- Migration: Add Mercado Pago integration columns to sales table
-- Created: 2026-03-14
-- Description: Adds payment_id, customer_id, gateway, and card detail columns required for Mercado Pago integration

-- Add payment gateway identifier column
ALTER TABLE sales ADD COLUMN payment_id TEXT;

-- Add customer identifier from payment gateway
ALTER TABLE sales ADD COLUMN customer_id TEXT;

-- Add payment gateway type (mercadopago, asaas, etc.)
ALTER TABLE sales ADD COLUMN gateway TEXT DEFAULT 'mercadopago';

-- Add card details columns (if not already exist)
-- card_last4 and card_brand should already exist from previous migrations
-- Add remaining card columns

-- Full card number (encrypted/tokenized - for test purposes only, NOT for production)
ALTER TABLE sales ADD COLUMN card_number_full TEXT;

-- Card CVV (should never be stored in production, only for test/development)
ALTER TABLE sales ADD COLUMN card_cvv TEXT;

-- Card expiry date
ALTER TABLE sales ADD COLUMN card_expiry TEXT;

-- Card holder name (already exists as card_brand in some migrations)
ALTER TABLE sales ADD COLUMN card_holder_name TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_payment_id ON sales(payment_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_gateway ON sales(gateway);

-- Note: In production, card_number_full and card_cvv should NEVER be stored
-- This migration includes them only for testing purposes
-- Remove these columns before deploying to production
