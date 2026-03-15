#!/bin/bash
echo "🧪 TESTE: EDITAR CATEGORIA DE UM CURSO"
echo "========================================"
echo ""

echo "1️⃣ Verificando curso #5 antes da edição..."
curl -s https://kncursos.com.br/api/courses | jq '.[] | select(.id == 5) | {id, title, category}'
echo ""

echo "2️⃣ Editando categoria do curso #5 para 'Redes Sociais'..."
curl -s -X PUT https://kncursos.com.br/api/courses/5 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Redes Sociais"
  }' | jq '.'
echo ""

echo "3️⃣ Verificando curso #5 após edição..."
curl -s https://kncursos.com.br/api/courses | jq '.[] | select(.id == 5) | {id, title, category}'
echo ""

echo "4️⃣ Verificando se o SELECT no painel admin foi atualizado..."
echo "Acesse: https://kncursos.com.br/cursos"
echo "Clique em 'Editar' no curso 'Renda Extra no TikTok'"
echo "Verifique se a categoria 'Redes Sociais' está selecionada no dropdown"
echo ""

echo "✅ TESTE CONCLUÍDO!"
echo "📋 Resumo: Campo categoria convertido de INPUT para SELECT com 11 opções predefinidas"
