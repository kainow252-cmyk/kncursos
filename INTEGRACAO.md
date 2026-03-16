# 💳 Integração Mercado Pago + Resend

## ✅ O que foi implementado

### 1. **Processamento de Pagamento Real (Mercado Pago)**
- ✅ Tokenização de cartão de crédito
- ✅ Criação de cobrança via API REST
- ✅ Validação e aprovação em tempo real
- ✅ Suporte a cartões Visa e Mastercard
- ✅ Detecção automática de bandeira
- ✅ Validação de CPF do titular

### 2. **Envio Automático de Email (Resend)**
- ✅ Template HTML profissional
- ✅ Link direto para download do PDF
- ✅ Confirmação de compra com detalhes
- ✅ Email enviado automaticamente após aprovação
- ✅ Design responsivo e moderno

### 3. **Fluxo Completo**
```
Cliente → Preenche dados do cartão
      ↓
   Valida e processa no Mercado Pago
      ↓
   Pagamento APROVADO?
      ↓ SIM
   Registra venda no banco
      ↓
   Gera token único de acesso
      ↓
   Envia email com link do PDF
      ↓
   Redireciona para página de sucesso
      ↓
   Cliente baixa o PDF
```

---

## 🔑 Credenciais Configuradas

### Mercado Pago (Teste)
```env
MERCADOPAGO_PUBLIC_KEY=TEST-dd4f6d02-1376-4707-8851-69eff771a0c7
MERCADOPAGO_ACCESS_TOKEN=TEST-1480231898921036-030517-00b818c5847b8e226a7c88c051863146-2911366389
```

### Resend
```env
RESEND_API_KEY=re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
EMAIL_FROM=onboarding@resend.dev
```

⚠️ **Importante**: Para produção, substitua as credenciais de TESTE por credenciais REAIS no Cloudflare.

---

## 🧪 Como Testar

### 1. **Cartões de Teste do Mercado Pago**

**Mastercard APROVADO:**
```
Número: 5031 4332 1540 6351
Nome: APRO (qualquer nome)
CPF: 12345678909
Validade: 11/25 (qualquer data futura)
CVV: 123 (qualquer)
```

**Visa APROVADO:**
```
Número: 4509 9535 6623 3704
Nome: APRO
CPF: 12345678909
Validade: 11/25
CVV: 123
```

**Cartão RECUSADO (para testar erro):**
```
Número: 5031 7557 3453 0604
Nome: OTHE
```

### 2. **Fluxo de Teste**

1. Acesse: https://SEU-DOMINIO/checkout/TIKTOK2024
2. Preencha os dados:
   - Nome: Seu Nome
   - CPF: 123.456.789-09
   - Email: seu@email.com
   - Telefone: (11) 98765-4321
3. Dados do cartão:
   - Use um dos cartões de teste acima
4. Clique em "FINALIZAR COMPRA SEGURA"
5. Aguarde o processamento (2-5 segundos)
6. Você será redirecionado para página de sucesso
7. Verifique seu email - chegará uma mensagem com o link do PDF

---

## 📧 Template do Email

O email enviado inclui:
- ✅ Saudação personalizada com nome do cliente
- ✅ Confirmação de compra aprovada
- ✅ Título e descrição do curso
- ✅ Valor pago
- ✅ Botão para download do PDF
- ✅ Link alternativo (caso o botão não funcione)
- ✅ Design profissional com gradiente
- ✅ Totalmente responsivo

---

## 🚀 Deploy para Produção

### 1. **Obter Credenciais de Produção**

**Mercado Pago:**
1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em "Suas integrações"
3. Copie as credenciais de PRODUÇÃO:
   - Public Key (começa com `APP_USR-`)
   - Access Token (começa com `APP_USR-`)

**Resend:**
- A mesma API Key funciona para produção
- Mas você precisa verificar seu domínio para enviar de emails personalizados

### 2. **Configurar no Cloudflare**

```bash
# Mercado Pago
wrangler pages secret put MERCADOPAGO_PUBLIC_KEY --project-name vemgo
wrangler pages secret put MERCADOPAGO_ACCESS_TOKEN --project-name vemgo

# Resend
wrangler pages secret put RESEND_API_KEY --project-name vemgo
wrangler pages secret put EMAIL_FROM --project-name vemgo
```

### 3. **Verificar Domínio no Resend (Opcional)**

Para enviar de `contato@vemgo.com.br`:
1. Acesse: https://resend.com/domains
2. Adicione seu domínio
3. Configure os registros DNS (MX, TXT, CNAME)
4. Aguarde verificação
5. Atualize `EMAIL_FROM=contato@vemgo.com.br`

---

## 🔒 Segurança

### ✅ Implementações de Segurança

1. **Credenciais nunca no frontend**
   - Todas as chamadas à API são server-side
   - Tokens não ficam expostos no JavaScript

2. **Validações**
   - CPF validado no backend
   - Cartão validado pelo Mercado Pago
   - Email validado antes do envio

3. **Token único por venda**
   - Cada venda gera um token único
   - Token permite download ilimitado
   - Impossível adivinhar tokens alheios

4. **HTTPS obrigatório**
   - Cloudflare fornece SSL gratuito
   - Todos os dados trafegam criptografados

---

## 📊 Monitoramento

### Ver logs do PM2 (desenvolvimento)
```bash
pm2 logs vemgo --nostream
```

### Ver vendas no banco
```bash
npm run db:console:local
SELECT * FROM sales ORDER BY purchased_at DESC LIMIT 10;
```

### Testar API diretamente
```bash
curl http://localhost:3000/api/courses
curl http://localhost:3000/api/sales
```

---

## ⚠️ Troubleshooting

### Pagamento recusado
- Verifique se está usando cartões de TESTE
- Confirme que o Access Token está correto
- Veja os logs: `pm2 logs vemgo`

### Email não chega
- Verifique se o RESEND_API_KEY está correto
- Confira a caixa de SPAM
- Para produção, verifique o domínio no Resend

### Erro 500 no checkout
- Verifique se o `.dev.vars` existe
- Confirme que as variáveis estão carregadas
- Reinicie: `pm2 restart vemgo`

---

## 📝 Próximos Passos Sugeridos

1. ✅ **Testar pagamento real** com cartões de teste
2. ⏳ **Obter credenciais de produção** do Mercado Pago
3. ⏳ **Verificar domínio no Resend** para emails personalizados
4. ⏳ **Adicionar webhook** do Mercado Pago para confirmar pagamentos assíncronos
5. ⏳ **Implementar retry de email** caso falhe o envio
6. ⏳ **Adicionar dashboard de vendas** com gráficos
7. ⏳ **Criar sistema de cupons** de desconto

---

## 🎉 Status

✅ **100% Funcional em modo de teste!**

- Pagamento via Mercado Pago: ✅
- Envio de email via Resend: ✅
- Download de PDF: ✅
- Cards com mesma altura: ✅
- Botão voltar no checkout: ✅
- Máscaras de formatação: ✅

**Pronto para deploy!** 🚀
