// 🚀 AUTO-CHECKOUT BEMPAGGO COM RECAPTCHA
// URL: https://pay.bempaggo.com.br/cmv360hgu
// ✅ Aguarda reCAPTCHA ser resolvido antes de enviar

(async function() {
    console.clear();
    console.log('%c🚀 VEMGO - Checkout com reCAPTCHA v3.0', 'font-size: 24px; font-weight: bold; color: #4CAF50;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');
    
    // ==========================================
    // 📋 DADOS DO PAGAMENTO - EDITE AQUI
    // ==========================================
    const DADOS = {
        nome: "GELCI JOSE DA SILVA",
        email: "gelci.jose.grouptrig@gmail.com",
        cpf: "12345678900",
        telefone: "11999999999",
        
        // Cartão
        numero: "4111111111111111",
        titular: "GELCI JOSE DA SILVA",
        mes: "12",
        ano: "2028",
        cvv: "123"
    };
    
    console.log('%c📝 Dados:', 'font-weight: bold; color: #2196F3;');
    console.table(DADOS);
    
    // ==========================================
    // 🛠️ FUNÇÕES AUXILIARES
    // ==========================================
    
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    function preencher(seletor, valor) {
        const el = document.querySelector(seletor);
        if (!el) return false;
        
        el.focus();
        el.value = valor;
        
        // Disparar eventos
        ['input', 'change', 'blur', 'keyup'].forEach(evt => {
            el.dispatchEvent(new Event(evt, { bubbles: true }));
        });
        
        return true;
    }
    
    function encontrar(keywords) {
        for (const kw of keywords) {
            const el = document.querySelector(
                `input[name*="${kw}"], input[id*="${kw}"], input[placeholder*="${kw}"]`
            );
            if (el) return el;
        }
        
        // Buscar por placeholder
        const inputs = Array.from(document.querySelectorAll('input'));
        for (const input of inputs) {
            const placeholder = (input.placeholder || '').toLowerCase();
            const label = input.labels?.[0]?.textContent?.toLowerCase() || '';
            
            for (const kw of keywords) {
                if (placeholder.includes(kw.toLowerCase()) || label.includes(kw.toLowerCase())) {
                    return input;
                }
            }
        }
        
        return null;
    }
    
    // ==========================================
    // 🔍 VERIFICAR RECAPTCHA
    // ==========================================
    function getRecaptchaToken() {
        // Tentar pegar o token do reCAPTCHA
        const tokenInput = document.querySelector('[name="g-recaptcha-response"]');
        if (tokenInput && tokenInput.value) {
            return tokenInput.value;
        }
        
        // Tentar pelo grecaptcha global
        if (window.grecaptcha) {
            try {
                const response = window.grecaptcha.getResponse();
                if (response) return response;
            } catch (e) {
                console.warn('Erro ao obter token:', e);
            }
        }
        
        return null;
    }
    
    function isRecaptchaValid() {
        const token = getRecaptchaToken();
        return token && token.length > 100; // Token válido tem > 100 chars
    }
    
    // ==========================================
    // 📝 PASSO 1: PREENCHER CAMPOS
    // ==========================================
    console.log('\n%c📝 PASSO 1: Preenchendo campos...', 'font-weight: bold; color: #FF9800; font-size: 16px;');
    
    const campos = [
        { nome: 'nome', keywords: ['name', 'nome', 'cardholder'], valor: DADOS.nome },
        { nome: 'email', keywords: ['email', 'e-mail'], valor: DADOS.email },
        { nome: 'cpf', keywords: ['cpf', 'document'], valor: DADOS.cpf },
        { nome: 'telefone', keywords: ['phone', 'telefone', 'celular'], valor: DADOS.telefone },
        { nome: 'numero', keywords: ['number', 'card', 'cartao'], valor: DADOS.numero },
        { nome: 'titular', keywords: ['holder', 'titular'], valor: DADOS.titular },
        { nome: 'mes', keywords: ['month', 'mes', 'mm'], valor: DADOS.mes },
        { nome: 'ano', keywords: ['year', 'ano', 'yy'], valor: DADOS.ano },
        { nome: 'cvv', keywords: ['cvv', 'cvc', 'security'], valor: DADOS.cvv }
    ];
    
    let preenchidos = 0;
    for (const { nome, keywords, valor } of campos) {
        const el = encontrar(keywords);
        if (el) {
            el.focus();
            el.value = valor;
            
            ['input', 'change', 'blur'].forEach(evt => {
                el.dispatchEvent(new Event(evt, { bubbles: true }));
            });
            
            console.log(`%c✅ ${nome}: ${valor}`, 'color: #4CAF50;');
            preenchidos++;
            await sleep(150);
        } else {
            console.log(`%c⚠️ ${nome}: não encontrado`, 'color: #FF9800;');
        }
    }
    
    console.log(`\n%c✅ ${preenchidos}/${campos.length} campos preenchidos`, 'font-weight: bold; color: #4CAF50;');
    
    // ==========================================
    // 🔐 PASSO 2: AGUARDAR RECAPTCHA
    // ==========================================
    console.log('\n%c🔐 PASSO 2: Verificando reCAPTCHA...', 'font-weight: bold; color: #9C27B0; font-size: 16px;');
    
    if (!isRecaptchaValid()) {
        console.log('%c⚠️ reCAPTCHA não está válido!', 'color: #FF9800; font-size: 14px;');
        console.log('%c👉 CLIQUE NA CHECKBOX "Não sou um robô"', 'color: #F44336; font-size: 18px; font-weight: bold;');
        console.log('\n%c⏳ Aguardando você resolver o reCAPTCHA...', 'color: #2196F3;');
        
        // Monitorar reCAPTCHA
        let tentativas = 0;
        const maxTentativas = 60; // 60 segundos
        
        while (!isRecaptchaValid() && tentativas < maxTentativas) {
            await sleep(1000);
            tentativas++;
            
            if (tentativas % 5 === 0) {
                console.log(`%c⏳ Aguardando... (${tentativas}s)`, 'color: #2196F3;');
            }
            
            if (isRecaptchaValid()) {
                console.log('%c✅ reCAPTCHA resolvido!', 'font-weight: bold; color: #4CAF50; font-size: 16px;');
                const token = getRecaptchaToken();
                console.log(`%c🔑 Token: ${token.substring(0, 50)}...`, 'color: #888;');
                break;
            }
        }
        
        if (!isRecaptchaValid()) {
            console.log('%c❌ Timeout! reCAPTCHA não foi resolvido.', 'color: #F44336; font-size: 16px;');
            console.log('%c👉 Resolva o reCAPTCHA e execute novamente.', 'color: #FF9800;');
            return;
        }
    } else {
        console.log('%c✅ reCAPTCHA já está válido!', 'color: #4CAF50; font-weight: bold;');
        const token = getRecaptchaToken();
        console.log(`%c🔑 Token: ${token.substring(0, 50)}...`, 'color: #888;');
    }
    
    // ==========================================
    // 🚀 PASSO 3: ENVIAR PAGAMENTO
    // ==========================================
    console.log('\n%c🚀 PASSO 3: Enviando pagamento...', 'font-weight: bold; color: #FF5722; font-size: 16px;');
    
    await sleep(1000);
    
    // Procurar botão de pagamento
    const botoes = Array.from(document.querySelectorAll('button, input[type="submit"]'));
    const botaoPagar = botoes.find(btn => {
        const texto = (btn.textContent || btn.value || '').toLowerCase();
        return ['pagar', 'pay', 'finalizar', 'confirmar', 'concluir'].some(kw => texto.includes(kw));
    });
    
    if (botaoPagar) {
        console.log(`%c✅ Botão encontrado: "${botaoPagar.textContent || botaoPagar.value}"`, 'color: #4CAF50;');
        console.log('%c💳 Clicando...', 'font-weight: bold; color: #FF5722;');
        
        botaoPagar.click();
        
        console.log('\n%c✅ PAGAMENTO ENVIADO!', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
        console.log('%c⏳ Aguardando resposta...', 'color: #2196F3;');
        
        // Monitorar resultado
        setTimeout(() => {
            const sucesso = document.querySelector('.success, .approved, [class*="success"], [class*="approved"]');
            const erro = document.querySelector('.error, .denied, [class*="error"], [class*="denied"]');
            
            if (sucesso) {
                console.log('%c🎉 PAGAMENTO APROVADO!', 'font-size: 24px; font-weight: bold; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
            } else if (erro) {
                console.log('%c❌ PAGAMENTO RECUSADO', 'font-size: 20px; font-weight: bold; color: #F44336;');
                console.log('Motivo:', erro.textContent);
            }
        }, 5000);
        
    } else {
        console.log('%c❌ Botão de pagamento não encontrado!', 'color: #F44336; font-weight: bold;');
        console.log('\n%c🔍 Botões disponíveis:', 'font-weight: bold;');
        botoes.forEach((btn, i) => {
            console.log(`${i + 1}. "${btn.textContent?.trim() || btn.value}"`);
        });
    }
    
    // ==========================================
    // 📊 RELATÓRIO FINAL
    // ==========================================
    console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #888;');
    console.log('%c📊 RELATÓRIO', 'font-size: 18px; font-weight: bold; color: #9C27B0;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');
    console.log(`✅ Campos preenchidos: ${preenchidos}/${campos.length}`);
    console.log(`🔐 reCAPTCHA: ${isRecaptchaValid() ? '✅ Válido' : '❌ Inválido'}`);
    console.log(`🎯 Pagamento: ${botaoPagar ? '✅ Enviado' : '❌ Não enviado'}`);
    
})();

// ==========================================
// 💡 INSTRUÇÕES
// ==========================================
console.log('\n%c💡 COMO USAR:', 'font-weight: bold; font-size: 14px; color: #2196F3;');
console.log('1. Cole este script no console');
console.log('2. Pressione Enter');
console.log('3. Aguarde os campos serem preenchidos');
console.log('4. RESOLVA O RECAPTCHA (clique em "Não sou um robô")');
console.log('5. O script vai enviar automaticamente!');
console.log('\n%c⚠️ IMPORTANTE: Você PRECISA resolver o reCAPTCHA manualmente!', 'color: #F44336; font-weight: bold; font-size: 14px;');
