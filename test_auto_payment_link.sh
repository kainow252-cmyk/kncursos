#!/bin/bash
echo "🧪 TESTE: CRIAÇÃO AUTOMÁTICA DE PAYMENT LINK"
echo "=============================================="
echo ""

echo "1️⃣ Criando curso de teste..."
RESPONSE=$(curl -s -X POST "https://kncursos.com.br/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Teste Auto Payment Link",
    "description": "Testando criação automática de payment link",
    "price": 19.90,
    "category": "Geral",
    "featured": false
  }')

echo "$RESPONSE" | jq '.'
echo ""

# Extrair course_id e link_code
COURSE_ID=$(echo "$RESPONSE" | jq -r '.id')
LINK_CODE=$(echo "$RESPONSE" | jq -r '.link_code')
CHECKOUT_URL=$(echo "$RESPONSE" | jq -r '.checkout_url')

echo "2️⃣ Verificando dados retornados..."
echo "   Course ID: $COURSE_ID"
echo "   Link Code: $LINK_CODE"
echo "   Checkout URL: $CHECKOUT_URL"
echo ""

echo "3️⃣ Verificando payment link no banco de dados..."
npx wrangler d1 execute kncursos \
    --remote \
    --command="SELECT * FROM payment_links WHERE course_id = $COURSE_ID" \
    2>&1 | grep -A 20 "results"
echo ""

echo "4️⃣ Testando acesso ao checkout..."
curl -s "$CHECKOUT_URL" | grep -E "(Comprar|Pagamento|class=\"course-title\")" | head -5
echo ""

echo "✅ TESTE CONCLUÍDO!"
echo ""
echo "📝 Resumo:"
echo "   - Curso criado: ID #$COURSE_ID"
echo "   - Payment link: $LINK_CODE"
echo "   - URL checkout: $CHECKOUT_URL"
