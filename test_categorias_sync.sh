#!/bin/bash
echo "🧪 TESTE: CATEGORIAS SINCRONIZADAS HOME E ADMIN"
echo "=================================================="
echo ""

echo "1️⃣ Verificando categorias na HOME (filtros)..."
grep -A 40 "Filtrar por Categoria" dist/_worker.js | grep -E "filterCategory\('[^']+'\)" | sed "s/.*filterCategory('\([^']*\)').*/\1/" | sort | uniq
echo ""

echo "2️⃣ Verificando categorias no ADMIN (select)..."
grep -A 15 'id="course-category"' dist/_worker.js | grep -E '<option value="[^"]+">' | sed 's/.*value="\([^"]*\)".*/\1/' | sort | uniq
echo ""

echo "3️⃣ Comparando listas..."
HOME_CATS=$(grep -A 40 "Filtrar por Categoria" dist/_worker.js | grep -E "filterCategory\('[^']+'\)" | sed "s/.*filterCategory('\([^']*\)').*/\1/" | grep -v "^all$" | sort | uniq)
ADMIN_CATS=$(grep -A 15 'id="course-category"' dist/_worker.js | grep -E '<option value="[^"]+">' | sed 's/.*value="\([^"]*\)".*/\1/' | sort | uniq)

echo "📊 HOME tem $(echo "$HOME_CATS" | wc -l) categorias"
echo "📊 ADMIN tem $(echo "$ADMIN_CATS" | wc -l) categorias"
echo ""

if [ "$HOME_CATS" = "$ADMIN_CATS" ]; then
    echo "✅ SUCESSO: Categorias SINCRONIZADAS!"
else
    echo "❌ ERRO: Categorias DIFERENTES!"
    echo ""
    echo "🔍 Diferenças encontradas:"
    diff <(echo "$HOME_CATS") <(echo "$ADMIN_CATS")
fi

echo ""
echo "4️⃣ Listando categorias padronizadas (11 total):"
echo "$ADMIN_CATS" | nl
echo ""

echo "✅ TESTE CONCLUÍDO!"
