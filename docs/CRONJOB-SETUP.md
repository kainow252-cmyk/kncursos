# 🔄 Cronjob - Verificação Automática de Pagamentos

## 📋 Visão Geral

Sistema de cronjob que verifica automaticamente o status de pagamentos pendentes no Mercado Pago e:
- ✅ Atualiza o status no banco de dados
- 📧 Envia email de confirmação quando aprovado
- ⚠️ Marca como rejeitado quando o MP rejeita

## 🚀 Como Funciona

### Fluxo Atual

1. **Cliente faz o pagamento** → MP aprova inicialmente
2. **Venda criada com status `pending`** → Não envia email ainda! ✅
3. **Cronjob roda a cada 3 minutos** → Verifica status no MP
4. **Se aprovado** → Atualiza para `completed` + Envia email 📧
5. **Se rejeitado** → Atualiza para `failed` ❌

### Antes vs Depois

**❌ ANTES (PROBLEMA)**
```
Pagamento → MP aprova → Email enviado ✉️
          ↓
       MP rejeita (fraude)
          ↓
   Cliente recebeu email mas não tem acesso! 😱
```

**✅ AGORA (CORRETO)**
```
Pagamento → MP aprova → Status: pending (sem email)
          ↓
    Cronjob verifica
          ↓
    Se MP confirma → Email enviado ✉️
    Se MP rejeita → Sem email, status: failed
```

## 🔧 Configuração

### Endpoint do Cronjob

```
GET https://kncursos.com.br/api/cron/check-pending-payments
```

### Configurar Serviço Externo

Use um serviço gratuito de cronjob como:

#### 1️⃣ **Cron-job.org** (Recomendado)

1. Acesse: https://cron-job.org/
2. Criar conta gratuita
3. Criar novo cronjob:
   - **URL**: `https://kncursos.com.br/api/cron/check-pending-payments`
   - **Schedule**: `*/3 * * * *` (a cada 3 minutos)
   - **Method**: GET
   - **Timeout**: 30 segundos

#### 2️⃣ **EasyCron**

1. Acesse: https://www.easycron.com/
2. Criar conta gratuita
3. Criar cron job:
   - **URL**: `https://kncursos.com.br/api/cron/check-pending-payments`
   - **Cron Expression**: `*/3 * * * *`
   - **HTTP Method**: GET

#### 3️⃣ **UptimeRobot** (alternativa)

1. Acesse: https://uptimerobot.com/
2. Criar conta
3. Adicionar monitor tipo HTTP:
   - **URL**: `https://kncursos.com.br/api/cron/check-pending-payments`
   - **Monitoring Interval**: 5 minutos (plano grátis mínimo)

## 📊 Response do Cronjob

### Sucesso (sem vendas pendentes)
```json
{
  "success": true,
  "message": "Nenhuma venda pendente para verificar",
  "checked": 0,
  "approved": 0,
  "rejected": 0,
  "stillPending": 0
}
```

### Sucesso (com processamento)
```json
{
  "success": true,
  "message": "Verificação concluída",
  "checked": 5,
  "approved": 3,
  "rejected": 1,
  "stillPending": 1,
  "processed": [
    {
      "sale_id": 99,
      "payment_id": "150352657102",
      "old_status": "pending",
      "new_status": "completed",
      "customer": "João Silva"
    }
  ],
  "timestamp": "2026-03-14T18:00:00.000Z"
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem do erro",
  "timestamp": "2026-03-14T18:00:00.000Z"
}
```

## 🔍 O Que o Cronjob Faz

1. **Busca vendas pendentes** dos últimos 30 minutos
2. **Para cada venda**:
   - Consulta status real no Mercado Pago API
   - Compara com status atual no banco
   - Se mudou:
     - Atualiza no banco
     - Se aprovado → Envia email
     - Se rejeitado → Não envia nada

## 🧪 Testar Manualmente

```bash
# Testar o cronjob
curl https://kncursos.com.br/api/cron/check-pending-payments

# Ou acessar direto no navegador
open https://kncursos.com.br/api/cron/check-pending-payments
```

## 📈 Monitoramento

### Logs do Cloudflare

```bash
npx wrangler pages deployment tail --project-name=kncursos
```

Procure por:
- `[CRONJOB] 🔄 Iniciando verificação...`
- `[CRONJOB] 📋 Encontradas X vendas pendentes`
- `[CRONJOB] ✅ Verificação concluída!`
- `[CRONJOB] 📊 Resumo: X aprovados | Y rejeitados | Z pendentes`

## ⚠️ Importante

### Por que 3 minutos?

- ✅ Mercado Pago processa fraudes em segundos/minutos
- ✅ Cliente recebe acesso rápido (máximo 3 minutos de espera)
- ✅ Não sobrecarrega o sistema
- ✅ Cobre janela de 30 minutos (10 execuções)

### Janela de 30 minutos

O cronjob só verifica vendas dos últimos 30 minutos porque:
- Mercado Pago decide fraude rapidamente (< 5 min geralmente)
- Evita reprocessar vendas antigas indefinidamente
- Melhora performance

### Status Possíveis

| Status MP | Status Banco | Ação |
|-----------|--------------|------|
| `approved` | `completed` | ✅ Envia email |
| `authorized` | `completed` | ✅ Envia email |
| `rejected` | `failed` | ❌ Não envia |
| `cancelled` | `failed` | ❌ Não envia |
| `pending` | `pending` | ⏳ Aguarda |
| `in_process` | `pending` | ⏳ Aguarda |
| `refunded` | `refunded` | ℹ️ Marca |
| `charged_back` | `refunded` | ℹ️ Marca |

## 🔐 Segurança

- Endpoint é público (GET), mas não expõe dados sensíveis
- Só retorna estatísticas agregadas
- Para proteger:
  - Adicionar header de autenticação
  - Verificar IP do serviço de cron
  - Rate limiting já ativo no app

## 🎯 Benefícios

✅ **Cliente feliz**: Recebe email só após confirmação real
✅ **Sem emails falsos**: Pagamentos rejeitados não geram email
✅ **Automático**: Roda sozinho, sem intervenção
✅ **Escalável**: Funciona para milhares de vendas
✅ **Confiável**: Verifica status real no Mercado Pago
✅ **Rápido**: Cliente recebe acesso em no máximo 3 minutos

## 🆘 Troubleshooting

### Cronjob não está rodando
- Verifique se o serviço externo está ativo
- Teste manualmente o endpoint
- Veja logs do Cloudflare

### Vendas não estão sendo atualizadas
- Verifique token do Mercado Pago
- Veja logs do cronjob
- Confirme que payment_id existe na venda

### Emails não estão sendo enviados
- Verifique RESEND_API_KEY
- Verifique EMAIL_FROM
- Veja logs de erro do Resend

## 📝 Próximos Passos

1. ✅ Implementado: Endpoint do cronjob
2. ✅ Implementado: Status pending para vendas novas
3. ✅ Implementado: Email removido do ponto de pagamento
4. 🔄 **FAZER AGORA**: Configurar serviço de cron externo
5. 🔄 **FAZER AGORA**: Testar com pagamento real
6. 📊 Monitorar métricas por alguns dias

---

**Data de Criação**: 14/03/2026
**Última Atualização**: 14/03/2026
**Status**: ✅ Implementado - Aguardando configuração externa
