#!/bin/bash

echo "🔧 Aplicando migration de usuários na PRODUÇÃO..."

# Criar tabela users
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database/$CLOUDFLARE_D1_DATABASE_ID/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('\''admin'\'', '\''employee'\'')), name TEXT, email TEXT, active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }' | jq '.'

echo ""

# Inserir admin
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database/$CLOUDFLARE_D1_DATABASE_ID/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES ('\''admin'\'', '\''kncursos2024'\'', '\''admin'\'', '\''Administrador'\'', '\''admin@kncursos.com.br'\'');"
  }' | jq '.'

echo ""

# Inserir funcionário
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database/$CLOUDFLARE_D1_DATABASE_ID/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES ('\''funcionario'\'', '\''funcionario123'\'', '\''employee'\'', '\''Funcionário Teste'\'', '\''funcionario@kncursos.com.br'\'');"
  }' | jq '.'

echo ""
echo "✅ Migration aplicada!"
