# 🎯 SCRIPT DE CONSOLE: ENVIAR COBRANÇA VIA BEMPAGGO

## 📋 Objetivo
Enviar cobrança diretamente pelo console do navegador, sem depender da interface.

---

## 🚀 Script para Colar no Console

### Versão 1: Cobrança Simples (Dados Manuais)
```javascript
// 🎯 ENVIAR COBRANÇA VIA BEMPAGGO - CONSOLE
(async function() {
    console.log('🚀 Iniciando cobrança via BemPaggo...');
    
    // 📋 DADOS DA COBRANÇA (EDITE AQUI)
    const cobranca = {
        amount: {
            cents: 4990,  // R$ 49.90 (em centavos)
            currency: "BRL"
        },
        customer: {
            name: "GELCI JOSE DA SILVA",
            email: "gelci.jose.grouptrig@gmail.com",
            cpf: "12345678900"  // CPF do cliente
        },
        product: {
            name: "Conceitos de Redes Sociais e Organização",
            description: "Curso completo"
        },
        payment_method: "credit_card",  // ou "pix"
        installments: 1
    };
    
    // 🔑 CONFIGURAÇÃO DA API
    const API_URL = 'https://api.bempaggo.com.br/v1/charges';
    const API_TOKEN = 'SEU_TOKEN_AQUI';  // ⚠️ OBTENHA NO PAINEL BEMPAGGO
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(cobranca)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Cobrança criada com sucesso!');
            console.log('📄 Dados:', result);
            console.log('🔗 Link de pagamento:', result.payment_url);
        } else {
            console.error('❌ Erro ao criar cobrança:', result);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
})();
```

---

### Versão 2: Capturar Dados da Página Atual
```javascript
// 🎯 CAPTURAR DADOS E ENVIAR COBRANÇA
(async function() {
    console.log('🔍 Capturando dados da página...');
    
    // 📋 CAPTURAR DADOS DO OBJETO BEMPAGGO NA PÁGINA
    const bempaggoData = window.__BEMPAGGO_DATA__ || {};
    
    const amount = bempaggoData.installments?.[0]?.amount?.cents || 4990;
    
    console.log('💰 Valor capturado:', amount / 100, 'BRL');
    
    // 🔑 CONFIGURAÇÃO
    const API_URL = 'https://api.bempaggo.com.br/v1/charges';
    const API_TOKEN = 'SEU_TOKEN_AQUI';
    
    const payload = {
        amount: {
            cents: amount,
            currency: "BRL"
        },
        customer: {
            name: document.querySelector('[name="customer_name"]')?.value || "Cliente",
            email: document.querySelector('[name="customer_email"]')?.value || "email@exemplo.com",
            cpf: document.querySelector('[name="customer_cpf"]')?.value || ""
        },
        payment_method: "credit_card",
        installments: 1
    };
    
    console.log('📦 Payload:', payload);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Sucesso!', result);
        } else {
            console.error('❌ Erro:', result);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
})();
```

---

### Versão 3: Debugar Dados Disponíveis
```javascript
// 🔍 VER TODOS OS DADOS DISPONÍVEIS NA PÁGINA
console.log('🔍 Inspecionando dados BemPaggo...');

// Verificar objetos globais
console.log('window.__BEMPAGGO_DATA__:', window.__BEMPAGGO_DATA__);
console.log('window.bempaggo:', window.bempaggo);

// Verificar formulários
const forms = document.querySelectorAll('form');
console.log('📋 Formulários encontrados:', forms.length);

forms.forEach((form, index) => {
    console.log(`\nFormulário ${index + 1}:`);
    const formData = new FormData(form);
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
    }
});

// Verificar inputs
const inputs = document.querySelectorAll('input, select, textarea');
console.log('\n📝 Inputs encontrados:', inputs.length);

inputs.forEach(input => {
    if (input.name || input.id) {
        console.log(`  ${input.name || input.id}: ${input.value}`);
    }
});

// Verificar localStorage
console.log('\n💾 localStorage:', {...localStorage});
console.log('💾 sessionStorage:', {...sessionStorage});
```

---

## 🎯 Versão Otimizada: Integrar com Seu Backend

