#!/bin/bash
echo "🔧 CORRIGINDO LINKS DE PAGAMENTO DOS CURSOS"
echo "=============================================="
echo ""

# Função para gerar código único
generate_code() {
    echo "CURSO$(date +%s)$(shuf -i 100-999 -n 1)"
}

echo "📋 Cursos sem link de pagamento:"
curl -s "https://kncursos.com.br/api/courses" | jq -r '.[] | select(.link_code == null or .link_code == "") | "\(.id) - \(.title)"'
echo ""

echo "🔧 Criando links de pagamento automaticamente..."
echo ""

# Cursos a corrigir
declare -a COURSES=(
    "1|EMAGRECER COM SAÚDE|SAUDE2026"
    "2|Psicologia Sombria|PSICO2026"
    "3|Etiqueta Social|ETIQ2026"
    "4|MONETIZE TIKTOK|TIKTOK2026A"
    "5|Renda Extra TikTok|TIKTOK2026B"
    "6|Biblioteca Compacta|BIBLIO2026"
    "7|Marketing Digital|MARKET2026"
    "8|TIC - Tecnologias|TIC2026"
)

for course_data in "${COURSES[@]}"; do
    IFS='|' read -r ID TITLE CODE <<< "$course_data"
    
    echo "📝 Curso #$ID: $TITLE"
    echo "   Link code: $CODE"
    
    # Criar link de pagamento via API
    RESPONSE=$(curl -s -X POST "https://kncursos.com.br/api/payment-links" \
        -H "Content-Type: application/json" \
        -d "{
            \"course_id\": $ID,
            \"link_code\": \"$CODE\"
        }")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo "   ✅ Link criado: https://kncursos.com.br/checkout/$CODE"
    else
        echo "   ❌ Erro: $(echo "$RESPONSE" | jq -r '.error // "Desconhecido"')"
    fi
    echo ""
done

echo "✅ PROCESSO CONCLUÍDO!"
echo ""
echo "🔗 Verificando cursos atualizados..."
curl -s "https://kncursos.com.br/api/courses" | jq -r '.[] | "\(.id) - \(.title): \(if .link_code then "✅ " + .link_code else "❌ SEM LINK" end)"'
