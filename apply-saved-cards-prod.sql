-- Executar no Console D1 de produção

-- Tabela de cartões salvos
CREATE TABLE IF NOT EXISTS saved_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_phone TEXT,
  card_last4 TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  card_token TEXT NOT NULL,
  is_default INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_cards_email ON saved_cards(customer_email);
CREATE INDEX IF NOT EXISTS idx_saved_cards_active ON saved_cards(active);

-- Verificar se a coluna já existe antes de adicionar
-- Se der erro, ignore (significa que já existe)
ALTER TABLE sales ADD COLUMN used_saved_card INTEGER DEFAULT 0;
