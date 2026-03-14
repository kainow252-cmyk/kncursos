# ✅ CHECKLIST COMPLETO DE TESTES - PRODUÇÃO

## 🎯 Status: PRONTO PARA TESTES FINAIS

**Último Deploy:** https://afcfcd33.kncursos.pages.dev

---

## 📋 TESTES OBRIGATÓRIOS ANTES DE PRODUÇÃO

### 1️⃣ **AUTENTICAÇÃO E LOGIN**

#### Login Admin
- [ ] Acessar https://kncursos.pages.dev/login
- [ ] Testar login com credenciais corretas (admin/kncursos2024)
- [ ] Testar login com credenciais incorretas (deve dar erro)
- [ ] Verificar se redireciona para /admin após login
- [ ] Verificar botão "Sair" funcionando
- [ ] Verificar se após logout não consegue acessar /admin

---

### 2️⃣ **ROTA /CURSOS (FUNCIONÁRIOS)**

#### Acesso à Rota
- [ ] Acessar https://kncursos.pages.dev/cursos
- [ ] Verificar se redireciona para login (se não autenticado)
- [ ] Fazer login e verificar se carrega a página de cursos
- [ ] Verificar se o header mostra "Gerenciar Cursos"
- [ ] Verificar se NÃO tem aba "Vendas"
- [ ] Verificar se NÃO tem botão "Gerar Link"

#### CRUD de Cursos na Rota /cursos
- [ ] Clicar em "Novo Curso"
- [ ] Preencher todos os campos
- [ ] Fazer upload de imagem
- [ ] Fazer upload de PDF
- [ ] Salvar curso
- [ ] Verificar se curso aparece na lista
- [ ] Clicar em "Editar" no curso
- [ ] Modificar dados
- [ ] Salvar alterações
- [ ] Verificar se mudanças foram aplicadas
- [ ] Clicar em "Excluir"
- [ ] Confirmar exclusão
- [ ] Verificar se curso foi removido

---

### 3️⃣ **ROTA /ADMIN (ADMINISTRADOR)**

#### Acesso Completo
- [ ] Acessar https://kncursos.pages.dev/admin
- [ ] Verificar se tem aba "Cursos"
- [ ] Verificar se tem aba "Vendas"
- [ ] Alternar entre abas
- [ ] Verificar se ambas funcionam

#### Aba Cursos
- [ ] Criar novo curso
- [ ] Editar curso existente
- [ ] Fazer upload de imagens
- [ ] Fazer upload de PDF
- [ ] Configurar dimensões da imagem
- [ ] Salvar curso
- [ ] Clicar em "Ver Links"
- [ ] Clicar em "Gerar Link"
- [ ] Copiar link gerado
- [ ] Verificar se link foi copiado

#### Aba Vendas
- [ ] Clicar na aba "Vendas"
- [ ] Verificar lista de vendas
- [ ] Verificar estatísticas (total, faturamento)
- [ ] Testar filtro por data
- [ ] Verificar se mostra dados corretos
- [ ] Testar exportação (se disponível)

---

### 4️⃣ **LOJA PÚBLICA**

#### Página Principal
- [ ] Acessar https://kncursos.pages.dev/
- [ ] Verificar se cursos são exibidos
- [ ] Verificar se imagens carregam
- [ ] Verificar se preços são exibidos corretamente
- [ ] Verificar se badges "PDF Incluso" aparecem
- [ ] Clicar em "Comprar Agora"
- [ ] Verificar se redireciona para checkout

---

### 5️⃣ **CHECKOUT E PAGAMENTO**

#### Página de Checkout
- [ ] Acessar https://kncursos.pages.dev/checkout/DEV2024XYZ
- [ ] Verificar se informações do curso carregam
- [ ] Verificar se imagem do curso é exibida
- [ ] Verificar se preço está correto

