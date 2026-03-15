#!/bin/bash
echo "🔗 CRIANDO PAYMENT LINKS PARA CURSOS 6, 7 E 8"
echo "=============================================="
echo ""

# Criar links para cursos sem payment link
declare -A NEW_LINKS=(
    [6]="BIBLIO2026"
    [7]="MARKET2026"
    [8]="TIC2026"
)

for COURSE_ID in "${!NEW_LINKS[@]}"; do
    LINK_CODE="${NEW_LINKS[$COURSE_ID]}"
    
    echo "📝 Criando link para Curso #$COURSE_ID: $LINK_CODE"
    
    npx wrangler d1 execute kncursos \
        --remote \
        --command="INSERT INTO payment_links (course_id, link_code, status, created_at) VALUES ($COURSE_ID, '$LINK_CODE', 'active', datetime('now'))" \
        2>&1 | tail -3
    
    echo ""
done

echo "✅ VERIFICANDO TODOS OS PAYMENT LINKS..."
npx wrangler d1 execute kncursos \
    --remote \
    --command="SELECT pl.id, pl.course_id, SUBSTR(c.title, 1, 30) as title, pl.link_code, pl.status FROM payment_links pl JOIN courses c ON pl.course_id = c.id ORDER BY pl.course_id" \
    2>&1 | grep -A 100 "results"
