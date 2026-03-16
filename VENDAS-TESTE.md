# 🧪 Gerador de Vendas de Teste - vemgo

## 📋 Visão Geral

Sistema para criar vendas de teste **sem processar pagamentos reais** no Mercado Pago. Útil para testar o dashboard, exportação CSV/PDF e fluxo de vendas em ambiente de desenvolvimento/sandbox.

---

## 🔗 URLs de Acesso

### **Página de Teste (Interface Visual)**
```
Sandbox Local: https://3000-i5doa1u25u94y4sjizudd-d0b9e1e2.sandbox.novita.ai/test-sales
Produção: https://vemgo.pages.dev/test-sales
Versão atual: https://74907eee.vemgo.pages.dev/test-sales
```

### **API Endpoint**
```
POST /api/test-sales
```

---

## 🎯 Como Usar

### **Método 1: Interface Visual (Recomendado)**

1. **Acesse a página de teste:**
   ```
   https://vemgo.pages.dev/test-sales
   ```

2. **Preencha o formulário:**
   - Selecione um curso
   - Defina quantidade de vendas (1-100)
   - (Opcional) Marque "Enviar emails de teste"

3. **Clique em "Gerar Vendas de Teste"**
   - Sistema cria vendas automaticamente
   - Dados aleatórios brasileiros realistas
   - Inserido diretamente no banco de dados

4. **Visualize no Dashboard:**
   - Acesse: https://vemgo.pages.dev/admin
   - Vá na aba "Vendas"
   - Veja as vendas de teste criadas

### **Método 2: API Direta (cURL/Postman)**

```bash
curl -X POST https://vemgo.pages.dev/api/test-sales \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "quantity": 10,
    "send_email": false
  }'
```

**Parâmetros:**
- `course_id` (obrigatório): ID do curso (1, 2 ou 3)
- `quantity` (opcional): Quantidade de vendas (padrão: 1, máximo: 100)
- `send_email` (opcional): Enviar email de teste (padrão: false)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "10 venda(s) de teste criada(s)",
  "course": "Curso de Marketing Digital",
  "sales": [
    {
      "customer_name": "João Silva",
      "customer_email": "joao.silva123@email.com",
      "customer_cpf": "123.456.789-09",
      "customer_phone": "(11) 98765-4321",
      "amount": 197,
      "course": "Curso de Marketing Digital",
      "access_token": "abc123xyz456"
    }
  ]
}
```

---

## 📊 Dados Gerados Automaticamente

### **Informações do Cliente (Aleatórias)**

**Nomes Brasileiros:**
- João, Maria, José, Ana, Pedro, Carla, Lucas, Fernanda, Rafael, Juliana, Bruno, Camila, Diego, Patricia, Gabriel

**Sobrenomes Brasileiros:**
- Silva, Santos, Oliveira, Souza, Lima, Costa, Pereira, Rodrigues, Almeida, Nascimento, Ferreira, Araújo, Ribeiro, Martins, Carvalho

**CPF:**
- Formato válido: `123.456.789-09`
- Números aleatórios (não validados pelo algoritmo)

**Email:**
- Formato: `nome.sobrenome123@email.com`
- Baseado no nome gerado

**Telefone:**
- Formato: `(11) 98765-4321`
- DDD aleatório entre 11 e 99
- 9 dígitos com 9 na frente

### **Dados da Venda**

- **Status:** `completed` (confirmada)
- **Link Code:** `TEST` (identificador de venda de teste)
- **Access Token:** Gerado automaticamente (único por venda)
- **Valor:** Preço real do curso selecionado
- **Data:** Data e hora da criação

---

## ⚠️ Avisos Importantes

### **Uso Recomendado:**
- ✅ Ambiente de desenvolvimento/sandbox
- ✅ Testes de dashboard e relatórios
- ✅ Demonstrações para clientes
- ✅ Validação de exportação CSV/PDF

### **NÃO use para:**
- ❌ Produção com clientes reais
- ❌ Simular pagamentos reais do Mercado Pago
- ❌ Estatísticas oficiais de vendas
- ❌ Relatórios financeiros reais

### **Identificação:**
- Todas as vendas de teste têm `link_code = 'TEST'`
- Fácil de filtrar ou deletar do banco
- Emails com prefixo `[TESTE]` no assunto

---

## 🎯 Casos de Uso

### **1. Testar Dashboard de Vendas**
```
1. Gere 50 vendas de teste
2. Acesse o dashboard admin
3. Visualize estatísticas atualizadas
4. Teste filtros por data
```

### **2. Validar Exportação CSV**
```
1. Gere 20 vendas variadas
2. Vá para aba "Vendas"
3. Clique em "Exportar CSV"
4. Abra no Excel/Google Sheets
5. Valide formato e dados
```

### **3. Testar Email Automático**
```
1. Marque "Enviar emails de teste"
2. Gere 1-3 vendas (não muitas!)
3. Emails vão para endereços falsos
4. Verifique logs do Resend
```

### **4. Demonstração para Clientes**
```
1. Gere várias vendas de cursos diferentes
2. Mostre dashboard com dados realistas
3. Demonstre exportação de relatórios
4. Delete depois: DELETE FROM sales WHERE link_code = 'TEST'
```

---

## 🔧 Comandos Úteis

### **Limpar Vendas de Teste (Local)**
```bash
# Via D1 local
cd /home/user/webapp
npx wrangler d1 execute vemgo --local --command="DELETE FROM sales WHERE link_code = 'TEST'"
```

### **Limpar Vendas de Teste (Produção)**
```bash
# Via D1 remoto
cd /home/user/webapp
CLOUDFLARE_API_TOKEN="..." npx wrangler d1 execute vemgo --remote --command="DELETE FROM sales WHERE link_code = 'TEST'"
```

### **Contar Vendas de Teste**
```bash
# Local
npx wrangler d1 execute vemgo --local --command="SELECT COUNT(*) FROM sales WHERE link_code = 'TEST'"

