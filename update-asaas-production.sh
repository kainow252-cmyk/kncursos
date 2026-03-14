#!/bin/bash
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
PROJECT="kncursos"

echo "🔐 Atualizando Asaas para PRODUÇÃO..."
echo ""

# Atualizar chave de API para PRODUÇÃO
echo "📦 ASAAS_API_KEY (PRODUÇÃO)"
echo '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAxNDAxNmE1LTY3MDctNDMzYy1iYTliLWVhODIxNWE5ZTM3ZDo6JGFhY2hfY2MyMWJjN2QtYTU3ZS00NmU3LWFjNmUtOTQzMTgzYTU2YjY5' | npx wrangler pages secret put ASAAS_API_KEY --project-name $PROJECT

# Mudar ambiente para PRODUCTION
echo "🌍 ASAAS_ENV (production)"
echo 'production' | npx wrangler pages secret put ASAAS_ENV --project-name $PROJECT

echo ""
echo "✅ Asaas configurado para PRODUÇÃO!"
echo "⚠️  IMPORTANTE: Agora o sistema processa pagamentos REAIS!"
echo ""