```javascript
// 🚀 ENVIAR COBRANÇA VIA SEU BACKEND (VEMGO)
(async function() {
    console.log('🚀 Enviando cobrança via backend Vemgo...');
    
    const dados = {
        customer_name: "GELCI JOSE DA SILVA",
        customer_email: "gelci.jose.grouptrig@gmail.com",
        customer_cpf: "12345678900",
        customer_phone: "11999999999",
        card_number: "4111111111111111",
        card_holder_name: "GELCI JOSE DA SILVA",
        card_expiry_month: "12",
        card_expiry_year: "2028",
        card_cvv: "123",
        link_code: "SEU_LINK_CODE"  // Código do link de pagamento
    };
    
    try {
        const response = await fetch('https://kncursos.com.br/api/checkout/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Pagamento aprovado!');
            console.log('🎟️ Token de acesso:', result.access_token);
            console.log('🔗 Link de download:', result.download_url);
            console.log('💳 Payment ID:', result.payment_id);
        } else {
            console.error('❌ Pagamento recusado:', result.error);
            console.log('📋 Detalhes:', result.details);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
})();
```

---

## 📖 Como Usar

### 1️⃣ Abrir Console
- **Chrome/Edge**: `F12` → aba "Console"
- **Firefox**: `F12` → aba "Console"
- **Safari**: `Cmd + Option + C`

### 2️⃣ Colar o Script
Escolha uma das versões acima e cole no console

### 3️⃣ Editar Dados
Modifique os valores conforme necessário:
```javascript
customer_name: "NOME DO CLIENTE",
customer_email: "email@cliente.com",
card_number: "4111111111111111",
// ...
```

### 4️⃣ Executar
Pressione **Enter**

---

## 🔐 Obter Token BemPaggo

Se for usar a API direta do BemPaggo:

1. Acesse: https://painel.bempaggo.com.br
2. Vá em: **Configurações** → **API**
3. Copie seu **API Token**
4. Cole no script na linha:
   ```javascript
   const API_TOKEN = 'SEU_TOKEN_AQUI';
   ```

---

## 🎯 Qual Versão Usar?

| Versão | Uso | Vantagem |
|--------|-----|----------|
| **Versão 1** | Dados manuais | Controle total |
| **Versão 2** | Captura da página | Automático |
| **Versão 3** | Debug | Ver dados disponíveis |
| **Versão 4** | Via backend Vemgo | Usa sua API |

---

## 🧪 Exemplo de Resposta

### Sucesso ✅
```json
{
  "success": true,
  "payment_id": "12345678",
  "access_token": "abc123xyz789",
  "download_url": "https://kncursos.com.br/download/abc123xyz789",
  "gateway": "bempaggo"
}
```

### Erro ❌
```json
{
  "error": "Cartão recusado",
  "details": "insufficient_funds",
  "payment_id": "12345678"
}
```

---

## 🎁 Bônus: Versão com UI no Console

```javascript
// 🎨 VERSÃO COM INTERFACE NO CONSOLE
console.clear();
console.log('%c🚀 VEMGO - Processador de Pagamentos', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
console.log('%c═══════════════════════════════════════', 'color: #888;');

const processar = async (dados) => {
    console.log('%c📦 Processando pagamento...', 'color: #2196F3; font-weight: bold;');
    
    try {
        const response = await fetch('https://kncursos.com.br/api/checkout/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('%c✅ PAGAMENTO APROVADO!', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
            console.table({
                'Token de Acesso': result.access_token,
                'Payment ID': result.payment_id,
                'Gateway': result.gateway,
                'Link de Download': result.download_url
            });
        } else {
            console.log('%c❌ PAGAMENTO RECUSADO', 'font-size: 16px; color: #F44336; font-weight: bold;');
            console.error('Erro:', result.error);
            console.log('Detalhes:', result.details);
        }
        
    } catch (error) {
        console.log('%c❌ ERRO NA REQUISIÇÃO', 'font-size: 16px; color: #F44336; font-weight: bold;');
        console.error(error);
    }
};

// 🎯 USO:
console.log('\n%c📝 Como usar:', 'font-weight: bold;');
console.log('processar({ customer_name: "Nome", customer_email: "email@exemplo.com", ... });');
console.log('\n%cExpondo função globalmente...', 'color: #888;');
window.processarPagamento = processar;
console.log('%c✅ Use: processarPagamento({dados})', 'color: #4CAF50; font-weight: bold;');
```

---

## 🎯 Resultado

Qual versão você prefere? Posso adaptar para suas necessidades específicas! 🚀
