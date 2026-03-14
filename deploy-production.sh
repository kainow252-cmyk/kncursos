#!/bin/bash

# ========================================
# Script de Deploy Automático - KN Cursos
# ========================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploy Automático - KN Cursos${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Export Cloudflare API Token
export CLOUDFLARE_API_TOKEN="3XVV83kDwH6VAfHfn3iBG07He24veho5ENuzj2ld"

# Project name
PROJECT_NAME="kncursos"

echo -e "${YELLOW}[1/4] Configurando Environment Variables...${NC}"

# Configure secrets via Wrangler
echo -e "  ${GREEN}→${NC} ASAAS_API_KEY"
echo '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm' | npx wrangler pages secret put ASAAS_API_KEY --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} ASAAS_ENV"
echo 'sandbox' | npx wrangler pages secret put ASAAS_ENV --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} ASAAS_WEBHOOK_TOKEN"
echo 'whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM' | npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} RESEND_API_KEY"
echo 're_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6' | npx wrangler pages secret put RESEND_API_KEY --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} EMAIL_FROM"
echo 'cursos@kncursos.com.br' | npx wrangler pages secret put EMAIL_FROM --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} RESEND_WEBHOOK_SECRET"
echo 'whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t' | npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} ADMIN_USERNAME"
echo 'admin' | npx wrangler pages secret put ADMIN_USERNAME --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} ADMIN_PASSWORD"
echo 'kncursos2024' | npx wrangler pages secret put ADMIN_PASSWORD --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo -e "  ${GREEN}→${NC} JWT_SECRET"
echo 'kncursos-jwt-secret-change-in-production-2024' | npx wrangler pages secret put JWT_SECRET --project-name=$PROJECT_NAME 2>/dev/null || echo "  (já existe)"

echo ""
echo -e "${GREEN}✅ Secrets configurados!${NC}"
echo ""

echo -e "${YELLOW}[2/4] Building projeto...${NC}"
npm run build
echo -e "${GREEN}✅ Build completo!${NC}"
echo ""

echo -e "${YELLOW}[3/4] Fazendo deploy para Cloudflare Pages...${NC}"
npx wrangler pages deploy dist --project-name=$PROJECT_NAME --commit-dirty=true
echo -e "${GREEN}✅ Deploy realizado!${NC}"
echo ""

echo -e "${YELLOW}[4/4] Verificando deployment...${NC}"
sleep 3
npx wrangler pages deployment list --project-name=$PROJECT_NAME | head -20
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Deploy Concluído com Sucesso!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}URLs de Acesso:${NC}"
echo -e "  • Principal: ${BLUE}https://kncursos.pages.dev/${NC}"
echo -e "  • Domínio: ${BLUE}https://kncursos.com.br/${NC}"
echo -e "  • Admin: ${BLUE}https://kncursos.com.br/admin${NC}"
echo ""
echo -e "${GREEN}Credenciais Admin:${NC}"
echo -e "  • Usuário: ${BLUE}admin${NC}"
echo -e "  • Senha: ${BLUE}kncursos2024${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos Passos:${NC}"
echo -e "  1. Acessar https://kncursos.com.br/"
echo -e "  2. Fazer login no /admin"
echo -e "  3. Testar criação de curso"
echo -e "  4. Testar checkout e pagamento"
echo ""
