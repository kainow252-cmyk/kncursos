# ✅ Checklist de Teste - Pagamento com Cartão

## 🎯 Objetivo
Testar o fluxo completo de compra com cartão de crédito via Asaas (Sandbox).

---

## 📋 PRÉ-REQUISITOS

- [ ] Servidor rodando em: https://3000-ihzpzsrue6cd8i31gsaca-0e616f0a.sandbox.novita.ai
- [ ] Credenciais Asaas configuradas em `.dev.vars`
- [ ] Ambiente: **Sandbox** (teste, sem cobranças reais)

---

## 🧪 TESTE 1: Compra de Curso Básico

### Passo 1: Acessar a Loja
- [ ] Abrir: https://3000-ihzpzsrue6cd8i31gsaca-0e616f0a.sandbox.novita.ai
- [ ] Verificar se os 3 cursos aparecem na página inicial
- [ ] Verificar se o botão "COMPRAR AGORA" está visível

### Passo 2: Selecionar Curso
- [ ] Escolher: **"Curso de Marketing Digital"** (R$ 197,00)
- [ ] Clicar em **"COMPRAR AGORA"**
- [ ] Verificar redirecionamento para `/checkout/MKT2024ABC`

### Passo 3: Preencher Dados Pessoais
```
Nome Completo: Teste Silva
CPF: 249.715.637-92
Telefone: (11) 99999-9999
E-mail: teste@exemplo.com
```
- [ ] Preencher todos os campos acima
- [ ] Verificar formatação automática do CPF (000.000.000-00)

### Passo 4: Preencher Dados do Cartão
```
Número do Cartão: 5162 3062 1937 8829
Nome no Cartão: TESTE SILVA
Validade: 05/25
CVV: 318
```
- [ ] Preencher todos os campos do cartão
- [ ] Verificar formatação automática (espaços no número)
- [ ] Verificar nome em maiúsculas automaticamente

### Passo 5: Finalizar Compra
- [ ] Clicar em **"FINALIZAR COMPRA SEGURA"**
- [ ] Aguardar mensagem "Processando pagamento..."
- [ ] Verificar redirecionamento para `/success/[TOKEN]`

### Passo 6: Página de Sucesso
- [ ] Verificar mensagem "Pagamento Aprovado!"
- [ ] Verificar botão "Baixar Material do Curso (PDF)"
- [ ] Verificar informações da compra (pedido, valor, data)
- [ ] Verificar se o curso possui PDF (somente o TikTok tem)

### Passo 7: Verificar E-mail (Opcional)
- [ ] Abrir o e-mail usado no teste
- [ ] Verificar recebimento do e-mail de confirmação
- [ ] Clicar no link de download do PDF (se aplicável)

---

## 🧪 TESTE 2: Compra do Curso com PDF

### Passo 1: Escolher Curso com PDF
- [ ] Acessar a loja novamente
- [ ] Escolher: **"Desvende a Renda Extra no TikTok"** (R$ 97,00)
- [ ] Verificar badge **"PDF INCLUSO"**
- [ ] Clicar em **"COMPRAR AGORA"**

### Passo 2: Preencher Dados
```
DADOS PESSOAIS:
Nome: João Silva
CPF: 123.456.789-00
Telefone: (47) 99999-9999
E-mail: joao@teste.com

CARTÃO:
Número: 5162 3062 1937 8829
Nome: JOAO SILVA
Validade: 05/25
CVV: 318
```
- [ ] Preencher com dados acima
- [ ] Finalizar compra

### Passo 3: Testar Download
- [ ] Na página de sucesso, clicar em **"Baixar Material do Curso (PDF)"**
- [ ] Verificar se o download inicia
- [ ] Verificar se é o PDF correto
- [ ] Guardar o link de download para testar novamente

### Passo 4: Re-Download (Testar Link Permanente)
- [ ] Copiar a URL da página de sucesso
- [ ] Abrir em uma nova aba anônima
- [ ] Verificar se ainda consegue baixar o PDF
- [ ] Confirmar que downloads ilimitados funcionam

---

## 🧪 TESTE 3: Validações e Erros

### Teste 3.1: CPF Inválido
- [ ] Tentar comprar com CPF: `111.111.111-11`
- [ ] Verificar se mostra erro de validação

