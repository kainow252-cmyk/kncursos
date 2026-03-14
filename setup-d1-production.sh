#!/bin/bash
# Script para configurar D1 em produção

echo "🔧 Configuração D1 em Produção - kncursos"
echo "=========================================="
echo ""

# Verificar se database existe
echo "1️⃣ Verificando se database existe..."
npx wrangler d1 list | grep -q "kncursos"

if [ $? -eq 0 ]; then
    echo "✅ Database 'kncursos' já existe!"
else
    echo "⚠️ Database não encontrado. Criando..."
    npx wrangler d1 create kncursos
    echo ""
    echo "⚠️ IMPORTANTE: Copie o database_id e atualize em wrangler.jsonc!"
    echo "Pressione ENTER para continuar..."
    read
fi

echo ""
echo "2️⃣ Aplicando migrations em produção..."
npx wrangler d1 migrations apply kncursos --remote

echo ""
echo "3️⃣ Verificando estrutura do banco..."
npx wrangler d1 execute kncursos --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

echo ""
echo "4️⃣ Contando cursos existentes..."
COURSES_COUNT=$(npx wrangler d1 execute kncursos --remote --command="SELECT COUNT(*) as count FROM courses" 2>/dev/null | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ -z "$COURSES_COUNT" ] || [ "$COURSES_COUNT" -eq 0 ]; then
    echo "⚠️ Banco vazio! Populando dados..."
    
    echo ""
    echo "5️⃣ Adicionando cursos..."
    npx wrangler d1 execute kncursos --remote --file=./seed-add-courses.sql
    
    echo ""
    echo "6️⃣ Adicionando payment links..."
    npx wrangler d1 execute kncursos --remote --file=./fix-payment-links.sql
    
    echo ""
    echo "7️⃣ Adicionando PDFs aos cursos..."
    npx wrangler d1 execute kncursos --remote --file=./add-pdfs.sql
else
    echo "✅ Banco já tem $COURSES_COUNT cursos!"
fi

echo ""
echo "8️⃣ Verificação final..."
echo ""
echo "📊 Estatísticas:"
npx wrangler d1 execute kncursos --remote --command="
SELECT 
  (SELECT COUNT(*) FROM courses) as courses,
  (SELECT COUNT(*) FROM payment_links) as payment_links,
  (SELECT COUNT(*) FROM sales) as sales
" | grep -A 10 "results"

echo ""
echo "✅ Database configurado com sucesso!"
echo ""
echo "🚀 Próximos passos:"
echo "1. Acesse: https://dash.cloudflare.com/"
echo "2. Workers & Pages → kncursos → Settings"
echo "3. Bindings → Add → D1 database"
echo "4. Variable name: DB"
echo "5. D1 database: kncursos"
echo "6. Save"
echo ""
echo "📝 Teste após configurar:"
echo "curl https://kncursos.pages.dev/api/courses | jq 'length'"
