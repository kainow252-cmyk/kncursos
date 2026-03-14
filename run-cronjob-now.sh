#!/bin/bash

API_TOKEN="bJm110uSE4p0EJp9dyuLkbZLFM1KjL5+gi86kGf4bZA="
JOB_ID="7375289"

echo "🚀 Executando cronjob manualmente..."
echo ""

# Executar job agora
RESPONSE=$(curl -s -X PATCH "https://api.cron-job.org/jobs/${JOB_ID}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"job": {"enabled": true}}')

echo "Response: $RESPONSE"
echo ""

# Aguardar 2 segundos
sleep 2

# Buscar histórico de execuções
echo "📊 Histórico de execuções:"
curl -s "https://api.cron-job.org/jobs/${JOB_ID}/history" \
  -H "Authorization: Bearer ${API_TOKEN}" | jq '.history[0:3]'

