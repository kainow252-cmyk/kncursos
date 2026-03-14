# 🧪 RELATÓRIO DE TESTES COMPLETO - Sistema kncursos

## 📅 Data: 14/03/2026
## 🔗 Ambiente: Produção + Local

---

## 🎯 CATEGORIAS DE TESTE

1. ✅ **Autenticação e Permissões**
2. ✅ **Gestão de Cursos**
3. ✅ **Sistema de Vendas**
4. ✅ **Upload de Arquivos (R2)**
5. ✅ **Checkout e Pagamento**
6. ✅ **Sistema de E-mail**
7. ✅ **Download de PDFs**
8. ✅ **Loja Pública**
9. ✅ **Responsividade**
10. ✅ **Performance**

---

## 📊 STATUS DOS TESTES

| # | Categoria | Status | Prioridade |
|---|---|---|---|
| 1 | Autenticação | ⏳ Testando | 🔴 Alta |
| 2 | Gestão Cursos | ⏳ Testando | 🔴 Alta |
| 3 | Vendas | ⏳ Testando | 🟡 Média |
| 4 | Upload R2 | ⏳ Testando | 🔴 Alta |
| 5 | Checkout | ⏳ Testando | 🔴 Alta |
| 6 | E-mail | ⏳ Testando | 🟡 Média |
| 7 | Download PDF | ⏳ Testando | 🔴 Alta |
| 8 | Loja Pública | ⏳ Testando | 🟢 Baixa |
| 9 | Responsividade | ⏳ Testando | 🟢 Baixa |
| 10 | Performance | ⏳ Testando | 🟡 Média |

---

## 1️⃣ TESTES DE AUTENTICAÇÃO E PERMISSÕES

### Teste 1.1: Login Admin
**URL:** https://kncursos.pages.dev/api/auth/login
**Payload:**
```json
{
  "username": "admin",
  "password": "kncursos2024"
}
```

**Resultado Esperado:**
- Status: 200 OK
- Response: `{ "success": true, "role": "admin", "name": "Administrador" }`
- Cookie: `auth_token` definido

**Status:** ⏳ Aguardando teste

---

### Teste 1.2: Login Funcionário
**Payload:**
```json
{
  "username": "funcionario",
  "password": "funcionario123"
}
```

**Resultado Esperado:**
- Status: 200 OK
- Response: `{ "success": true, "role": "employee", "name": "Funcionário Teste" }`

**Status:** ⏳ Aguardando teste

---

### Teste 1.3: Login com Credenciais Inválidas
**Payload:**
```json
{
  "username": "admin",
  "password": "senhaerrada"
}
```

**Resultado Esperado:**
- Status: 401 Unauthorized
- Response: `{ "success": false, "message": "Usuário ou senha inválidos" }`

**Status:** ⏳ Aguardando teste

---

### Teste 1.4: Acesso /admin como Admin
**Pré-requisito:** Login como admin
**URL:** https://kncursos.pages.dev/admin

**Resultado Esperado:**
- Status: 200 OK
- Página carrega com aba "Cursos" e "Vendas"
- Sem redirecionamento

**Status:** ⏳ Aguardando teste

---

### Teste 1.5: Acesso /admin como Funcionário
**Pré-requisito:** Login como funcionario
**URL:** https://kncursos.pages.dev/admin

**Resultado Esperado:**
- Status: 302 Redirect
- Redireciona para: `/cursos`
- Funcionário nunca vê página /admin

**Status:** ⏳ Aguardando teste

---

### Teste 1.6: Acesso /cursos como Admin
**Pré-requisito:** Login como admin
**URL:** https://kncursos.pages.dev/cursos

**Resultado Esperado:**
- Status: 200 OK
- Página carrega normalmente
- SEM aba "Vendas"

**Status:** ⏳ Aguardando teste

---

### Teste 1.7: Acesso /cursos como Funcionário
**Pré-requisito:** Login como funcionario
**URL:** https://kncursos.pages.dev/cursos

**Resultado Esperado:**
- Status: 200 OK
- Página carrega normalmente
- SEM aba "Vendas"

**Status:** ⏳ Aguardando teste

---

