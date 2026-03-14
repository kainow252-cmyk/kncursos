#!/bin/bash

# Script de deploy rápido para KN Cursos
# Uso: ./deploy.sh [mensagem_do_commit]

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🚀 DEPLOY KN CURSOS - CLOUDFLARE PAGES              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Carregar token do Cloudflare
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    if [ -f .cloudflare-token ]; then
        export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
        echo "✅ Token carregado de .cloudflare-token"
    else
        echo "❌ ERRO: CLOUDFLARE_API_TOKEN não encontrado!"
        echo "   Configure: export CLOUDFLARE_API_TOKEN=seu_token"
        exit 1
    fi
fi

# Mensagem do commit
COMMIT_MSG="${1:-Update: deploy automático $(date '+%Y-%m-%d %H:%M:%S')}"

echo ""
echo "📝 Passo 1/5: Verificando mudanças..."
if git diff --quiet && git diff --cached --quiet; then
    echo "   ⚠️  Nenhuma mudança detectada"
else
    echo "   ✅ Mudanças detectadas"
fi

echo ""
echo "📦 Passo 2/5: Limpando e buildando..."
rm -rf dist
npm run build
echo "   ✅ Build concluído"

echo ""
echo "📤 Passo 3/5: Commit no GitHub..."
git add -A
if git diff --cached --quiet; then
    echo "   ℹ️  Nada para commitar"
else
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "   ✅ Código enviado para GitHub"
fi

echo ""
echo "🌐 Passo 4/5: Deploy no Cloudflare Pages..."
DEPLOY_OUTPUT=$(npx wrangler pages deploy dist --project-name=kncursos 2>&1)
echo "$DEPLOY_OUTPUT"

# Extrair URL do deploy
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[a-z0-9]+\.kncursos\.pages\.dev' | head -1)

echo ""
echo "🧪 Passo 5/5: Testando deploy..."
if [ -n "$DEPLOY_URL" ]; then
    echo "   URL: $DEPLOY_URL"
    sleep 3
    
    TEST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$DEPLOY_URL/api/sales" \
      -H "Content-Type: application/json" \
      -d '{"link_code":"TEST"}')
    
    HTTP_STATUS=$(echo "$TEST_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
    
    if [ "$HTTP_STATUS" = "400" ]; then
        echo "   ✅ API respondendo corretamente (status 400)"
    else
        echo "   ⚠️  Status inesperado: $HTTP_STATUS"
    fi
else
    echo "   ⚠️  URL não encontrada no output"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOY COMPLETO! ✅                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 URLs:"
echo "   • Deploy: ${DEPLOY_URL:-'(ver output acima)'}"
echo "   • Produção: https://kncursos.com.br"
echo "   • Admin: https://kncursos.com.br/admin"
echo "   • Repo: https://github.com/kainow252-cmyk/kncursos"
echo ""
echo "📝 Commit: $COMMIT_MSG"
echo ""
