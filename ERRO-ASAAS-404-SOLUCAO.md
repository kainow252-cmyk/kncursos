# 🚨 Erro: Asaas Retornando 404

## Problema Identificado

**Status:** A chave API do Asaas está **INVÁLIDA ou EXPIRADA**

### Sintomas
```
Erro: "Asaas retornou resposta inválida (provavelmente HTML). Status: 404"
HTTP Status: 404 ao tentar acessar https://api.asaas.com/api/v3/customers
```

### Causa
A chave API configurada (`$aact_prod_000Mzkw...`) não é mais válida. Possíveis motivos:
- Chave expirada
- Chave revogada
- Chave de teste em ambiente de produção
- Erro de cópia/colagem da chave

---

## 🔧 Solução: Gerar Nova Chave API

### Passo 1: Acessar Painel Asaas

1. Acesse: **https://www.asaas.com**
2. Faça login com suas credenciais
3. Vá em: **Menu → Integrações → API Key → Chaves API**

### Passo 2: Gerar Nova Chave

1. Clique em **"Gerar nova chave"** ou **"Nova chave API"**
2. Selecione o ambiente: **Produção**
3. Confirme a criação
4. **COPIE A CHAVE IMEDIATAMENTE** (ela começa com `$aact_prod_...`)
   - ⚠️ Você **NÃO** poderá ver a chave novamente!
   - Se perder, terá que gerar outra

### Passo 3: Atualizar no Sistema

#### 3.1 Atualizar no Cloudflare Pages (Produção)

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)

# O comando vai pedir a chave - cole a nova chave do Asaas:
npx wrangler pages secret put ASAAS_API_KEY --project-name=vemgo
```

**Quando aparecer:**
```
Enter a secret value:
```

**Cole a nova chave** (ex: `$aact_prod_ABC123DEF456...`) e pressione Enter.

#### 3.2 Atualizar no arquivo .dev.vars (Desenvolvimento)

```bash
cd /home/user/webapp
nano .dev.vars
```

**Localize a linha:**
```
ASAAS_API_KEY=$aact_prod_000Mzkw...
```

**Substitua pelo novo valor:**
```
ASAAS_API_KEY=$aact_prod_NOVA_CHAVE_AQUI
```

Salve: `Ctrl+O` → Enter → `Ctrl+X`

#### 3.3 Fazer Novo Deploy

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare-token)
npm run deploy
```

---

## ✅ Verificar se Funcionou

### Teste 1: Testar chave diretamente

```bash
# Substitua YOUR_NEW_KEY pela nova chave:
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "access_token: YOUR_NEW_KEY" \
  -H "User-Agent: vemgo/1.0" \
  https://api.asaas.com/api/v3/customers?limit=1
```

**Resultado esperado:**
```json
{
  "object": "list",
  "hasMore": false,
  "totalCount": 0,
  "limit": 1,
  "offset": 0,
  "data": []
}
HTTP_STATUS:200
```

**Se aparecer 404 novamente:**
- A chave ainda está incorreta
- Verifique se copiou a chave completa (incluindo `$aact_prod_`)
- Gere uma nova chave no Asaas

### Teste 2: Fazer compra no site

```bash
# Acesse:
https://b002e9f3.vemgo.pages.dev

# Escolha um curso
# Use o cartão de teste:
Número: 5162 3062 1937 8829
Titular: MARCELO H ALMEIDA
Validade: 05/2025
CVV: 318

# Deve aparecer:
✅ "Pagamento aprovado! Verifique seu email para acessar o curso."
```

---

## 📋 Checklist Completo

- [ ] Acessei o painel Asaas (https://www.asaas.com)
- [ ] Fui em Integrações → API Key → Chaves API
- [ ] Gerei uma nova chave de **Produção**
- [ ] Copiei a chave completa (começa com `$aact_prod_`)
- [ ] Atualizei no Cloudflare com `npx wrangler pages secret put`
- [ ] Atualizei no arquivo `.dev.vars`
- [ ] Fiz deploy com `npm run deploy`
- [ ] Testei a chave com curl (retornou 200)
- [ ] Fiz uma compra de teste (pagamento aprovado)

---

## 🔐 Sobre a Chave API

### Formato da Chave Válida
```
$aact_prod_ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567...
```

**Características:**
- Começa com `$aact_prod_` (produção) ou `$aact_` (sandbox)
- Contém letras, números e caracteres especiais
- Tem aproximadamente 150-200 caracteres
- É **case-sensitive** (maiúsculas ≠ minúsculas)

### ⚠️ Segurança
- **NUNCA** compartilhe sua chave API publicamente
- **NUNCA** comite a chave no Git (já está no .gitignore)
- Se a chave vazar, **revogue** imediatamente e gere uma nova
- Mantenha backups seguros da chave

---

## 🆘 Problemas Comuns

### Problema: "Ainda dá 404 com a nova chave"

**Soluções:**
1. Verifique se copiou a chave **completa** (incluindo o prefixo `$aact_prod_`)
2. Certifique-se de que é uma chave de **Produção** (não Sandbox)
3. Aguarde 1-2 minutos após criar a chave (propagação)
4. Limpe o cache do browser e tente novamente

### Problema: "Não consigo acessar o painel Asaas"

**Soluções:**
1. Recupere a senha em: https://www.asaas.com/login
2. Entre em contato com o suporte: suporte@asaas.com
3. Verifique se sua conta está ativa

### Problema: "Não encontro onde gerar a chave API"

**Caminho detalhado:**
```
Login → Painel Principal → Barra lateral esquerda → 
Integrações (ícone de puzzle) → API Key → Chaves API → 
Botão "Gerar nova chave" ou "Nova chave API"
```

---

## 📞 Suporte

### Asaas
- **Site:** https://www.asaas.com/suporte
- **Email:** suporte@asaas.com
- **Telefone:** (47) 3433-2909
- **Chat:** Disponível no painel após login

### Vemgo (Sistema)
- **GitHub Issues:** https://github.com/kainow252-cmyk/vemgo/issues
- **Email:** gelci.jose.grouptrig@gmail.com

---

## 📊 Status do Sistema

**Após corrigir a chave, o sistema ficará:**
- ✅ Pagamentos Asaas funcionando
- ✅ Emails automáticos
- ✅ Downloads de PDF
- ✅ Admin dashboard operacional
- ⏸️ SuitPay fallback (aguardando documentação)

**Uptime esperado:** ~99.0% (apenas Asaas)

---

**Documento criado em:** 14/03/2026 13:45 UTC  
**Status:** ⚠️ Aguardando nova chave API do Asaas
