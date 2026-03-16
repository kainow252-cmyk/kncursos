# 🚀 AUTO-CHECKOUT BEMPAGGO - SCRIPTS DE CONSOLE

Automatize o preenchimento e envio de pagamentos na página pública do BemPaggo.

**URL de Teste**: https://pay.bempaggo.com.br/cmv360hgu

---

## 📦 Versões Disponíveis

### 1️⃣ Versão Completa (Recomendada)
**Arquivo**: `AUTO_CHECKOUT_BEMPAGGO_V2.js`

✅ Inspeciona toda a página
✅ Detecta automaticamente os campos
✅ Logs detalhados no console
✅ Relatório completo de execução

**Tamanho**: ~10KB

---

### 2️⃣ Versão Compacta
**Arquivo**: `AUTO_CHECKOUT_MINI.js`

✅ Código minificado
✅ Rápido de colar
✅ Funcionalidade essencial

**Tamanho**: ~2KB

---

### 3️⃣ Versão Básica
**Arquivo**: `SCRIPT_CHECKOUT_BEMPAGGO.js`

✅ Código legível
✅ Fácil de editar
✅ Comentários explicativos

**Tamanho**: ~6KB

---

## 🎯 Como Usar

### Passo 1: Abrir a Página
Acesse: https://pay.bempaggo.com.br/cmv360hgu

### Passo 2: Abrir Console
- **Windows/Linux**: `F12` ou `Ctrl + Shift + J`
- **Mac**: `Cmd + Option + J`

### Passo 3: Colar o Script
Copie o conteúdo de um dos arquivos `.js` e cole no console

### Passo 4: Editar Dados (Opcional)
Antes de executar, edite os dados do cliente no início do script:

```javascript
const DADOS_PAGAMENTO = {
    nome_titular: "SEU NOME AQUI",
    email: "seu@email.com",
    cpf: "12345678900",
    numero_cartao: "4111111111111111",
    nome_cartao: "NOME NO CARTAO",
    mes_validade: "12",
    ano_validade: "2028",
    cvv: "123"
};
```

### Passo 5: Executar
Pressione **Enter** e aguarde!

---

## 📊 O Que o Script Faz

### 1. Inspeção 🔍
- Varre todos os inputs da página
- Identifica campos por `name`, `id`, `placeholder`
- Mapeia a estrutura do formulário

### 2. Preenchimento 📝
- Preenche automaticamente:
  - Nome
  - Email
  - CPF
  - Número do cartão
  - Nome no cartão
  - Validade (mês/ano)
  - CVV
  - Endereço (se necessário)

### 3. Envio 🚀
- Localiza o botão de pagamento
- Clica automaticamente
- Monitora a resposta

### 4. Feedback ✅
- Logs coloridos no console
- Tabela com dados preenchidos
- Relatório de execução
- Status do pagamento

---

## 🎨 Exemplo de Saída no Console

```
🚀 VEMGO - Auto Checkout BemPaggo v2.0
═══════════════════════════════════════════════════════════

📝 Dados Carregados:
┌─────────────────┬──────────────────────────┐
│ nome_titular    │ GELCI JOSE DA SILVA      │
│ email           │ gelci.jose@email.com     │
│ cpf             │ 12345678900              │
│ numero_cartao   │ 4111111111111111         │
│ cvv             │ 123                      │
└─────────────────┴──────────────────────────┘

🔍 PASSO 1: Inspecionando página...
📊 Total de campos encontrados: 12

📝 PASSO 2: Preenchendo campos...
✅ nome_titular: GELCI JOSE DA SILVA
✅ email: gelci.jose@email.com
✅ cpf: 12345678900
✅ numero_cartao: 4111111111111111
✅ mes_validade: 12
✅ ano_validade: 2028
✅ cvv: 123

📊 Resumo: 7 campos preenchidos

🎯 PASSO 3: Procurando botão de pagamento...
✅ Botão encontrado: "PAGAR COM CARTÃO"

💳 Clicando no botão de pagamento...

✅ PAGAMENTO ENVIADO!
⏳ Aguardando resposta do servidor...

🎉 PAGAMENTO APROVADO!

═══════════════════════════════════════════════════════════
📊 RELATÓRIO FINAL
═══════════════════════════════════════════════════════════
✅ Campos preenchidos: 7
⚠️ Campos não encontrados: 0
🎯 Botão de pagamento: ✅ Encontrado e clicado

🎉 Script executado com sucesso!
```

