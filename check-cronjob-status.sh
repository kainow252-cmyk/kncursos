#!/bin/bash

API_TOKEN="bJm110uSE4p0EJp9dyuLkbZLFM1KjL5+gi86kGf4bZA="
JOB_ID="7375289"

echo "📊 Verificando status do cronjob..."
echo ""

# Buscar detalhes do job
curl -s "https://api.cron-job.org/jobs/${JOB_ID}" \
  -H "Authorization: Bearer ${API_TOKEN}" | jq .

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
