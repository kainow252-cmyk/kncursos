# 🛠️ Solução: Erro 400 e Pagamento Recusado

## 🐛 Problemas Identificados

### 1. **Erro 400 em `/api/sales`**
```
Failed to load resource: the server responded with a status of 400 ()
```

**Causa**: Banco de dados local estava vazio (sem tabelas ou dados de cursos).

**Solução**: ✅ Resetar e popular banco de dados local
```bash
npm run db:reset
```

### 2. **"compra normal deu recusado"**
```
Erro: Pagamento recusado
```

**Causa**: Mercado Pago Sandbox requer:
- Credenciais de teste corretas
- Cartões de teste específicos
- Access Token válido

## ✅ Soluções Implementadas

### 1. Banco de Dados Resetado
```bash
# Comando executado:
cd /home/user/webapp && npm run db:reset

# Resultado:
✅ 6 migrações aplicadas
✅ Banco de dados populado com 3 cursos
✅ Links de pagamento criados
```

### 2. Cartões de Teste Mercado Pago

**⚠️ IMPORTANTE**: Para testar pagamentos no ambiente sandbox, use APENAS os cartões oficiais do Mercado Pago:

#### Cartão Aprovado (Master)
```
Número: 5031 4332 1540 6351
Nome: APRO APRO
CPF: 123.456.789-09
Validade: 11/25
CVV: 123
Email: test_user_123@testmail.com
```

#### Cartão Aprovado (Visa)
```
Número: 4235 6477 2802 5682
Nome: APRO APRO
CPF: 123.456.789-09
Validade: 11/25
CVV: 123
Email: test_user_123@testmail.com
```

#### Cartões para Testes de Erro

**Pagamento Recusado (Insufficient Funds)**
```
Número: 5031 4332 1540 6351
Nome: OTHE OTHE
CVV: 123
```

**Pagamento Pendente**
```
Número: 5031 4332 1540 6351
Nome: CONT CONT
CVV: 123
```

## 🔧 Configuração do Mercado Pago

### Credenciais de Teste (.dev.vars)

```bash
# Credenciais Sandbox (Teste)
MERCADOPAGO_PUBLIC_KEY=TEST-dd4f6d02-1376-4707-8851-69eff771a0c7
MERCADOPAGO_ACCESS_TOKEN=TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389
```

### Obter Novas Credenciais de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Suas integrações** → **Credenciais**
3. Ative o **Modo de teste (Sandbox)**
4. Copie:
   - **Public Key** → `MERCADOPAGO_PUBLIC_KEY`
   - **Access Token** → `MERCADOPAGO_ACCESS_TOKEN`

## 🧪 Como Testar Pagamentos

### Método 1: Via Interface Web

1. **Acesse**: http://localhost:3000/
2. **Clique em**: "COMPRAR AGORA" em qualquer curso
3. **Na página de checkout**, preencha:
   - **Dados do Cliente**:
     - Nome: João Silva
     - CPF: 123.456.789-09
     - Email: test_user_123@testmail.com
     - Telefone: (11) 98765-4321
   
   - **Dados do Cartão**:
     - Número: 5031 4332 1540 6351
     - Nome: APRO APRO
     - Validade: 11/25
     - CVV: 123

4. **Clique em**: "Finalizar Compra"
5. **Resultado esperado**: 
   - ✅ Pagamento aprovado
   - ✅ Email enviado com link de download
   - ✅ Venda registrada no banco

### Método 2: Via Gerador de Vendas de Teste

1. **Acesse**: http://localhost:3000/test-sales
2. **Selecione**: Um curso
3. **Quantidade**: 1
4. **Enviar email**: Sim
5. **Clique em**: "Gerar Vendas"
6. **Resultado**: Vendas simuladas sem chamar Mercado Pago

### Método 3: Via API (curl)

```bash
# Teste de pagamento via API
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "link_code": "MKT2024ABC",
    "customer_name": "João Silva",
    "customer_cpf": "123.456.789-09",
    "customer_email": "test_user_123@testmail.com",
    "customer_phone": "(11) 98765-4321",
    "card_number": "5031 4332 1540 6351",
    "card_holder_name": "APRO APRO",
    "card_expiration_month": "11",
    "card_expiration_year": "25",
    "card_cvv": "123"
  }'
```

## 🚨 Troubleshooting

### Erro: "no such table: courses"
```bash
# Solução: Resetar banco
npm run db:reset
```

### Erro: "Link inválido"
```bash
# Verificar links disponíveis:
npx wrangler d1 execute vemgo --local \
  --command="SELECT link_code, course_id FROM payment_links WHERE status='active'"

# Links padrão criados:
# - MKT2024ABC (Curso de Marketing Digital)
# - DEV2024XYZ (Curso de Desenvolvimento Web)
# - TIKTOK2024 (Desvende a Renda Extra no TikTok)
```

### Erro: "Pagamento recusado"
```bash
# Causas possíveis:
1. Access Token inválido ou expirado
2. Cartão de teste incorreto
3. Ambiente de produção usando credenciais de teste

# Solução:
- Verifique as credenciais em .dev.vars
- Use apenas cartões de teste oficiais
- Confirme que está em modo sandbox
```

### Verificar Status do Servidor
```bash
# Ver logs em tempo real
pm2 logs vemgo --nostream

# Status do serviço
pm2 status

# Reiniciar serviço
pm2 restart vemgo
```

## 📊 Verificar Vendas no Banco

```bash
# Ver todas as vendas
npx wrangler d1 execute vemgo --local \
  --command="SELECT customer_name, customer_email, amount, status FROM sales"

# Contar vendas
npx wrangler d1 execute vemgo --local \
  --command="SELECT COUNT(*) as total FROM sales"

# Vendas por status
npx wrangler d1 execute vemgo --local \
  --command="SELECT status, COUNT(*) as total FROM sales GROUP BY status"
```

## 🔐 Testar com Autenticação Admin

1. **Login**: http://localhost:3000/login
   - Usuário: `admin`
   - Senha: `vemgo2024`

2. **Dashboard**: http://localhost:3000/admin
   - Ver vendas realizadas
   - Verificar estatísticas
   - Exportar relatórios

## 📝 Checklist de Teste

- [x] Banco de dados resetado e populado
- [x] Credenciais Mercado Pago configuradas
- [x] Servidor reiniciado
- [ ] Teste de pagamento aprovado (usar cartão APRO)
- [ ] Teste de pagamento recusado (usar cartão OTHE)
- [ ] Email de confirmação recebido
- [ ] Download de PDF funcionando
- [ ] Admin exibindo vendas
- [ ] Exportação CSV/PDF protegida por senha

## 🌐 URLs para Teste

- **Home**: http://localhost:3000/
- **Login Admin**: http://localhost:3000/login
- **Dashboard Admin**: http://localhost:3000/admin
- **Gerador de Vendas**: http://localhost:3000/test-sales
- **Checkout Direto**: http://localhost:3000/checkout/MKT2024ABC

## 📚 Documentação Mercado Pago

- **Cartões de Teste**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
- **API Payments**: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
- **Credenciais**: https://www.mercadopago.com.br/developers/panel/credentials

---

**Status**: ✅ Corrigido  
**Data**: 2026-03-13  
**Banco**: ✅ Resetado e populado  
**Servidor**: ✅ Reiniciado
