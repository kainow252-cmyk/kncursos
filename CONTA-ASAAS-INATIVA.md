# 🚨 Conta Asaas de Produção INATIVA

## Problema Identificado

**Status:** A conta Asaas de **PRODUÇÃO está INATIVA**

### Sintomas
```bash
# Teste no Sandbox:
HTTP 401 - "A chave de API informada não pertence a este ambiente"

# Teste na Produção:
HTTP 404 - Sem resposta (conta inativa)
```

### Causa
A chave gerada é **VÁLIDA e de PRODUÇÃO**, mas a conta não foi ativada ainda.

---

## 🔍 Por que a conta está inativa?

O Asaas requer **aprovação manual** para contas de produção:

### Requisitos para Ativação:
1. ✅ **Dados cadastrais completos**
   - Nome completo / Razão social
   - CPF / CNPJ
   - Endereço completo
   - Telefone e email

2. ✅ **Documentos enviados**
   - RG ou CNH (frente e verso)
   - CPF
   - Comprovante de endereço (até 90 dias)
   - Contrato social (para empresas)

3. ✅ **Dados bancários**
   - Conta para recebimento
   - Dados do titular da conta

4. ✅ **Aceite dos termos**
   - Termos de uso de produção
   - Política de privacidade

5. ⏳ **Aprovação da equipe Asaas**
   - Análise manual: 1-2 dias úteis
   - Notificação por email

---

## ✅ SOLUÇÃO IMEDIATA: Usar Sandbox

Enquanto aguarda aprovação da conta de produção, use o **ambiente de testes**:

### Vantagens do Sandbox:
- ✅ Funciona EXATAMENTE igual à produção
- ✅ Testa todo o fluxo de pagamento
- ✅ Valida emails, downloads, admin
- ✅ Não precisa aprovação
- ✅ Usa cartão de teste (sem cobranças reais)

### Como configurar Sandbox:

#### 1. Gerar chave de Sandbox

```
1. Acesse: https://www.asaas.com
2. Menu: Integrações → API Key → Chaves API
3. Clique: "Gerar nova chave"
4. Selecione: "Sandbox" (NÃO "Produção")
5. Copie a chave (começa com $aact_)
```

**Formato da chave Sandbox:**
```
$aact_YWJjMTIzZGVmNDU2...
```

**Diferenças:**
- Produção: `$aact_prod_...` (166 caracteres)
- Sandbox: `$aact_...` (sem `_prod_`) (~140 caracteres)

#### 2. Configurar no sistema

Depois de gerar a chave de Sandbox, me envie e eu configuro:

```bash
# Atualizar variáveis de ambiente:
ASAAS_API_KEY=<CHAVE_SANDBOX>
ASAAS_ENV=sandbox  # ← Mudar de "production" para "sandbox"
```

#### 3. Testar pagamentos

**Cartão de teste do Asaas:**
```
Número: 5162 3062 1937 8829
Titular: MARCELO H ALMEIDA
Validade: 05/2025
CVV: 318
```

**Resultado esperado:**
- ✅ Pagamento aprovado
- ✅ Email recebido
- ✅ Download do PDF funciona
- ✅ Venda aparece no admin

---

## 🚀 Ativar Conta de PRODUÇÃO

### Passo a Passo:

#### 1. Acesse o painel Asaas
```
URL: https://www.asaas.com
Login: Suas credenciais
```

#### 2. Verificar status da conta

No **topo da tela** você verá um banner:
```
⚠️ Sua conta está em modo Sandbox
Complete o cadastro para ativar Produção
```

Clique em **"Completar cadastro"**

#### 3. Preencher dados solicitados

Menu: **Configurações → Dados da conta**

**Dados pessoais/empresariais:**
- Nome completo ou Razão social
- CPF ou CNPJ
- Data de nascimento / Data de abertura
- Endereço completo (CEP, rua, número, complemento, bairro, cidade, estado)
- Telefone celular
- Email

**Upload de documentos:**
- RG ou CNH (frente e verso) - PDF ou imagem clara
- Comprovante de CPF
- Comprovante de endereço (luz, água, telefone) - até 90 dias
- Contrato social (para CNPJ)