### Teste 1.8: Logout
**URL:** https://kncursos.pages.dev/api/auth/logout

**Resultado Esperado:**
- Cookie `auth_token` removido
- Redirecionamento para `/login`

**Status:** ⏳ Aguardando teste

---

## 2️⃣ TESTES DE GESTÃO DE CURSOS

### Teste 2.1: Listar Cursos (API)
**URL:** https://kncursos.pages.dev/api/courses
**Método:** GET

**Resultado Esperado:**
- Status: 200 OK
- Array de cursos com campos: id, title, price, description, image_url, pdf_url, active

**Status:** ⏳ Aguardando teste

---

### Teste 2.2: Criar Curso Novo
**URL:** https://kncursos.pages.dev/api/courses
**Método:** POST
**Payload:**
```json
{
  "title": "Teste Automático",
  "price": 50.00,
  "description": "Curso de teste",
  "content": "Módulo 1, Módulo 2",
  "category": "Teste",
  "featured": false,
  "image_url": "",
  "pdf_url": "",
  "image_width": 400,
  "image_height": 300,
  "active": true
}
```

**Resultado Esperado:**
- Status: 200 OK
- Response: `{ "id": <novo_id>, ... }`
- Curso aparece na listagem

**Status:** ⏳ Aguardando teste

---

### Teste 2.3: Editar Curso Existente
**URL:** https://kncursos.pages.dev/api/courses/1
**Método:** PUT
**Payload:**
```json
{
  "title": "Curso Editado",
  "price": 100.00
}
```

**Resultado Esperado:**
- Status: 200 OK
- Curso atualizado no banco

**Status:** ⏳ Aguardando teste

---

### Teste 2.4: Desativar Curso
**URL:** https://kncursos.pages.dev/api/courses/1
**Método:** PUT
**Payload:**
```json
{
  "active": false
}
```

**Resultado Esperado:**
- Status: 200 OK
- Curso não aparece mais na loja pública

**Status:** ⏳ Aguardando teste

---

## 3️⃣ TESTES DE UPLOAD R2

### Teste 3.1: Upload de Imagem
**URL:** https://kncursos.pages.dev/api/upload
**Método:** POST
**Form Data:**
- file: (arquivo .jpg/.png)
- type: "image"

**Resultado Esperado:**
- Status: 200 OK
- Response: `{ "url": "https://..." }`
- Arquivo acessível via URL retornada

**Status:** ⏳ Aguardando teste

---

### Teste 3.2: Upload de PDF
**URL:** https://kncursos.pages.dev/api/upload
**Método:** POST
**Form Data:**
- file: (arquivo .pdf)
- type: "pdf"

**Resultado Esperado:**
- Status: 200 OK
- Response: `{ "url": "https://..." }`
- PDF acessível via URL

**Status:** ⏳ Aguardando teste

---

## 4️⃣ TESTES DE VENDAS

### Teste 4.1: Listar Vendas
**URL:** https://kncursos.pages.dev/api/sales
**Método:** GET
**Pré-requisito:** Login como admin

**Resultado Esperado:**
- Status: 200 OK
- Array de vendas

**Status:** ⏳ Aguardando teste

---

### Teste 4.2: Gerar Link de Pagamento
**URL:** https://kncursos.pages.dev/api/payment-links
**Método:** POST
**Payload:**
```json
{
  "course_id": 1,
  "link_code": "TESTE001"
}
```

**Resultado Esperado:**
- Status: 200 OK
- Link gerado e salvo no banco

**Status:** ⏳ Aguardando teste

---

## 5️⃣ TESTES DE CHECKOUT

### Teste 5.1: Acessar Página de Checkout
**URL:** https://kncursos.pages.dev/checkout/DEV2024XYZ

**Resultado Esperado:**
- Status: 200 OK
- Página carrega com formulário
- Dados do curso aparecem

**Status:** ⏳ Aguardando teste

---

