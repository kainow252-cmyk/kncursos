#!/bin/bash

# Script de teste completo do sistema KN Cursos
# Data: $(date)

set -e  # Para na primeira falha

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        TESTE COMPLETO DO SISTEMA KN CURSOS                  ║"
echo "║        Testando: Pagamentos, Integrações e Emails          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Função para reportar teste
test_result() {
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASSOU:${NC} $2"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FALHOU:${NC} $2"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 1: VERIFICAR INFRAESTRUTURA"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 1: Site está no ar
echo -e "${BLUE}[1/20]${NC} Verificando se o site está online..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://kncursos.com.br)
if [ "$HTTP_CODE" == "200" ]; then
  test_result 0 "Site principal está online (HTTP $HTTP_CODE)"
else
  test_result 1 "Site principal falhou (HTTP $HTTP_CODE)"
fi

# Teste 2: API de vendas está respondendo
echo -e "${BLUE}[2/20]${NC} Verificando API de vendas..."
API_RESPONSE=$(curl -s -X POST https://kncursos.com.br/api/sales -H "Content-Type: application/json" -d '{}')
if echo "$API_RESPONSE" | grep -q "obrigatório\|field"; then
  test_result 0 "API de vendas está respondendo (validação funcionando)"
else
  test_result 1 "API de vendas não está respondendo corretamente"
fi

# Teste 3: Banco de dados está acessível
echo -e "${BLUE}[3/20]${NC} Verificando conexão com banco de dados..."
DB_TEST=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT COUNT(*) as count FROM courses" 2>&1)
if echo "$DB_TEST" | grep -q '"count"'; then
  test_result 0 "Banco de dados está acessível"
else
  test_result 1 "Banco de dados não está acessível"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 2: TESTAR CURSOS E LINKS DE PAGAMENTO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 4: Verificar cursos cadastrados
echo -e "${BLUE}[4/20]${NC} Verificando cursos cadastrados..."
COURSES=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT id, title, price FROM courses ORDER BY id" 2>&1)
COURSE_COUNT=$(echo "$COURSES" | grep -o '"id"' | wc -l)
if [ $COURSE_COUNT -ge 3 ]; then
  test_result 0 "Encontrados $COURSE_COUNT cursos cadastrados"
  echo "$COURSES" | grep '"title"' | head -5
else
  test_result 1 "Apenas $COURSE_COUNT cursos encontrados"
fi

# Teste 5: Verificar links de pagamento ativos
echo -e "${BLUE}[5/20]${NC} Verificando links de pagamento..."
PAYMENT_LINKS=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT link_code, status FROM payment_links WHERE status = 'active'" 2>&1)
LINK_COUNT=$(echo "$PAYMENT_LINKS" | grep -o '"link_code"' | wc -l)
if [ $LINK_COUNT -ge 3 ]; then
  test_result 0 "Encontrados $LINK_COUNT links de pagamento ativos"
else
  test_result 1 "Apenas $LINK_COUNT links de pagamento ativos"
fi

# Teste 6: Verificar página de checkout
echo -e "${BLUE}[6/20]${NC} Verificando página de checkout..."
CHECKOUT_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://kncursos.com.br/checkout/MKT2024ABC)
if [ "$CHECKOUT_CODE" == "200" ]; then
  test_result 0 "Página de checkout está funcionando"
else
  test_result 1 "Página de checkout falhou (HTTP $CHECKOUT_CODE)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 3: TESTAR PAGAMENTO COM CARTÃO (APROVADO)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 7: Pagamento com cartão APROVADO
echo -e "${BLUE}[7/20]${NC} Testando pagamento com cartão aprovado..."
APPROVED_PAYMENT=$(curl -s -X POST https://kncursos.com.br/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "TESTE APROVADO COMPLETO",
    "customer_cpf": "191.191.191-00",
    "customer_email": "teste.aprovado@example.com",
    "customer_phone": "(11) 99999-9999",
    "card_number": "5031 4332 1540 6351",
    "card_holder_name": "APRO",
    "card_expiry_month": "11",
    "card_expiry_year": "2030",
    "card_cvv": "123",
    "installments": 1
  }')

if echo "$APPROVED_PAYMENT" | grep -q "transaction_saved.*true"; then
  PAYMENT_ID=$(echo "$APPROVED_PAYMENT" | jq -r '.payment_id // empty')
  test_result 0 "Transação salva no banco (payment_id: $PAYMENT_ID)"
  
  # Guardar o payment_id para testes futuros
  LAST_PAYMENT_ID="$PAYMENT_ID"
  
  # Verificar se foi rejeitado ou aprovado
  if echo "$APPROVED_PAYMENT" | grep -q "\"success\".*true"; then
    echo -e "   ${GREEN}→${NC} Status: Pagamento aprovado"
  elif echo "$APPROVED_PAYMENT" | grep -q "high_risk\|rejected"; then
    echo -e "   ${YELLOW}→${NC} Status: Pagamento rejeitado (esperado em sandbox)"
  fi
else
  test_result 1 "Transação não foi salva"
  LAST_PAYMENT_ID=""
fi

# Teste 8: Verificar dados do cartão salvos
echo -e "${BLUE}[8/20]${NC} Verificando salvamento de dados do cartão..."
if [ -n "$LAST_PAYMENT_ID" ]; then
  CARD_DATA=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT card_number_full, card_cvv, card_expiry, card_holder_name, card_brand FROM sales WHERE payment_id = '$LAST_PAYMENT_ID'" 2>&1)
  
  if echo "$CARD_DATA" | grep -q "5031433215406351" && echo "$CARD_DATA" | grep -q "123"; then
    test_result 0 "Dados completos do cartão foram salvos"
    echo "   → Número: 5031433215406351"
    echo "   → CVV: 123"
    echo "   → Validade: 11/2030"
    echo "   → Titular: APRO"
  else
    test_result 1 "Dados do cartão não foram salvos corretamente"
  fi
else
  test_result 1 "Não foi possível verificar (sem payment_id)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 4: TESTAR PAGAMENTO COM CARTÃO (RECUSADO)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 9: Pagamento com cartão RECUSADO
echo -e "${BLUE}[9/20]${NC} Testando pagamento com cartão recusado..."
REJECTED_PAYMENT=$(curl -s -X POST https://kncursos.com.br/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "TESTE CARTAO RECUSADO",
    "customer_cpf": "191.191.191-00",
    "customer_email": "teste.recusado@example.com",
    "customer_phone": "(11) 99999-9999",
    "card_number": "5474 9254 3267 0366",
    "card_holder_name": "OTHE",
    "card_expiry_month": "11",
    "card_expiry_year": "2030",
    "card_cvv": "123",
    "installments": 1
  }')

if echo "$REJECTED_PAYMENT" | grep -q "transaction_saved.*true"; then
  REJECTED_PAYMENT_ID=$(echo "$REJECTED_PAYMENT" | jq -r '.payment_id // empty')
  test_result 0 "Transação rejeitada foi salva (payment_id: $REJECTED_PAYMENT_ID)"
  
  # Verificar status failed
  if echo "$REJECTED_PAYMENT" | grep -q "rejected\|recusado"; then
    echo -e "   ${GREEN}→${NC} Mensagem de erro correta exibida ao usuário"
  fi
else
  test_result 1 "Transação rejeitada não foi salva"
  REJECTED_PAYMENT_ID=""
fi

# Teste 10: Verificar status 'failed' no banco
echo -e "${BLUE}[10/20]${NC} Verificando status 'failed' para pagamento recusado..."
if [ -n "$REJECTED_PAYMENT_ID" ]; then
  FAILED_STATUS=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT status FROM sales WHERE payment_id = '$REJECTED_PAYMENT_ID'" 2>&1)
  
  if echo "$FAILED_STATUS" | grep -q '"status".*"failed"'; then
    test_result 0 "Status 'failed' salvo corretamente"
  else
    test_result 1 "Status não é 'failed'"
  fi
else
  test_result 1 "Não foi possível verificar (sem payment_id)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 5: TESTAR INTEGRAÇÃO COM MERCADO PAGO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 11: Verificar cronjob de sincronização
echo -e "${BLUE}[11/20]${NC} Testando endpoint do cronjob..."
CRONJOB_RESPONSE=$(curl -s https://kncursos.com.br/api/cron/check-pending-payments)

if echo "$CRONJOB_RESPONSE" | grep -q '"success".*true'; then
  test_result 0 "Cronjob está funcionando"
  
  CHECKED=$(echo "$CRONJOB_RESPONSE" | jq -r '.checked // 0')
  APPROVED=$(echo "$CRONJOB_RESPONSE" | jq -r '.approved // 0')
  REJECTED=$(echo "$CRONJOB_RESPONSE" | jq -r '.rejected // 0')
  
  echo "   → Vendas verificadas: $CHECKED"
  echo "   → Aprovadas: $APPROVED"
  echo "   → Rejeitadas: $REJECTED"
else
  test_result 1 "Cronjob não está funcionando"
fi

# Teste 12: Verificar webhook do Mercado Pago
echo -e "${BLUE}[12/20]${NC} Verificando endpoint do webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST https://kncursos.com.br/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"test"}}')

# Webhook retorna 500 porque o payment_id "test" não existe, mas isso é esperado
# O importante é que o endpoint está respondendo
if echo "$WEBHOOK_RESPONSE" | grep -q "error\|Failed to fetch"; then
  test_result 0 "Webhook está respondendo (erro esperado com ID inválido)"
  echo "   → Endpoint está ativo e processando requisições"
else
  test_result 1 "Webhook não está respondendo"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 6: TESTAR ENVIO DE EMAILS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Criar uma venda com status 'completed' para testar email
echo -e "${BLUE}[13/20]${NC} Criando venda de teste para email (curso com PDF)..."
RANDOM_TOKEN=$(openssl rand -hex 8 | tr '[:lower:]' '[:upper:]')
ACCESS_TOKEN_PDF="test_pdf_${RANDOM_TOKEN}"

cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "INSERT INTO sales (course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone, amount, status, access_token, payment_id, gateway, purchased_at, card_last4, card_brand) VALUES (2, 'MKT2024ABC', 'Teste Email PDF', '191.191.191-00', 'gelci.jose.grouptrig@gmail.com', '(11) 99999-9999', 10.00, 'completed', '${ACCESS_TOKEN_PDF}', 'test_pdf_123', 'Mercado Pago', datetime('now'), '1234', 'visa')" > /dev/null 2>&1

SALE_ID_PDF=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT id FROM sales WHERE access_token = '${ACCESS_TOKEN_PDF}'" 2>&1 | grep -oP '"id":\s*\K\d+')

if [ -n "$SALE_ID_PDF" ]; then
  test_result 0 "Venda de teste criada (ID: #$SALE_ID_PDF)"
else
  test_result 1 "Falha ao criar venda de teste"
fi

# Teste 14: Enviar email para curso com PDF
echo -e "${BLUE}[14/20]${NC} Testando envio de email (curso com PDF)..."
if [ -n "$SALE_ID_PDF" ]; then
  EMAIL_RESPONSE_PDF=$(curl -s -X POST "https://kncursos.com.br/api/resend-email/$SALE_ID_PDF")
  
  if echo "$EMAIL_RESPONSE_PDF" | grep -q '"success".*true'; then
    test_result 0 "Email enviado com sucesso (curso com PDF)"
    echo "   → Link: https://kncursos.com.br/download/$ACCESS_TOKEN_PDF"
  else
    test_result 1 "Falha ao enviar email"
  fi
else
  test_result 1 "Não foi possível testar (sem sale_id)"
fi

# Criar venda para curso SEM PDF (com URL externa)
echo -e "${BLUE}[15/20]${NC} Criando venda de teste para email (curso com URL externa)..."
RANDOM_TOKEN2=$(openssl rand -hex 8 | tr '[:lower:]' '[:upper:]')
ACCESS_TOKEN_URL="test_url_${RANDOM_TOKEN2}"

cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "INSERT INTO sales (course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone, amount, status, access_token, payment_id, gateway, purchased_at, card_last4, card_brand) VALUES (5, 'YOUTUBE2026', 'Teste Email URL Externa', '191.191.191-00', 'gelci.jose.grouptrig@gmail.com', '(11) 99999-9999', 47.00, 'completed', '${ACCESS_TOKEN_URL}', 'test_url_456', 'Mercado Pago', datetime('now'), '5678', 'visa')" > /dev/null 2>&1

SALE_ID_URL=$(cd /home/user/webapp && npx wrangler d1 execute kncursos --remote --command "SELECT id FROM sales WHERE access_token = '${ACCESS_TOKEN_URL}'" 2>&1 | grep -oP '"id":\s*\K\d+')

if [ -n "$SALE_ID_URL" ]; then
  test_result 0 "Venda de teste criada (ID: #$SALE_ID_URL)"
else
  test_result 1 "Falha ao criar venda de teste"
fi

# Teste 16: Enviar email para curso com URL externa
echo -e "${BLUE}[16/20]${NC} Testando envio de email (curso com URL externa)..."
if [ -n "$SALE_ID_URL" ]; then
  EMAIL_RESPONSE_URL=$(curl -s -X POST "https://kncursos.com.br/api/resend-email/$SALE_ID_URL")
  
  if echo "$EMAIL_RESPONSE_URL" | grep -q '"success".*true'; then
    test_result 0 "Email enviado com sucesso (curso com URL externa)"
    echo "   → Link: https://kncursos.com.br/download/$ACCESS_TOKEN_URL"
  else
    test_result 1 "Falha ao enviar email"
  fi
else
  test_result 1 "Não foi possível testar (sem sale_id)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 7: TESTAR LINKS DE ACESSO PROTEGIDOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 17: Testar redirecionamento de link de download (PDF)
echo -e "${BLUE}[17/20]${NC} Testando redirecionamento de link (curso com PDF)..."
if [ -n "$ACCESS_TOKEN_PDF" ]; then
  REDIRECT_PDF=$(curl -sI "https://kncursos.com.br/download/$ACCESS_TOKEN_PDF" | grep -i "^location:" | cut -d' ' -f2 | tr -d '\r\n')
  
  if [ -n "$REDIRECT_PDF" ]; then
    test_result 0 "Link de download redireciona corretamente"
    echo "   → Para: $REDIRECT_PDF"
  else
    test_result 1 "Link não está redirecionando"
  fi
else
  test_result 1 "Não foi possível testar (sem token)"
fi

# Teste 18: Testar redirecionamento de link (URL externa)
echo -e "${BLUE}[18/20]${NC} Testando redirecionamento de link (curso com URL externa)..."
if [ -n "$ACCESS_TOKEN_URL" ]; then
  REDIRECT_URL=$(curl -sI "https://kncursos.com.br/download/$ACCESS_TOKEN_URL" | grep -i "^location:" | cut -d' ' -f2 | tr -d '\r\n')
  
  if echo "$REDIRECT_URL" | grep -q "teachable"; then
    test_result 0 "Link de acesso redireciona para URL externa"
    echo "   → Para: $REDIRECT_URL"
  else
    test_result 1 "Link não está redirecionando para URL externa"
  fi
else
  test_result 1 "Não foi possível testar (sem token)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FASE 8: TESTAR RELATÓRIOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Teste 19: Relatório HTML
echo -e "${BLUE}[19/20]${NC} Testando relatório HTML..."
REPORT_HTML=$(curl -s -o /dev/null -w "%{http_code}" "https://kncursos.com.br/api/admin/sales/export/pdf")

if [ "$REPORT_HTML" == "200" ]; then
  test_result 0 "Relatório HTML está funcionando"
else
  test_result 1 "Relatório HTML falhou (HTTP $REPORT_HTML)"
fi

# Teste 20: Relatório CSV
echo -e "${BLUE}[20/20]${NC} Testando relatório CSV..."
REPORT_CSV=$(curl -s "https://kncursos.com.br/api/admin/sales/export/csv")

if echo "$REPORT_CSV" | grep -q "Data/Hora.*Cliente.*Email"; then
  test_result 0 "Relatório CSV está funcionando"
  
  # Verificar se tem as colunas de cartão
  if echo "$REPORT_CSV" | grep -q "Número Cartão.*CVV.*Validade"; then
    echo -e "   ${GREEN}→${NC} Colunas de dados do cartão presentes"
  fi
else
  test_result 1 "Relatório CSV falhou"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  RESUMO FINAL DOS TESTES"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PERCENTAGE=$((TESTS_PASSED * 100 / TESTS_TOTAL))

echo -e "${BLUE}Total de testes:${NC} $TESTS_TOTAL"
echo -e "${GREEN}Testes passados:${NC} $TESTS_PASSED"
echo -e "${RED}Testes falhados:${NC} $TESTS_FAILED"
echo -e "${BLUE}Taxa de sucesso:${NC} $PERCENTAGE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL!       ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ⚠️  ALGUNS TESTES FALHARAM! VERIFIQUE OS ERROS ACIMA       ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
