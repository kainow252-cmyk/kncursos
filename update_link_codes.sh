#!/bin/bash
echo "🔧 ATUALIZANDO LINK_CODES DOS CURSOS DIRETAMENTE"
echo "================================================="
echo ""

# Array com os cursos e seus códigos
declare -A LINK_CODES=(
    [1]="SAUDE2026"
    [2]="PSICO2026"
    [3]="ETIQ2026"
    [4]="TIKTOK2026A"
    [5]="TIKTOK2026B"
    [6]="BIBLIO2026"
    [7]="MARKET2026"
    [8]="TIC2026"
)

for COURSE_ID in "${!LINK_CODES[@]}"; do
    LINK_CODE="${LINK_CODES[$COURSE_ID]}"
    
    echo "📝 Curso #$COURSE_ID -> $LINK_CODE"
    
    npx wrangler d1 execute kncursos-db \
        --remote \
        --command="UPDATE courses SET link_code = '$LINK_CODE' WHERE id = $COURSE_ID" 2>&1 | grep -v "WARNING\|Wrangler" | tail -3
    
    echo ""
done

echo "✅ ATUALIZAÇÃO CONCLUÍDA!"
echo ""
echo "🔍 Verificando cursos atualizados..."
npx wrangler d1 execute kncursos-db \
    --remote \
    --command="SELECT id, title, link_code FROM courses ORDER BY id" 2>&1 | grep -v "WARNING\|Wrangler"