#### Formulário de Pagamento
- [ ] Preencher nome completo
- [ ] Preencher CPF válido (249.715.637-92)
- [ ] Preencher email
- [ ] Preencher telefone
- [ ] Preencher número do cartão de teste (5162 3062 1937 8829)
- [ ] Preencher nome no cartão
- [ ] Preencher validade (05/2026)
- [ ] Preencher CVV (318)
- [ ] Clicar em "Finalizar Compra"

#### Resultado do Pagamento
- [ ] Verificar se mostra loading
- [ ] Aguardar processamento
- [ ] Verificar se redireciona para página de sucesso
- [ ] Verificar se mostra número do pedido
- [ ] Verificar se mostra valor pago
- [ ] Verificar se mostra data da compra
- [ ] Verificar se tem botão de download

---

### 6️⃣ **E-MAIL DE CONFIRMAÇÃO**

#### Envio de E-mail
- [ ] Verificar caixa de entrada
- [ ] Verificar pasta SPAM
- [ ] Verificar se e-mail chegou
- [ ] Verificar se remetente está correto (cursos@kncursos.com.br)
- [ ] Verificar se assunto está correto
- [ ] Abrir e-mail
- [ ] Verificar se informações estão corretas
- [ ] Verificar se link de download funciona
- [ ] Clicar no botão "Baixar Curso"
- [ ] Verificar se PDF é baixado

---

### 7️⃣ **UPLOAD DE ARQUIVOS (R2)**

#### Upload de Imagens
- [ ] Ir para /admin ou /cursos
- [ ] Criar/editar curso
- [ ] Clicar em "Upload Imagem"
- [ ] Selecionar imagem (JPG, PNG, GIF, WEBP)
- [ ] Verificar preview da imagem
- [ ] Salvar curso
- [ ] Verificar se imagem aparece no card do curso
- [ ] Verificar se imagem carrega na loja pública

#### Upload de PDFs
- [ ] Criar/editar curso
- [ ] Clicar em "Upload PDF"
- [ ] Selecionar arquivo PDF
- [ ] Verificar nome do arquivo
- [ ] Salvar curso
- [ ] Verificar se badge "PDF Incluso" aparece
- [ ] Testar download do PDF após compra

---

### 8️⃣ **BANCO DE DADOS (D1)**

#### Verificar Dados Salvos
- [ ] Acessar https://dash.cloudflare.com/
- [ ] Ir em Storage & Databases → D1 → kncursos
- [ ] Console → Executar: `SELECT * FROM courses LIMIT 5;`
- [ ] Verificar se cursos estão salvos
- [ ] Executar: `SELECT * FROM sales ORDER BY id DESC LIMIT 5;`
- [ ] Verificar se vendas estão registradas
- [ ] Verificar se `asaas_payment_id` está preenchido
- [ ] Verificar se `asaas_customer_id` está preenchido

---

### 9️⃣ **TESTE DE E-MAIL**

#### Página de Teste
- [ ] Acessar https://kncursos.pages.dev/test-email
- [ ] Clicar em "Enviar E-mail de Teste"
- [ ] Aguardar resposta
- [ ] Verificar se mostra "Sucesso"
- [ ] Verificar Resend ID retornado
- [ ] Checar caixa de entrada
- [ ] Verificar se e-mail de teste chegou

---

### 🔟 **INTEGRAÇÃO ASAAS (SANDBOX)**

#### Verificar no Painel Asaas
- [ ] Acessar https://www.asaas.com/
- [ ] Fazer login
- [ ] Ir para seção "Clientes"
- [ ] Verificar se cliente de teste foi criado
- [ ] Ir para seção "Pagamentos"
- [ ] Verificar se pagamento foi registrado
- [ ] Verificar status do pagamento
- [ ] Verificar valor do pagamento

---

### 1️⃣1️⃣ **TESTES DE SEGURANÇA**

#### Proteção de Rotas
- [ ] Tentar acessar /admin sem login (deve redirecionar para /login)
- [ ] Tentar acessar /cursos sem login (deve redirecionar para /login)
- [ ] Fazer logout e tentar acessar rotas protegidas
- [ ] Verificar se token JWT expira corretamente

