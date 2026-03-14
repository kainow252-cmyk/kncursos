#!/bin/bash

# Script para configurar secrets no Cloudflare Pages
PROJECT_NAME="kncursos"

echo "🔐 Configurando secrets no Cloudflare Pages..."
echo ""

# Asaas
echo "📦 Configurando Asaas..."
echo '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm' | npx wrangler pages secret put ASAAS_API_KEY --project-name $PROJECT_NAME
echo 'sandbox' | npx wrangler pages secret put ASAAS_ENV --project-name $PROJECT_NAME
echo 'whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM' | npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name $PROJECT_NAME

# Resend
echo "📧 Configurando Resend..."
echo 're_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6' | npx wrangler pages secret put RESEND_API_KEY --project-name $PROJECT_NAME
echo 'cursos@kncursos.com.br' | npx wrangler pages secret put EMAIL_FROM --project-name $PROJECT_NAME
echo 'whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t' | npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name $PROJECT_NAME

# Admin
echo "👤 Configurando Admin..."
echo 'admin' | npx wrangler pages secret put ADMIN_USERNAME --project-name $PROJECT_NAME
echo 'kncursos2024' | npx wrangler pages secret put ADMIN_PASSWORD --project-name $PROJECT_NAME
echo 'kncursos-jwt-secret-change-in-production-2024' | npx wrangler pages secret put JWT_SECRET --project-name $PROJECT_NAME

echo ""
echo "✅ Todos os secrets foram configurados!"