### Teste 5.2: Processar Pagamento (Sandbox Asaas)
**URL:** https://kncursos.pages.dev/api/sales
**Método:** POST
**Payload:**
```json
{
  "course_id": 1,
  "link_code": "DEV2024XYZ",
  "customer_name": "Teste Silva",
  "customer_email": "teste@test.com",
  "customer_phone": "(11) 99999-9999",
  "customer_cpf": "249.715.637-92",
  "card_number": "5162306219378829",
  "card_holder_name": "TESTE SILVA",
  "card_expiry": "05/2026",
  "card_cvv": "318",
  "used_saved_card": false
}
```

**Resultado Esperado:**
- Status: 200 OK
- Cliente criado no Asaas
- Pagamento aprovado
- Venda registrada no banco
- E-mail enviado
- Redirecionamento para página de sucesso

**Status:** ⏳ Aguardando teste

---

## 6️⃣ TESTES DE E-MAIL

### Teste 6.1: Envio de E-mail de Teste
**URL:** https://kncursos.pages.dev/api/test-email
**Método:** POST

**Resultado Esperado:**
- Status: 200 OK
- E-mail recebido na caixa de entrada
- Resend ID retornado

**Status:** ⏳ Aguardando teste

---

### Teste 6.2: E-mail Após Compra
**Pré-requisito:** Finalizar checkout
**E-mail esperado:**
- Assunto: "🎉 Seu curso está pronto! - [Nome do Curso]"
- Contém link de download
- Botão "BAIXAR CURSO AGORA" funcional

**Status:** ⏳ Aguardando teste

---

## 7️⃣ TESTES DE DOWNLOAD PDF

### Teste 7.1: Download com Token Válido
**URL:** https://kncursos.pages.dev/download/<TOKEN>

**Resultado Esperado:**
- Status: 200 OK
- PDF baixado automaticamente
- Contador de downloads incrementado

**Status:** ⏳ Aguardando teste

---

### Teste 7.2: Download com Token Inválido
**URL:** https://kncursos.pages.dev/download/token-invalido

**Resultado Esperado:**
- Status: 404 Not Found
- Mensagem de erro

**Status:** ⏳ Aguardando teste

---

## 8️⃣ TESTES DE LOJA PÚBLICA

### Teste 8.1: Página Principal
**URL:** https://kncursos.pages.dev/

**Resultado Esperado:**
- Status: 200 OK
- Cursos ativos aparecem
- Cursos inativos NÃO aparecem
- Badge "PDF Incluso" nos cursos com PDF

**Status:** ⏳ Aguardando teste

---

## 9️⃣ TESTES DE RESPONSIVIDADE

### Teste 9.1: Mobile (375px)
**Páginas:** /, /login, /admin, /cursos, /checkout

**Resultado Esperado:**
- Layout não quebra
- Botões acessíveis
- Texto legível

**Status:** ⏳ Aguardando teste

---

### Teste 9.2: Tablet (768px)
**Resultado Esperado:**
- Grid de cursos 2 colunas
- Menu funcional

**Status:** ⏳ Aguardando teste

---

## 🔟 TESTES DE PERFORMANCE

### Teste 10.1: Tempo de Resposta
**Endpoints críticos:**
- GET /api/courses
- POST /api/sales
- GET /

**Resultado Esperado:**
- < 200ms para leitura
- < 500ms para escrita
- < 1s para checkout completo

**Status:** ⏳ Aguardando teste

---

## 📊 RESUMO DE PROBLEMAS ENCONTRADOS

| # | Problema | Severidade | Status | Solução |
|---|---|---|---|---|
| - | - | - | - | - |

---

## ✅ CHECKLIST DE APROVAÇÃO FINAL

- [ ] Login admin funciona
- [ ] Login funcionário funciona
- [ ] Permissões /admin corretas
- [ ] Permissões /cursos corretas
- [ ] Criar curso funciona
- [ ] Editar curso funciona
- [ ] Upload imagem funciona
- [ ] Upload PDF funciona
- [ ] Checkout funciona
- [ ] Pagamento Asaas funciona
- [ ] E-mail é enviado
- [ ] Download PDF funciona
- [ ] Loja pública carrega
- [ ] Responsivo em mobile
- [ ] Performance aceitável

---

**Status Geral:** ⏳ Aguardando execução dos testes  
**Próximo Passo:** Executar bateria de testes automatizados