**Dados bancários:**
- Banco
- Agência
- Conta (com dígito)
- Tipo de conta (corrente ou poupança)
- Nome do titular
- CPF/CNPJ do titular

**Aceite dos termos:**
- ✅ Li e aceito os Termos de Uso
- ✅ Li e aceito a Política de Privacidade

#### 4. Enviar para análise

Clique em **"Enviar para análise"**

#### 5. Aguardar aprovação

**Prazo:** 1-2 dias úteis
**Notificação:** Email quando aprovado
**Status:** Acompanhe em "Configurações → Status da conta"

#### 6. Após aprovação

Você receberá um email:
```
✅ Sua conta foi aprovada!
Agora você pode usar o Asaas em produção.
```

Então:
1. Gere uma nova chave de **Produção**
2. Atualize no sistema
3. Mude `ASAAS_ENV` de `sandbox` para `production`
4. Faça deploy

---

## 📊 Comparação: Sandbox vs Produção

| Recurso | Sandbox | Produção |
|---------|---------|----------|
| **Aprovação** | Não precisa | Precisa (1-2 dias) |
| **Pagamentos** | Teste (fake) | Reais (cobrados) |
| **Cartão** | Teste fixo | Cartões reais |
| **Recebimento** | Simulado | Cai na conta |
| **Taxa** | R$ 0,00 | Conforme plano |
| **Funcionalidades** | 100% iguais | 100% iguais |
| **API** | sandbox.asaas.com | api.asaas.com |
| **Chave** | `$aact_...` | `$aact_prod_...` |

---

## 🆘 Problemas Comuns

### "Não vejo o banner de ativação"

**Solução:**
1. Clique no ícone do perfil (topo direito)
2. "Configurações" → "Dados da conta"
3. Procure por "Ambiente: Sandbox" ou "Modo de teste"

### "Enviei documentos mas foi rejeitado"

**Motivos comuns:**
- Documento ilegível ou cortado
- Comprovante de endereço vencido (>90 dias)
- Nome no documento diferente do cadastrado
- Documento estrangeiro sem tradução

**Solução:**
- Tire foto/escaneie em alta resolução
- Certifique-se que todos os dados estão legíveis
- Use comprovante recente
- Entre em contato com suporte para esclarecimentos

### "Quanto tempo demora a aprovação?"

**Prazo normal:** 1-2 dias úteis
**Prazo máximo:** 5 dias úteis

Se passar de 5 dias:
- Entre em contato com suporte Asaas
- Email: suporte@asaas.com
- Telefone: (47) 3433-2909
- Chat no painel (após login)

---

## 📞 Contatos Asaas

### Suporte Técnico
- **Email:** suporte@asaas.com
- **Telefone:** (47) 3433-2909
- **Horário:** Segunda a sexta, 8h às 18h
- **Chat:** Disponível no painel

### Documentação
- **API:** https://docs.asaas.com
- **FAQs:** https://www.asaas.com/ajuda

### Redes Sociais
- **Instagram:** @asaaspagamentos
- **Facebook:** /asaaspagamentos

---

## ✅ Status Atual do Sistema

**Chave configurada:**
```
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjMyMzkyMWZjLTRkMjktNGIwMC04MDk3LWVmZmM4NzU0M2ZiMzo6JGFhY2hfMmI2OWFjNGUtODVmZC00OTNjLWIyNzQtYmE0MDdhZGQ1YmNj
```

**Status:** ✅ Chave VÁLIDA, mas conta de produção INATIVA

**Próximos passos:**
1. [ ] Gerar chave de Sandbox
2. [ ] Configurar sistema para Sandbox
3. [ ] Testar pagamentos com cartão de teste
4. [ ] Ativar conta de produção no Asaas
5. [ ] Aguardar aprovação (1-2 dias)
6. [ ] Trocar para chave de produção
7. [ ] Sistema 100% operacional em produção

---

**Documento criado em:** 14/03/2026 13:50 UTC  
**Status:** ⏳ Aguardando ativação da conta de produção OU uso de Sandbox
