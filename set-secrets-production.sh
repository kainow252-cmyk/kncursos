#!/bin/bash
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
PROJECT="kncursos"

echo "🔐 Configurando Environment Variables no Cloudflare Pages..."
echo ""

# Usar wrangler pages project environment-variable add
echo "ASAAS_API_KEY" && echo '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm' | npx wrangler pages secret put ASAAS_API_KEY --project-name $PROJECT
echo "ASAAS_ENV" && echo 'sandbox' | npx wrangler pages secret put ASAAS_ENV --project-name $PROJECT
echo "ASAAS_WEBHOOK_TOKEN" && echo 'whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM' | npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name $PROJECT
echo "RESEND_API_KEY" && echo 're_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6' | npx wrangler pages secret put RESEND_API_KEY --project-name $PROJECT
echo "EMAIL_FROM" && echo 'cursos@kncursos.com.br' | npx wrangler pages secret put EMAIL_FROM --project-name $PROJECT
echo "JWT_SECRET" && echo 'kncursos-jwt-secret-production-2024' | npx wrangler pages secret put JWT_SECRET --project-name $PROJECT

echo ""
echo "✅ Secrets configurados!"
