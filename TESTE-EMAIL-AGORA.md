# 🧪 TESTAR ENVIO DE E-MAIL AGORA!

## ✅ Nova Rota de Teste Criada

Acabei de adicionar uma rota especial para testar o envio de e-mail!

---

## 🚀 COMO TESTAR

### **Método 1: Via Navegador (MAIS FÁCIL)**

Basta acessar esta URL no navegador:

```
https://kncursos.pages.dev/test-email-form
```

**OU testar via curl:**

```bash
curl -X POST https://kncursos.pages.dev/api/test-email \
  -H "Content-Type: application/json"
```

---

## 🎯 O Que Vai Acontecer

### ✅ Se Funcionar:
1. E-mail será enviado para `gelci.silva252@gmail.com`
2. Assunto: "🧪 Teste de E-mail - KN Cursos"
3. Resposta JSON:
```json
{
  "success": true,
  "message": "E-mail de teste enviado com sucesso!",
  "resend_id": "abc123...",
  "from": "cursos@kncursos.com.br",
  "to": "gelci.silva252@gmail.com"
}
```
4. Verifique sua caixa de entrada (e SPAM)

### ❌ Se Não Funcionar:
Resposta indicará o erro específico:
```json
{
  "success": false,
  "error": "Descrição do erro",
  "details": {...}
}
```

---

## 📋 Erros Comuns e Soluções

### Erro 1: "Domain not verified"
**Causa:** Domínio `kncursos.com.br` não está verificado no Resend  
**Solução:**
1. Acesse: https://resend.com/domains
2. Adicione o domínio
3. Configure registros DNS
4. **OU** use `onboarding@resend.dev` (e-mail sandbox)

### Erro 2: "Invalid API key"
**Causa:** `RESEND_API_KEY` incorreto ou não configurado  
**Solução:**
1. Verifique: https://resend.com/api-keys
2. Copie a chave correta
3. Atualize no Cloudflare:
```bash
echo 'SUA_CHAVE_AQUI' | npx wrangler pages secret put RESEND_API_KEY --project-name kncursos
```

### Erro 3: "Email not in audience"
**Causa:** No modo sandbox, destinatário não está autorizado  
**Solução:**
1. Acesse: https://resend.com/settings/audiences
2. Adicione `gelci.silva252@gmail.com`

---

## 🔧 Trocar para E-mail Sandbox (Se Necessário)

Se o domínio ainda não foi verificado, use o e-mail sandbox:

```bash
echo 'onboarding@resend.dev' | npx wrangler pages secret put EMAIL_FROM --project-name kncursos
```

**Importante:** Com e-mail sandbox, precisa adicionar destinatários autorizados.

---

## ✅ DEPOIS DE TESTAR

1. **Se funcionou:** Parabéns! Sistema está 100% operacional
2. **Se não funcionou:** Me envie o JSON de erro retornado
3. **Verifique painel Resend:** https://resend.com/emails

---

## 📊 Status do Sistema

| Componente | Status |
|------------|--------|
| ✅ Checkout | Funcionando perfeitamente |
| ✅ Pagamento Asaas | Funcionando perfeitamente |
| ✅ Banco D1 | Funcionando perfeitamente |
| ⏳ E-mail Resend | **Testar agora** |

---

## 🎉 TESTE AGORA!

**Acesse:** https://kncursos.pages.dev/api/test-email

Ou execute:
```bash
curl -X POST https://kncursos.pages.dev/api/test-email
```

**Me avise o resultado!** 🚀