### Teste 3.2: Cartão Recusado
```
Usar cartão de teste RECUSADO:
Número: 5111 1111 1111 1111
Nome: TESTE RECUSADO
Validade: 05/25
CVV: 123
```
- [ ] Tentar finalizar compra
- [ ] Verificar mensagem de erro apropriada
- [ ] Confirmar que NÃO redireciona para sucesso

### Teste 3.3: Campos Vazios
- [ ] Tentar finalizar sem preencher dados pessoais
- [ ] Verificar validação HTML5 (required)
- [ ] Tentar finalizar sem dados do cartão
- [ ] Verificar mensagens de erro

### Teste 3.4: Link Inválido
- [ ] Acessar: `/checkout/LINK-INVALIDO-123`
- [ ] Verificar mensagem de erro apropriada
- [ ] Confirmar que não permite compra

---

## 🔐 TESTE 4: Painel Admin

### Passo 1: Login
- [ ] Acessar: `/login`
- [ ] Usuário: `admin`
- [ ] Senha: `kncursos2024`
- [ ] Fazer login

### Passo 2: Visualizar Vendas
- [ ] Ir para aba **"Vendas"**
- [ ] Verificar se as vendas de teste aparecem
- [ ] Conferir valores, nomes, status
- [ ] Verificar ID do pagamento Asaas

### Passo 3: Ver Links de Pagamento
- [ ] Ir para aba **"Cursos"**
- [ ] Clicar em **"Ver Links"** de algum curso
- [ ] Verificar lista de links gerados
- [ ] Copiar um link e testar

### Passo 4: Criar Novo Curso (Opcional)
- [ ] Clicar em **"Novo Curso"**
- [ ] Preencher informações
- [ ] Salvar curso
- [ ] Gerar link de pagamento
- [ ] Testar compra deste novo curso

---

## 📊 RESULTADOS ESPERADOS

### ✅ O que DEVE funcionar:
- ✅ Loja exibe todos os cursos
- ✅ Checkout processa pagamento
- ✅ Redirecionamento para página de sucesso
- ✅ Download de PDF funciona (curso TikTok)
- ✅ E-mail é enviado (se Resend configurado)
- ✅ Vendas aparecem no admin
- ✅ Login admin funciona
- ✅ Links permanentes funcionam

### ❌ O que NÃO deve funcionar:
- ❌ Cartões recusados devem mostrar erro
- ❌ CPF inválido deve mostrar erro
- ❌ Links inválidos devem mostrar erro
- ❌ Campos vazios não devem permitir submit

---

## 🐛 Problemas Comuns

### Problema: "Erro ao processar pagamento"
**Possíveis causas:**
- [ ] Variável `ASAAS_API_KEY` não configurada
- [ ] Ambiente errado (`ASAAS_ENV`)
- [ ] Cartão de teste incorreto
- [ ] Servidor não está rodando

**Solução:**
1. Verificar `.dev.vars` existe e está correto
2. Reiniciar servidor: `npm run dev:sandbox`
3. Usar cartão de teste correto: `5162 3062 1937 8829`

### Problema: "Link de pagamento inválido"
**Solução:**
- [ ] Verificar se o link existe no banco
- [ ] Usar links gerados no admin
- [ ] Exemplo válido: `/checkout/MKT2024ABC`

### Problema: "Página de sucesso não carrega"
**Solução:**
- [ ] Verificar se token foi gerado
- [ ] Checar tabela `sales` no banco
- [ ] Ver logs do servidor

---

## 📝 Anotações de Teste

### Teste realizado em: ___/___/______

**Resultados:**
- [ ] ✅ Todos os testes passaram
- [ ] ⚠️ Alguns testes falharam (anotar abaixo)
- [ ] ❌ Muitos problemas encontrados

**Problemas encontrados:**
```
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________
```

**Observações:**
```
___________________________________________________
___________________________________________________
___________________________________________________
```

---

## 🚀 Após os Testes

- [ ] Documentar problemas encontrados
- [ ] Corrigir bugs identificados
- [ ] Re-testar funcionalidades corrigidas
- [ ] Aprovar para produção (quando tudo funcionar)

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do servidor
2. Checar variáveis de ambiente
3. Consultar documentação Asaas
4. Contatar suporte técnico

---

**Data do último teste:** ___/___/______  
**Testado por:** _________________  
**Status:** [ ] Aprovado [ ] Pendente [ ] Reprovado
