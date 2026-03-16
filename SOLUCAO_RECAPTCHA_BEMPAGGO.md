# 🔐 SOLUÇÃO: reCAPTCHA no BemPaggo

## ❌ Problema
```
Motivo: token recaptcha expirado ou inválido
```

O BemPaggo usa **reCAPTCHA v2** que requer interação humana para validar o pagamento.

---

## ✅ SOLUÇÕES

### 📌 Solução 1: Script com Espera Manual (RECOMENDADO)
**Arquivo**: `CHECKOUT_COM_RECAPTCHA.js`

Este script:
1. ✅ Preenche todos os campos
2. ⏸️ **PAUSA** e aguarda você resolver o reCAPTCHA
3. ✅ Detecta quando o reCAPTCHA é resolvido
4. 🚀 Envia automaticamente o pagamento

#### Como usar:
```javascript
// 1. Cole o script no console
// 2. Aguarde os campos serem preenchidos
// 3. CLIQUE em "Não sou um robô" ✅
// 4. O script continua automaticamente!
```

---

### 📌 Solução 2: Script com Tentativa Automática
**Arquivo**: `AUTO_RECAPTCHA_SOLVER.js`

Este script tenta resolver o reCAPTCHA automaticamente usando:
- ✅ Clique automático no checkbox
- ✅ Execução do `grecaptcha.execute()`
- ✅ Aguarda token ser gerado

⚠️ **Nota**: Pode não funcionar 100% devido às proteções do Google.

---

### 📌 Solução 3: API de Terceiros (PRODUÇÃO)

Para produção, use serviços que resolvem reCAPTCHA:

#### 2Captcha
```javascript
// 1. Obter chave do reCAPTCHA
const siteKey = '6LcUZUoqAAAAALa0MFlDwGKXHCqeF6IdixIGMaME';
const pageUrl = 'https://pay.bempaggo.com.br/cmv360hgu';

// 2. Enviar para 2Captcha
const response = await fetch('https://2captcha.com/in.php', {
    method: 'POST',
    body: new URLSearchParams({
        key: 'SUA_API_KEY_2CAPTCHA',
        method: 'userrecaptcha',
        googlekey: siteKey,
        pageurl: pageUrl
    })
});

const data = await response.text();
const taskId = data.split('|')[1];

// 3. Aguardar resolução (15-30 segundos)
await sleep(20000);

// 4. Obter token
const result = await fetch(`https://2captcha.com/res.php?key=SUA_API_KEY&action=get&id=${taskId}`);
const token = await result.text().split('|')[1];

// 5. Inserir token no formulário
document.querySelector('[name="g-recaptcha-response"]').value = token;

