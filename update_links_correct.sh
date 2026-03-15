#!/bin/bash
echo "🔧 ATUALIZANDO LINK_CODES - TENTATIVA 2"
echo "========================================"
echo ""

declare -A UPDATES=(
    [1]="SAUDE2026"
    [2]="PSICO2026"
    [3]="ETIQ2026"
    [4]="TIKTOK2026A"
    [5]="TIKTOK2026B"
    [6]="BIBLIO2026"
    [7]="MARKET2026"
    [8]="TIC2026"
)

for ID in "${!UPDATES[@]}"; do
    CODE="${UPDATES[$ID]}"
    echo "📝 Curso #$ID -> $CODE"
    
    npx wrangler d1 execute kncursos \
        --remote \
        --command="UPDATE courses SET link_code = '$CODE' WHERE id = $ID" 2>&1 | tail -2
done

echo ""
echo "✅ Verificando resultados..."
npx wrangler d1 execute kncursos \
    --remote \
    --command="SELECT id, SUBSTR(title, 1, 40) as title, link_code FROM courses WHERE id <= 8 ORDER BY id" \
    2>&1 | grep -v "WARNING\|wrangler\|Logs"
