#!/bin/bash

echo "🔐 Configurando variáveis de ambiente no Cloudflare Pages..."
echo ""

# ASAAS (Pagamentos)
echo "📌 Configurando ASAAS_API_KEY..."
echo '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm' | npx wrangler pages secret put ASAAS_API_KEY --project-name kncursos

echo "📌 Configurando ASAAS_ENV..."
echo 'sandbox' | npx wrangler pages secret put ASAAS_ENV --project-name kncursos

echo "📌 Configurando ASAAS_WEBHOOK_TOKEN..."
echo 'whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM' | npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name kncursos

# RESEND (E-mails)
echo "📌 Configurando RESEND_API_KEY..."
echo 're_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6' | npx wrangler pages secret put RESEND_API_KEY --project-name kncursos

echo "📌 Configurando EMAIL_FROM..."
echo 'cursos@kncursos.com.br' | npx wrangler pages secret put EMAIL_FROM --project-name kncursos

echo "📌 Configurando RESEND_WEBHOOK_SECRET..."
echo 'whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t' | npx wrangler pages secret put RESEND_WEBHOOK_SECRET --project-name kncursos

# ADMIN
echo "📌 Configurando ADMIN_USERNAME..."
echo 'admin' | npx wrangler pages secret put ADMIN_USERNAME --project-name kncursos

echo "📌 Configurando ADMIN_PASSWORD..."
echo 'kncursos2024' | npx wrangler pages secret put ADMIN_PASSWORD --project-name kncursos

echo "📌 Configurando JWT_SECRET..."
echo 'kncursos-jwt-secret-change-in-production-2024' | npx wrangler pages secret put JWT_SECRET --project-name kncursos

echo ""
echo "✅ Todas as variáveis foram configuradas!"
