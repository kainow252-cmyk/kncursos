#!/bin/bash
# Script para atualizar Resend API Key

echo "🔄 Atualizando configuração do Resend..."

# Solicitar nova API Key
echo ""
echo "📋 Cole sua nova RESEND_API_KEY:"
read -r NEW_API_KEY

# Solicitar email FROM
echo ""
echo "📧 Digite o EMAIL_FROM (ex: cursos@kncursos.com.br ou onboarding@resend.dev):"
read -r NEW_EMAIL_FROM

# Atualizar .dev.vars
echo ""
echo "💾 Atualizando .dev.vars..."

cat > .dev.vars << EOF
# Mercado Pago - Credenciais de Teste
MERCADOPAGO_PUBLIC_KEY=TEST-dd4f6d02-1376-4707-8851-69eff771a0c7
MERCADOPAGO_ACCESS_TOKEN=TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389

# Resend - API Key para envio de emails
RESEND_API_KEY=${NEW_API_KEY}

# Email do remetente (deve ser verificado no Resend)
EMAIL_FROM=${NEW_EMAIL_FROM}

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kncursos2024

# JWT Secret
JWT_SECRET=kncursos-jwt-secret-change-in-production-2024
EOF

echo "✅ .dev.vars atualizado!"

# Reiniciar servidor
echo ""
echo "🔄 Reiniciando servidor..."
pm2 restart kncursos

echo ""
echo "✅ Configuração atualizada com sucesso!"
echo ""
echo "📧 Para testar, execute:"
echo "curl -X POST http://localhost:3000/api/sales \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"link_code\":\"MKT2024-001\",\"customer_name\":\"Teste\",\"customer_email\":\"seu@email.com\",...}'"