---

## 🛡️ Segurança

### ⚠️ IMPORTANTE
- **Nunca** compartilhe dados de cartão reais em scripts públicos
- Use apenas em ambiente de **TESTE**
- Para produção, use a **API oficial** do BemPaggo
- Este script é para **automação de testes**

### 🔒 Dados Sensíveis
Os dados ficam **apenas no seu navegador**:
- ✅ Não são enviados para terceiros
- ✅ Não são salvos em nenhum servidor
- ✅ São processados localmente no console

---

## 🧪 Cartões de Teste

Use estes cartões para testar (BemPaggo):

| Bandeira | Número | CVV | Resultado |
|----------|--------|-----|-----------|
| Visa | `4111111111111111` | `123` | ✅ Aprovado |
| Mastercard | `5555555555554444` | `123` | ✅ Aprovado |
| Visa | `4000000000000010` | `123` | ❌ Recusado |
| Mastercard | `5555555555554477` | `123` | ⏳ Pendente |

**Validade**: Qualquer data futura (ex: 12/2028)

---

## 🔧 Personalização

### Adicionar Mais Campos
Edite o array `mapeamento`:

```javascript
const mapeamento = [
    { campo: 'seu_campo', keywords: ['palavra1', 'palavra2'] },
    // ...
];
```

### Mudar Delay Entre Campos
```javascript
await sleep(100); // 100ms entre cada campo
```

### Desabilitar Auto-Envio
Comente a linha que clica no botão:

```javascript
// botaoPagar.click(); // ← comentar esta linha
```

---

## 📞 Suporte

### Problemas Comuns

#### 1. "Campo não encontrado"
**Causa**: O seletor do campo mudou

**Solução**: Inspecione a página (F12) e encontre o `name` ou `id` correto:
```javascript
document.querySelector('input[name="NOME_CORRETO"]')
```

#### 2. "Botão não encontrado"
**Causa**: O texto do botão é diferente

**Solução**: Adicione o texto correto no array `keywordsBotao`:
```javascript
const keywordsBotao = ['pagar', 'pay', 'seu_texto_aqui'];
```

#### 3. "Dados não preenchidos"
**Causa**: Campos protegidos ou iframes

**Solução**: Use a versão manual (preencha um por um):
```javascript
document.querySelector('#campo1').value = 'valor';
```

---

## 🎯 Casos de Uso

### 1. Testes Automatizados
Automatize testes de checkout sem Selenium/Puppeteer

### 2. Debug de Integração
Teste rapidamente diferentes cenários de pagamento

### 3. Demonstrações
Mostre o fluxo de pagamento sem dados reais

### 4. Desenvolvimento
Acelere testes durante desenvolvimento

---

## 📝 Changelog

### v2.0 (Atual)
- ✅ Detecção automática de campos
- ✅ Logs coloridos e detalhados
- ✅ Relatório final completo
- ✅ Suporte a múltiplos seletores

### v1.0
- ✅ Preenchimento básico
- ✅ Envio automático

---

## 📄 Licença

Uso livre para testes e desenvolvimento.

⚠️ **Não use em produção com dados reais sem autorização!**

---

## 🚀 Começar Agora

1. Escolha uma versão:
   - **Iniciante**: `SCRIPT_CHECKOUT_BEMPAGGO.js`
   - **Avançado**: `AUTO_CHECKOUT_BEMPAGGO_V2.js`
   - **Rápido**: `AUTO_CHECKOUT_MINI.js`

2. Abra: https://pay.bempaggo.com.br/cmv360hgu

3. Pressione `F12` → Cole o script → `Enter`

4. 🎉 Pronto!

---

**Desenvolvido para Vemgo** 🚀
