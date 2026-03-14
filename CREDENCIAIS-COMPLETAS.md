# 🔐 Credenciais Completas do Sistema KN Cursos

## 📋 Índice
1. [Asaas (Gateway de Pagamento)](#asaas)
2. [Resend (Envio de Emails)](#resend)
3. [Admin (Painel Administrativo)](#admin)
4. [Banco de Dados](#banco-de-dados)
5. [Cartões de Teste](#cartões-de-teste)

---

## 🏦 ASAAS (Gateway de Pagamento)

### 🧪 Ambiente SANDBOX (Teste)

**API Key:**
```
$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm
```

**Webhook Token:**
```
whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
```

**Ambiente:**
```
ASAAS_ENV=sandbox
```

### 🔗 URLs Úteis:
- Dashboard Sandbox: https://sandbox.asaas.com/
- Dashboard Produção: https://www.asaas.com/
- Documentação: https://docs.asaas.com/

### 💳 Taxas:
- Cartão de Crédito: **3.49%**
- PIX: **0.99%**
- Boleto: **R$ 3,49**

---

## 📧 RESEND (Envio de Emails)

**API Key:**
```
re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
```

**Webhook Secret:**
```
whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t
```

**Email From (Remetente):**
```
cursos@kncursos.com.br
```

### 🔗 URLs Úteis:
- Dashboard: https://resend.com/
- Documentação: https://resend.com/docs

---

## 👨‍💼 ADMIN (Painel Administrativo)

### **Administrador Principal**
- **Usuário:** `admin`
- **Senha:** `kncursos2024`
- **Permissões:** Total (criar cursos, gerar links, ver vendas)

### **Funcionário (Exemplo)**
- **Usuário:** `funcionario`
- **Senha:** `funcionario123`
- **Permissões:** Limitadas (visualizar apenas)

### **JWT Secret:**
```
kncursos-jwt-secret-change-in-production-2024
```

⚠️ **IMPORTANTE:** Alterar o JWT_SECRET em produção!

---

## 🗄️ BANCO DE DADOS (Cloudflare D1)

### **Database Info:**
- **Nome:** `kncursos`
- **ID:** `6783bc59-1fd5-48b4-894b-98c77e6ca75a`
- **Tipo:** SQLite (D1)
- **Binding:** `DB`

### **Tabelas:**
- `courses` - Cursos disponíveis
- `payment_links` - Links de pagamento gerados
- `sales` - Vendas realizadas
- `users` - Usuários do sistema (admin/funcionário)
- `saved_cards` - Cartões salvos dos clientes

### **R2 Bucket:**
- **Nome:** `kncursos-files`
- **Binding:** `R2`

---

## 💳 CARTÕES DE TESTE (SANDBOX ASAAS)

### ✅ Cartão APROVADO (Principal)
```
Número: 5162 3062 1937 8829
Titular: Marcelo Henrique Almeida
Validade: 05/2025 (ou qualquer data futura)
CVV: 318
```

### Outros Cartões de Teste:

| Status | Número | Resultado |
|--------|--------|-----------|
| ✅ Aprovado | 5162 3062 1937 8829 | Pagamento confirmado |
| ❌ Recusado | 5111 1111 1111 1111 | Transação negada |
| ⏳ Timeout | 5555 5555 5555 5555 | Timeout na transação |
| 🚫 Fraude | 4111 1111 1111 1111 | Bloqueado por fraude |

### Dados do Cliente de Teste:
```
Nome: Teste Silva
CPF: 249.715.637-92 (ou 123.456.789-00)
Email: teste@exemplo.com
Telefone: (11) 99999-9999
```

---

## 🌐 VARIÁVEIS DE AMBIENTE (Cloudflare Pages)

Para configurar em **Produção**, adicione estas variáveis no Cloudflare:

```bash
# Asaas
ASAAS_API_KEY=[chave acima]
ASAAS_ENV=sandbox
ASAAS_WEBHOOK_TOKEN=[token acima]

# Resend
RESEND_API_KEY=[chave acima]
EMAIL_FROM=cursos@kncursos.com.br
RESEND_WEBHOOK_SECRET=[secret acima]

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kncursos2024
JWT_SECRET=[secret acima]
```

### Como Adicionar no Cloudflare:
1. https://dash.cloudflare.com/
2. **Workers & Pages** → **kncursos**
3. **Settings** → **Environment Variables**
4. Adicionar cada variável
5. Marcar como **Secret** (🔒) as chaves sensíveis
6. **Save**

---

## 🧪 COMO TESTAR

### 1. Teste Local:
```bash
cd /home/user/webapp
npm run dev:sandbox
```

Acesse: http://localhost:3000

### 2. Fazer uma Compra de Teste:
```
1. Acesse a loja: http://localhost:3000
2. Clique em "COMPRAR AGORA" em qualquer curso
3. Preencha com dados de teste:
   - Nome: Teste Silva
   - CPF: 249.715.637-92
   - Email: seu@email.com
   - Telefone: (11) 99999-9999
4. Cartão de teste:
   - Número: 5162 3062 1937 8829
   - Nome: SEU NOME
   - Validade: 05/2025
   - CVV: 318
5. Clique em "Finalizar Compra"
6. ✅ Deve redirecionar para página de sucesso!
```

---

## 📊 ESTATÍSTICAS

### Cursos Cadastrados:
- **Curso 1:** Marketing Digital - R$ 197,00
- **Curso 2:** Desenvolvimento Web - R$ 297,00
- **Curso 3:** TikTok Renda Extra - R$ 97,00 (com PDF)

### Economia Mensal:
- **Mercado Pago:** 4.99% + R$ 0,40/transação
- **Asaas:** 3.49% (sem taxa fixa)
- **Economia:** ~R$ 190/mês (em R$ 10.000 de vendas)

---

## 🔒 SEGURANÇA

### ⚠️ NUNCA COMPARTILHE:
- ❌ API Keys públicas
- ❌ JWT Secrets
- ❌ Webhook Tokens
- ❌ Senhas de admin

### ✅ BOAS PRÁTICAS:
- ✅ Use `.dev.vars` para desenvolvimento local
- ✅ Adicione `.dev.vars` no `.gitignore`
- ✅ Use Cloudflare Secrets para produção
- ✅ Altere senhas padrão em produção
- ✅ Monitore logs de acesso

---

## 📞 SUPORTE

### Asaas:
- Email: [email protected]
- Dashboard: https://www.asaas.com/

### Resend:
- Email: [email protected]
- Dashboard: https://resend.com/

### KN Cursos:
- Email: gelci.silva252@gmail.com
- Dashboard: https://kncursos.pages.dev/admin

---

## 📅 Última Atualização

**Data:** 14 de março de 2026  
**Versão:** 1.0.0  
**Status:** ✅ Todas as credenciais testadas e funcionais

---

**🔐 Mantenha este arquivo em local seguro e privado!**
