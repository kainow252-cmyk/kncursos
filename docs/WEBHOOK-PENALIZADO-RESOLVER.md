# Resolver Webhook Penalizado no Asaas

## ⚠️ Problema Detectado

**Mensagem do Asaas:**
```
Você possui 1 configuração de webhooks penalizada
Verifique as Configurações de Webhooks e quais problemas ocorreram em Logs de Webhooks
Configurações são penalizadas quando ocorrem erros na entrega
```

## 📋 Causa do Problema

O Asaas aplica **penalização automática** quando:
- Múltiplas entregas de webhook falham consecutivamente
- Timeouts frequentes (>30s sem resposta)
- Respostas HTTP diferentes de 200 (ex: 401, 404, 500)
- Endpoint fora do ar ou inacessível

**Histórico do nosso caso:**
- Erro 401 inicial: token desatualizado
- Múltiplos eventos rejeitados (ex: `ACCESS_TOKEN_CREATED`)
- Sistema retornava `{"error":"Unauthorized"}` para eventos não-pagamento

## ✅ Correções Já Implementadas

1. **Token atualizado** ✓
   - Novo token: `whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4`
   - Configurado no Cloudflare Pages
   - Deploy realizado

2. **Webhook aceita TODOS os eventos** ✓
   - Eventos de pagamento (`PAYMENT_*`): processados normalmente
   - Outros eventos (ex: `ACCESS_TOKEN_CREATED`): aceitos mas ignorados
   - Sempre retorna HTTP 200

3. **URL permanente** ✓
   - Antes: URLs temporárias (mudavam a cada deploy)
   - Agora: `https://kncursos.com.br/api/webhooks/asaas`

## 🔧 Passos para Resolver a Penalização

### 1. Acessar o Painel Asaas
- Acesse: https://www.asaas.com
- Login com suas credenciais

### 2. Ver Logs de Webhooks
1. Menu → **Integrações** → **Webhooks**
2. Clique em "**Logs de Webhooks**" (ou "Histórico")
3. Identifique os erros:
   - Status 401 Unauthorized
   - Status 500 Internal Server Error
   - Timeouts
   - Datas e horários dos erros

### 3. Remover a Penalização

**Opção A: Reativar o Webhook Penalizado**
1. Vá em **Integrações** → **Webhooks**
2. Localize "KN Cursos - Notificações"
3. Se houver indicação de "Penalizado" ou "Desativado":
   - Clique em **Editar**
   - Marque como **"Ativo"**
   - Clique em **"Salvar"**
4. Clique em **"Enviar Teste"**
5. Verifique se retornou: `✅ Teste enviado com sucesso`

**Opção B: Criar Novo Webhook (se A não funcionar)**
1. **Desative** o webhook antigo (não delete, apenas desative)
2. Crie um **novo webhook**:
   - **Nome:** `KN Cursos - Notificações v2`
   - **URL:** `https://kncursos.com.br/api/webhooks/asaas`
   - **Token:** `whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4`
   - **Status:** `Ativo`
3. Selecione **TODOS** os eventos (ou pelo menos todos `PAYMENT_*`)
4. Salvar e **Enviar Teste**

### 4. Validar que Está Funcionando

**Teste 1: Painel Asaas**
- Enviar Teste → deve mostrar:
  ```
  ✅ Teste enviado com sucesso
  Status: 200 OK
  ```

**Teste 2: Terminal (opcional)**
```bash
curl -X POST https://kncursos.com.br/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: whsec_VLXmawvFyz91ALugMOWlmwN5GTxTaaoRDC1z2QYGjT4" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "test_payment_123",
      "status": "CONFIRMED"
    }
  }'
```

**Resposta esperada:**
```json
{
  "received": true,
  "event": "PAYMENT_CONFIRMED"
}
```

**Teste 3: Compra Real (com cartão de teste)**
1. Acesse: https://kncursos.com.br
2. Escolha um curso
3. Use o cartão de teste:
   - **Número:** 5162 3062 1937 8829
   - **Titular:** MARCELO H ALMEIDA
   - **Validade:** 05/2025
   - **CVV:** 318
4. Confirme a compra
5. Verifique:
   - Email de confirmação recebido
   - Status "Confirmado" no admin: https://kncursos.com.br/admin
   - Status "Pago" no Asaas

## 📊 Status Esperado Após Correção

| Item | Status Esperado |
|------|-----------------|
| Webhook no Asaas | ✅ Ativo (sem penalização) |
| Logs de Webhooks | ✅ Status 200 OK |
| Teste do Painel | ✅ "Teste enviado com sucesso" |
| Compra com cartão teste | ✅ Pagamento confirmado |
| Email enviado | ✅ Link de download recebido |
| Admin | ✅ Venda registrada com status "completed" |

## 🔍 Monitoramento (Opcional)

Para ver os logs em tempo real:

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
npx wrangler pages deployment tail
```

Procure por linhas como:
```
[WEBHOOK ASAAS] Evento recebido: PAYMENT_CONFIRMED
[WEBHOOK ASAAS] ✅ Status atualizado no banco
```

## ❓ Perguntas Frequentes

**Q: Por que o webhook foi penalizado?**  
A: Porque anteriormente o sistema:
- Rejeitava eventos não-pagamento com 401
- Tinha token desatualizado
- URL mudava a cada deploy

**Q: Está resolvido agora?**  
A: Sim, o código está correto. Basta remover a penalização no painel Asaas.

**Q: E se o teste falhar?**  
A: Verifique:
- Token correto no webhook do Asaas
- URL exata: `https://kncursos.com.br/api/webhooks/asaas`
- Status "Ativo"
- Sem espaços extras no token

**Q: Posso deletar o webhook antigo?**  
A: Não recomendado. Melhor desativar e criar novo.

## 📞 Suporte

**Asaas:**
- Email: suporte@asaas.com
- Telefone: (47) 3433-2909
- Chat: https://www.asaas.com (canto inferior direito)

**KN Cursos:**
- Repositório: https://github.com/kainow252-cmyk/kncursos
- Documentação: `/docs/` no repositório

---

**Data desta documentação:** 14/03/2026 15:00 UTC  
**Última atualização:** Correção implementada, aguardando remoção de penalização
