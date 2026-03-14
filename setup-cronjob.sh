#!/bin/bash

# Token da API do Cron-job.org
API_TOKEN="bJm110uSE4p0EJp9dyuLkbZLFM1KjL5+gi86kGf4bZA="

# Configurar cronjob via API
echo "🔧 Configurando cronjob no Cron-job.org..."

curl -X PUT "https://api.cron-job.org/jobs" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "job": {
      "title": "KN Cursos - Check Pending Payments",
      "url": "https://kncursos.com.br/api/cron/check-pending-payments",
      "enabled": true,
      "saveResponses": true,
      "schedule": {
        "timezone": "America/Sao_Paulo",
        "expiresAt": 0,
        "hours": [-1],
        "mdays": [-1],
        "minutes": [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57],
        "months": [-1],
        "wdays": [-1]
      },
      "requestMethod": 1,
      "requestTimeout": 30
    }
  }'

echo ""
echo "✅ Cronjob configurado!"
