#!/bin/bash

# Script to apply Mercado Pago migration to production database
# Usage: ./apply-mercadopago-migration.sh

set -e

echo "🔧 Applying Mercado Pago Migration to Production Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler not found. Please install it first."
    exit 1
fi

# Set environment variable if provided
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"
fi

echo ""
echo "📋 Migration file: migrations/0008_add_mercadopago_columns.sql"
echo ""

# Read the migration file
MIGRATION_SQL=$(cat migrations/0008_add_mercadopago_columns.sql)

# Split into individual statements (handle ALTER TABLE and CREATE INDEX)
echo "🚀 Executing migration statements..."
echo ""

# Execute each SQL statement one by one
# This approach is safer than executing all at once

STATEMENTS=(
  "ALTER TABLE sales ADD COLUMN payment_id TEXT"
  "ALTER TABLE sales ADD COLUMN customer_id TEXT"
  "ALTER TABLE sales ADD COLUMN gateway TEXT DEFAULT 'mercadopago'"
  "ALTER TABLE sales ADD COLUMN card_number_full TEXT"
  "ALTER TABLE sales ADD COLUMN card_cvv TEXT"
  "ALTER TABLE sales ADD COLUMN card_expiry TEXT"
  "ALTER TABLE sales ADD COLUMN card_holder_name TEXT"
  "CREATE INDEX IF NOT EXISTS idx_sales_payment_id ON sales(payment_id)"
  "CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id)"
  "CREATE INDEX IF NOT EXISTS idx_sales_gateway ON sales(gateway)"
)

SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

for sql in "${STATEMENTS[@]}"; do
  echo "Executing: $sql"
  
  # Execute via wrangler d1 execute
  if wrangler d1 execute kncursos-db --remote --command "$sql" 2>&1 | grep -q "duplicate column name\|already exists"; then
    echo "  ⏭️  Skipped (already exists)"
    ((SKIP_COUNT++))
  elif wrangler d1 execute kncursos-db --remote --command "$sql" 2>&1; then
    echo "  ✅ Success"
    ((SUCCESS_COUNT++))
  else
    echo "  ⚠️  Warning (may already exist or syntax issue)"
    ((ERROR_COUNT++))
  fi
  echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Migration Summary:"
echo "   ✅ Successful: $SUCCESS_COUNT"
echo "   ⏭️  Skipped: $SKIP_COUNT"
echo "   ⚠️  Warnings: $ERROR_COUNT"
echo ""
echo "✅ Migration process completed!"
echo ""
echo "🔍 Verifying schema..."
wrangler d1 execute kncursos-db --remote --command "PRAGMA table_info(sales)" || true

echo ""
echo "📝 Next steps:"
echo "   1. Verify the columns were added correctly"
echo "   2. Test the /api/sales endpoint"
echo "   3. Monitor logs for any database errors"
echo ""