// 6. Enviar pagamento
document.querySelector('button[type="submit"]').click();
```

**Custo**: ~$1-2 por 1000 captchas

---

## 🎯 MELHOR ABORDAGEM: Integração Backend

Em vez de usar o checkout público do BemPaggo, integre diretamente com a **API do BemPaggo** no seu backend:

### 1️⃣ Criar Cobrança via API

```javascript
// Backend (Vemgo)
app.post('/api/checkout/bempaggo', async (req, res) => {
    const { customer, card, amount } = req.body;
    
    try {
        // Criar cobrança no BemPaggo
        const response = await axios.post('https://api.bempaggo.com.br/v1/charges', {
            amount: {
                cents: amount,
                currency: 'BRL'
            },
            customer: {
                name: customer.name,
                email: customer.email,
                cpf: customer.cpf
            },
            payment_method: 'credit_card',
            card: {
                number: card.number,
                holder_name: card.holder_name,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
                cvv: card.cvv
            }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.BEMPAGGO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.status === 'approved') {
            // Salvar no banco
            await salvarVenda({
                customer_email: customer.email,
                payment_id: response.data.id,
                status: 'completed',
                gateway: 'bempaggo'
            });
            
            // Enviar email
            await enviarEmail(customer.email, 'Pagamento aprovado!');
            
            res.json({
                success: true,
                payment_id: response.data.id
            });
        } else {
            res.json({
                success: false,
                error: response.data.status_detail
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### 2️⃣ Frontend (Vemgo)
```javascript
// Seu checkout Vemgo
async function processarPagamento(dados) {
    const response = await fetch('https://vemgo.com.br/api/checkout/bempaggo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert('✅ Pagamento aprovado!');
        window.location.href = `/download/${result.access_token}`;
    } else {
        alert(`❌ ${result.error}`);
    }
}
```

---

## 📊 Comparação de Soluções

| Solução | Vantagem | Desvantagem | Custo |
|---------|----------|-------------|-------|
| **Script Manual** | ✅ Simples, funciona sempre | ⏸️ Requer interação manual | Grátis |
| **Script Auto** | ⚡ Mais rápido | ❌ Pode falhar | Grátis |
| **2Captcha** | ✅ 100% automático | 💰 Pago | $1-2/1000 |
| **API Direta** | ✅ Sem reCAPTCHA, profissional | 🔧 Requer backend | Grátis (só taxas) |

---

## 🚀 RECOMENDAÇÃO FINAL

### Para Teste:
Use **Script com Espera Manual** (`CHECKOUT_COM_RECAPTCHA.js`)

### Para Produção:
Implemente **API Direta do BemPaggo** no backend Vemgo

---

## 🔧 Implementar API BemPaggo no Vemgo

Vou criar um novo endpoint no Vemgo que se conecta direto com a API do BemPaggo:

### 1. Adicionar Variável de Ambiente
```bash
# .env
BEMPAGGO_API_KEY=seu_token_aqui
BEMPAGGO_PUBLIC_KEY=sua_chave_publica_aqui
```

### 2. Criar Endpoint no Backend
```javascript
// src/index.tsx
app.post('/api/checkout/bempaggo-direct', async (c) => {
    const { customer, card, link_code } = await c.req.json();
    
    // Buscar link de pagamento
    const link = await c.env.DB.prepare(
        'SELECT * FROM payment_links WHERE link_code = ? AND status = "active"'
    ).bind(link_code).first();
    
    if (!link) {
        return c.json({ error: 'Link inválido' }, 404);
    }
    
    // Buscar curso
    const course = await c.env.DB.prepare(
        'SELECT * FROM courses WHERE id = ?'
    ).bind(link.course_id).first();
    
    try {
        // Criar cobrança no BemPaggo
        const response = await fetch('https://api.bempaggo.com.br/v1/charges', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.BEMPAGGO_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: {
                    cents: Math.round(link.price * 100),
                    currency: 'BRL'
                },
                customer: {
                    name: customer.name,
                    email: customer.email,
                    cpf: customer.cpf.replace(/\D/g, '')
                },
                payment_method: 'credit_card',
                card: {
                    number: card.number.replace(/\s/g, ''),
                    holder_name: card.holder_name,
                    exp_month: card.exp_month,
                    exp_year: card.exp_year,
                    cvv: card.cvv
                },
                metadata: {
                    platform: 'vemgo',
                    link_code: link_code,
                    course_id: course.id,
                    course_title: course.title
                }
            })
        });
        
        const chargeData = await response.json();
        
        if (chargeData.status === 'approved') {
            // Gerar token de acesso
            const access_token = crypto.randomUUID().replace(/-/g, '');
            
            // Salvar venda
            await c.env.DB.prepare(`
                INSERT INTO sales (
                    course_id, link_code, customer_name, customer_cpf, 
                    customer_email, amount, status, access_token, 
                    payment_id, gateway, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).bind(
                course.id,
                link_code,
                customer.name,
                customer.cpf,
                customer.email,
                link.price,
                'completed',
                access_token,
                chargeData.id,
                'bempaggo'
            ).run();
            
            // Enviar email
            await enviarEmailAprovacao(c, {
                customer_name: customer.name,
                customer_email: customer.email,
                course_title: course.title,
                amount: link.price,
                pdf_url: course.pdf_url,
                access_token
            });
            
            return c.json({
                success: true,
                access_token,
                download_url: `https://vemgo.com.br/download/${access_token}`,
                payment_id: chargeData.id
            });
        } else {
            return c.json({
                success: false,
                error: chargeData.status_detail || 'Pagamento não aprovado'
            });
        }
        
    } catch (error) {
        console.error('Erro BemPaggo:', error);
        return c.json({
            success: false,
            error: error.message
        }, 500);
    }
});
```

### 3. Frontend Vemgo
```javascript
// Criar página /checkout/bempaggo/:link_code
async function enviarPagamentoBempaggo() {
    const dados = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            cpf: document.getElementById('cpf').value
        },
        card: {
            number: document.getElementById('card_number').value,
            holder_name: document.getElementById('holder_name').value,
            exp_month: document.getElementById('exp_month').value,
            exp_year: document.getElementById('exp_year').value,
            cvv: document.getElementById('cvv').value
        },
        link_code: 'SEU_LINK_CODE'
    };
    
    const response = await fetch('/api/checkout/bempaggo-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    
    const result = await response.json();
    
    if (result.success) {
        window.location.href = result.download_url;
    } else {
        alert('Erro: ' + result.error);
    }
}
```

---

## 🎯 PRÓXIMOS PASSOS

Quer que eu:

1. ✅ **Implemente a API direta no Vemgo** (sem reCAPTCHA)
2. ⏸️ Use o script manual com espera
3. 🤖 Teste o script automático

**Recomendo a opção 1** - é profissional e resolve o problema definitivamente! 🚀