# Produção
CLOUDFLARE_API_TOKEN="..." npx wrangler d1 execute vemgo --remote --command="SELECT COUNT(*) FROM sales WHERE link_code = 'TEST'"
```

---

## 🚀 Exemplos de Uso

### **Exemplo 1: 5 Vendas do Curso de TikTok**
```bash
curl -X POST https://vemgo.pages.dev/api/test-sales \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 3,
    "quantity": 5,
    "send_email": false
  }'
```

### **Exemplo 2: 1 Venda com Email**
```bash
curl -X POST https://vemgo.pages.dev/api/test-sales \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "quantity": 1,
    "send_email": true
  }'
```

### **Exemplo 3: 100 Vendas (Máximo)**
```bash
curl -X POST https://vemgo.pages.dev/api/test-sales \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 2,
    "quantity": 100,
    "send_email": false
  }'
```

---

## 📋 IDs dos Cursos

| ID | Curso | Preço |
|----|-------|-------|
| 1 | Curso de Marketing Digital | R$ 197,00 |
| 2 | Curso de Desenvolvimento Web | R$ 297,00 |
| 3 | Desvende a Renda Extra no TikTok | R$ 97,00 |

---

## 🔍 Verificação de Vendas

### **Via Dashboard Admin:**
```
1. Acesse: https://vemgo.pages.dev/admin
2. Clique na aba "Vendas"
3. Vendas de teste aparecem com link_code = "TEST"
```

### **Via API:**
```bash
curl https://vemgo.pages.dev/api/sales
```

### **Via SQL Direto:**
```sql
SELECT 
  customer_name,
  customer_email,
  course_id,
  amount,
  status,
  link_code,
  purchased_at
FROM sales 
WHERE link_code = 'TEST'
ORDER BY purchased_at DESC
LIMIT 10;
```

---

## 📈 Estatísticas Afetadas

**O que é atualizado com vendas de teste:**
- ✅ Total de vendas
- ✅ Receita total
- ✅ Vendas por status
- ✅ Exportação CSV/PDF
- ✅ Gráficos de dashboard

**O que NÃO é afetado:**
- ❌ Pagamentos reais no Mercado Pago
- ❌ Extrato bancário
- ❌ Emails reais de clientes (usam @email.com falso)
- ❌ PDFs reais entregues (a menos que marque send_email)

---

## ⚡ Performance

### **Velocidade:**
- 1 venda: ~50ms
- 10 vendas: ~300ms
- 100 vendas: ~2-3s

### **Limites:**
- Máximo: 100 vendas por requisição
- Sem throttling (use com moderação)
- Banco D1: suporta milhares de vendas

---

## 🎨 Interface Visual

### **Features da Página /test-sales:**
- ✅ Seleção de curso via dropdown
- ✅ Input de quantidade (1-100)
- ✅ Checkbox para enviar emails
- ✅ Mensagem de sucesso com estatísticas
- ✅ Links rápidos para Dashboard e Home
- ✅ Design responsivo (mobile-friendly)
- ✅ Ícones FontAwesome
- ✅ TailwindCSS styling

---

## 🔐 Segurança

### **Endpoint Público:**
- ⚠️ Endpoint `/api/test-sales` é público
- ⚠️ Qualquer pessoa pode criar vendas de teste
- ⚠️ Recomendado apenas para sandbox/desenvolvimento

### **Para Produção:**
Adicione autenticação:
```typescript
app.post('/api/test-sales', async (c) => {
  const apiKey = c.req.header('X-API-Key')
  if (apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: 'Não autorizado' }, 401)
  }
  // ... resto do código
})
```

---

## 📝 Changelog

### **v1.0 - 13/03/2026**
- ✅ Endpoint POST /api/test-sales criado
- ✅ Interface visual /test-sales implementada
- ✅ Geração de dados brasileiros realistas
- ✅ Suporte para envio de emails (opcional)
- ✅ Documentação completa

---

## 🔗 Links Úteis

- **Página de Teste:** https://vemgo.pages.dev/test-sales
- **Dashboard Admin:** https://vemgo.pages.dev/admin
- **API Cursos:** https://vemgo.pages.dev/api/courses
- **API Vendas:** https://vemgo.pages.dev/api/sales
- **Home:** https://vemgo.pages.dev/

---

## 📞 Próximos Passos

Depois de testar o sistema com vendas falsas:

1. **Limpe as vendas de teste**
   ```sql
   DELETE FROM sales WHERE link_code = 'TEST';
   ```

2. **Configure Mercado Pago para produção**
   - Substitua credenciais de teste por produção
   - Teste com cartão real (sem cartão de teste)

3. **Desative o endpoint em produção** (opcional)
   ```typescript
   // Comentar ou remover endpoint /api/test-sales
   ```

4. **Use vendas reais** com clientes verdadeiros

---

## ✅ Checklist de Uso

- [ ] Gerei vendas de teste via /test-sales
- [ ] Visualizei no dashboard admin
- [ ] Testei exportação CSV
- [ ] Testei exportação PDF
- [ ] Verifiquei filtros por data
- [ ] Limpei vendas de teste antes da produção
- [ ] Sistema pronto para vendas reais

---

🎉 **Sistema de teste de vendas 100% funcional!**
