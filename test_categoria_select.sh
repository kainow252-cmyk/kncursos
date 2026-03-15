#!/bin/bash
echo "🧪 TESTE: CAMPO CATEGORIA COMO SELECT"
echo "========================================"
echo ""

echo "1️⃣ Verificando estrutura do HTML..."
grep -A 15 'id="course-category"' dist/_worker.js | grep -E "(select|option)" | head -15
echo ""

echo "2️⃣ Verificando categorias disponíveis..."
grep -E 'option value="[^"]*">' dist/_worker.js | grep "course-category" -A 15 | head -15
echo ""

echo "3️⃣ Testando criação de curso..."
curl -s -X POST https://kncursos.com.br/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste Categoria Select",
    "description": "Testando categoria Marketing Digital",
    "price": 99.90,
    "category": "Marketing Digital",
    "featured": false
  }' | jq '.'
echo ""

echo "4️⃣ Listando últimos cursos para verificar categoria..."
curl -s https://kncursos.com.br/api/courses | jq '.courses | .[] | {id, title, category}' | tail -20
echo ""

echo "✅ TESTE CONCLUÍDO!"