#### Validações
- [ ] Testar checkout com CPF inválido
- [ ] Testar checkout com cartão inválido
- [ ] Testar checkout com campos vazios
- [ ] Verificar se mensagens de erro são exibidas
- [ ] Tentar fazer upload de arquivo muito grande
- [ ] Tentar fazer upload de tipo de arquivo não permitido

---

### 1️⃣2️⃣ **TESTES DE RESPONSIVIDADE**

#### Desktop
- [ ] Testar em resolução 1920x1080
- [ ] Verificar se layout está correto
- [ ] Verificar se todos os elementos são visíveis

#### Mobile
- [ ] Testar em celular ou DevTools (375x667)
- [ ] Verificar se menu é responsivo
- [ ] Verificar se formulários são utilizáveis
- [ ] Verificar se botões são clicáveis
- [ ] Verificar se checkout funciona em mobile

---

### 1️⃣3️⃣ **PERFORMANCE**

#### Velocidade de Carregamento
- [ ] Medir tempo de carregamento da home
- [ ] Medir tempo de carregamento do checkout
- [ ] Verificar se imagens carregam rapidamente
- [ ] Verificar se não há erros no console (F12)

---

## ✅ CHECKLIST RESUMIDO (TESTES CRÍTICOS)

### 🔴 **OBRIGATÓRIOS ANTES DE PRODUÇÃO:**

1. [ ] Login funciona (/login)
2. [ ] Rota /cursos funciona (sem vendas)
3. [ ] Rota /admin funciona (com vendas)
4. [ ] Loja pública mostra cursos (/)
5. [ ] Checkout processa pagamento
6. [ ] E-mail de confirmação é enviado
7. [ ] Upload de imagens funciona
8. [ ] Upload de PDFs funciona
9. [ ] Banco de dados salva corretamente
10. [ ] Integração Asaas funciona

---

## 🚨 PROBLEMAS CONHECIDOS

### ⚠️ **Para Corrigir Antes de Produção Real:**

1. **Tailwind CDN:**
   - ⚠️ Usando CDN em produção
   - 📝 Recomendado: Instalar Tailwind via PostCSS

2. **Ambiente Sandbox:**
   - ⚠️ Asaas está em modo sandbox
   - 📝 Trocar para produção: `ASAAS_ENV=production`

3. **Credenciais Compartilhadas:**
   - ⚠️ /admin e /cursos usam mesmas credenciais
   - 📝 Opcional: Criar usuários separados

---

## 🎯 RESULTADO ESPERADO

Após completar TODOS os testes acima:

✅ **Sistema está pronto para produção real** se:
- Todos os testes passaram
- Nenhum erro crítico encontrado
- Funcionalidades principais funcionam

⚠️ **Sistema NÃO está pronto** se:
- Algum teste crítico falhou
- Erros no console
- Funcionalidades essenciais quebradas

---

## 📝 RELATÓRIO DE TESTES

Após completar os testes, preencha:

```
Data dos testes: ___/___/______
Testador: _____________________

Testes completados: ___/13 seções
Testes críticos OK: ___/10

Problemas encontrados:
1. _____________________________
2. _____________________________
3. _____________________________

Status final: [ ] Aprovado [ ] Reprovado

Assinatura: ____________________
```

---

## 🚀 PRÓXIMOS PASSOS APÓS APROVAÇÃO

1. [ ] Trocar `ASAAS_ENV` para `production`
2. [ ] Atualizar chave API Asaas para produção
3. [ ] Fazer backup completo
4. [ ] Testar com valor pequeno real
5. [ ] Monitorar primeiras vendas
6. [ ] Documentar processos

---

**🔍 COMECE OS TESTES AGORA!**

**URLs para testar:**
- Login: https://kncursos.pages.dev/login
- Cursos: https://kncursos.pages.dev/cursos
- Admin: https://kncursos.pages.dev/admin
- Loja: https://kncursos.pages.dev/
- Checkout: https://kncursos.pages.dev/checkout/DEV2024XYZ
