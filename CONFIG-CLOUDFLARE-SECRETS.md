# 🔐 Configurar Secrets no Cloudflare Pages

## Problema
O erro **"invalid_access_token"** indica que a chave da API Asaas não está configurada em produção.

## ⚠️ IMPORTANTE
As variáveis de ambiente do arquivo `.dev.vars` são **apenas para desenvolvimento local**. Elas **NÃO são enviadas** automaticamente para produção no Cloudflare Pages.

---

## 📋 Solução: Configurar Secrets Manualmente

### 1. Acessar Dashboard do Cloudflare
1. Acesse: https://dash.cloudflare.com/
2. Vá em **Workers & Pages** → **vemgo**
3. Clique na aba **Settings**
4. Role até **Environment variables**

### 2. Adicionar as Variáveis de Ambiente
Clique em **Add variable** e adicione cada uma das seguintes variáveis:

#### **Asaas (Pagamentos)**
```
Variable name: ASAAS_API_KEY
Value: $aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjIwY2I2YjJiLTA0YjAtNDJjNi04YjAzLWE5NWVjYTJlZTgzMjo6JGFhY2hfOWYxOGNjOGEtMjQyYi00NGNiLThmZjUtZGY5MWI5YTA0Yjlm
Encrypt: ✅ (marcar como secreta)
```

```
Variable name: ASAAS_ENV
Value: sandbox
Encrypt: ❌
```

```
Variable name: ASAAS_WEBHOOK_TOKEN
Value: whsec_JmShFzK6nmqkFL11RF_RIaB2zcNPWcpaA5akwxWw4oM
Encrypt: ✅
```

#### **Resend (E-mails)**
```
Variable name: RESEND_API_KEY
Value: re_JDP5HjRp_DEBc12yNzQbGbt4rVWpCKjU6
Encrypt: ✅
```

```
Variable name: EMAIL_FROM
Value: cursos@vemgo.com.br
Encrypt: ❌
```

```
Variable name: RESEND_WEBHOOK_SECRET
Value: whsec_T2Q53tFGgdWg0F04xpa4gv7kdcrGJg7t
Encrypt: ✅
```

#### **Admin (Painel Administrativo)**
```
Variable name: ADMIN_USERNAME
Value: admin
Encrypt: ❌
```

```
Variable name: ADMIN_PASSWORD
Value: vemgo2024
Encrypt: ✅
```

```
Variable name: JWT_SECRET
Value: vemgo-jwt-secret-change-in-production-2024
Encrypt: ✅
```

### 3. Aplicar para Production
**IMPORTANTE:** Certifique-se de que as variáveis estão configuradas para o ambiente **Production**.

### 4. Redesployar (Opcional)
Após adicionar as variáveis, faça um novo deploy para garantir que tudo funcione:
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name vemgo
```

---

## ✅ Verificação
Após configurar as variáveis:
1. Acesse: https://vemgo.pages.dev/checkout/DEV2024XYZ
2. Preencha o formulário e clique em **Finalizar Compra**
3. O erro **"invalid_access_token"** deve desaparecer

---

## 📝 Notas
- **Sandbox (desenvolvimento)**: Use `ASAAS_ENV=sandbox` para testes
- **Produção**: Altere para `ASAAS_ENV=production` e use a chave de API de produção
- **Segurança**: Sempre marque API keys como **Encrypt** (secretas)

---

## 🔄 Comandos Úteis
```bash
# Verificar variáveis locais
cat .dev.vars

# Testar localmente
npm run build
pm2 restart vemgo

# Deploy para produção
npm run deploy
```

---

## 🆘 Se o Erro Persistir
1. Verifique se todas as variáveis foram adicionadas corretamente
2. Confirme que estão no ambiente **Production**
3. Faça um novo deploy
4. Limpe o cache do navegador (Ctrl+Shift+R)
5. Teste em modo anônimo (Ctrl+Shift+N)

---

## 📞 Suporte Asaas
- Documentação: https://docs.asaas.com/
- Painel: https://www.asaas.com/
- Suporte: suporte@asaas.com
