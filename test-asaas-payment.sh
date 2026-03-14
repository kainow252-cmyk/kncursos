#!/bin/bash

# ==============================================
# TESTE COMPLETO: Pagamento com Cartão Asaas
# ==============================================

echo "🧪 Iniciando teste de pagamento com Asaas..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BASE_URL="http://localhost:3000"
LINK_CODE="MKT2024-001"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DADOS DO TESTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URL: $BASE_URL"
echo "🔗 Link Code: $LINK_CODE"
echo ""

# Dados do cliente (da documentação Asaas)
CUSTOMER_NAME="Marcelo Henrique Almeida"
CUSTOMER_CPF="24971563792"
CUSTOMER_EMAIL="marcelo@example.com"
CUSTOMER_PHONE="47998781877"

# Cartão de teste (da documentação Asaas)
CARD_NUMBER="5162306219378829"
CARD_HOLDER="marcelo h almeida"
CARD_MONTH="05"
CARD_YEAR="2026"
CARD_CVV="318"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 CLIENTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nome: $CUSTOMER_NAME"
echo "CPF: $CUSTOMER_CPF"
echo "Email: $CUSTOMER_EMAIL"
echo "Telefone: $CUSTOMER_PHONE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💳 CARTÃO DE TESTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Número: $CARD_NUMBER"
echo "Titular: $CARD_HOLDER"
echo "Validade: $CARD_MONTH/$CARD_YEAR"
echo "CVV: $CARD_CVV"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 PROCESSANDO PAGAMENTO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Fazer requisição
RESPONSE=$(curl -s -X POST "$BASE_URL/api/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "'$LINK_CODE'",
    "customer_name": "'$CUSTOMER_NAME'",
    "customer_cpf": "'$CUSTOMER_CPF'",
    "customer_email": "'$CUSTOMER_EMAIL'",
    "customer_phone": "'$CUSTOMER_PHONE'",
    "card_number": "'$CARD_NUMBER'",
    "card_holder_name": "'$CARD_HOLDER'",
    "card_expiration_month": "'$CARD_MONTH'",
    "card_expiration_year": "'$CARD_YEAR'",
    "card_cvv": "'$CARD_CVV'"
  }')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESPOSTA DA API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RESPONSE" | jq .
echo ""

# Verificar se teve sucesso
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PAGAMENTO APROVADO!${NC}"
    echo ""
    
    # Extrair dados
    SALE_ID=$(echo "$RESPONSE" | jq -r '.sale_id')
    AMOUNT=$(echo "$RESPONSE" | jq -r '.amount')
    PAYMENT_ID=$(echo "$RESPONSE" | jq -r '.payment_id')
    ASAAS_PAYMENT_ID=$(echo "$RESPONSE" | jq -r '.asaas_payment_id')
    ASAAS_CUSTOMER_ID=$(echo "$RESPONSE" | jq -r '.asaas_customer_id')
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    DOWNLOAD_URL=$(echo "$RESPONSE" | jq -r '.download_url')
    COURSE_TITLE=$(echo "$RESPONSE" | jq -r '.course_title')
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 DETALHES DA VENDA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🆔 Sale ID: $SALE_ID"
    echo "💰 Valor: R$ $AMOUNT"
    echo "📚 Curso: $COURSE_TITLE"
    echo ""
    echo "🔑 Payment ID: $PAYMENT_ID"
    echo "🔑 Asaas Payment ID: $ASAAS_PAYMENT_ID"
    echo "🔑 Asaas Customer ID: $ASAAS_CUSTOMER_ID"
    echo ""
    echo "🎫 Token de Acesso: $ACCESS_TOKEN"
    echo "📥 URL Download: $BASE_URL$DOWNLOAD_URL"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 VERIFICAR NO ASAAS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}1. Acesse: https://sandbox.asaas.com/${NC}"
    echo -e "${BLUE}2. Menu: Cobranças${NC}"
    echo -e "${BLUE}3. Busque por: $ASAAS_PAYMENT_ID${NC}"
    echo ""
    echo -e "${YELLOW}Ou veja o cliente:${NC}"
    echo -e "${BLUE}1. Menu: Clientes${NC}"
    echo -e "${BLUE}2. Busque por CPF: $CUSTOMER_CPF${NC}"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📧 EMAIL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️ Email enviado para: gelci.silva252@gmail.com${NC}"
    echo -e "${YELLOW}   (Resend em modo sandbox)${NC}"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🗄️ VERIFICAR NO BANCO D1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Execute:"
    echo ""
    echo -e "${BLUE}npx wrangler d1 execute kncursos --local --command=\"SELECT * FROM sales WHERE id = $SALE_ID\"${NC}"
    echo ""
    
    exit 0
else
    echo -e "${RED}❌ ERRO NO PAGAMENTO${NC}"
    echo ""
    
    # Extrair mensagem de erro
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Erro desconhecido"')
    DETAILS=$(echo "$RESPONSE" | jq -r '.details // ""')
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ DETALHES DO ERRO"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Erro: $ERROR"
    echo ""
    if [ ! -z "$DETAILS" ]; then
        echo "Detalhes:"
        echo "$DETAILS" | jq .
    fi
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 POSSÍVEIS SOLUÇÕES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Verificar se o servidor está rodando: pm2 list"
    echo "2. Verificar logs: pm2 logs kncursos --nostream"
    echo "3. Verificar se link MKT2024-001 existe no banco"
    echo "4. Verificar ASAAS_API_KEY no .dev.vars"
    echo ""
    
    exit 1
fi
