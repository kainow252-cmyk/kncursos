// 🤖 AUTO-CHECKOUT COM RECAPTCHA AUTOMÁTICO
// ⚠️ Usa técnicas avançadas para resolver o reCAPTCHA

(async function() {
    console.clear();
    console.log('%c🤖 VEMGO - Auto reCAPTCHA Solver v4.0', 'font-size: 24px; font-weight: bold; color: #4CAF50;');
    
    // ==========================================
    // 📋 DADOS
    // ==========================================
    const DADOS = {
        nome: "GELCI JOSE DA SILVA",
        email: "gelci.jose.grouptrig@gmail.com",
        cpf: "12345678900",
        numero: "4111111111111111",
        titular: "GELCI JOSE DA SILVA",
        mes: "12",
        ano: "2028",
        cvv: "123"
    };
    
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    
    // ==========================================
    // 🔐 RESOLVER RECAPTCHA AUTOMATICAMENTE
    // ==========================================
    console.log('\n%c🔐 Resolvendo reCAPTCHA...', 'font-weight: bold; color: #9C27B0; font-size: 16px;');
    
    async function resolverRecaptcha() {
        // Método 1: Clicar no checkbox
        const checkbox = document.querySelector('.recaptcha-checkbox, #recaptcha-anchor');
        if (checkbox && !checkbox.classList.contains('recaptcha-checkbox-checked')) {
            console.log('%c👆 Clicando no checkbox...', 'color: #2196F3;');
            checkbox.click();
            await sleep(2000);
        }
        
        // Método 2: Executar grecaptcha
        if (window.grecaptcha) {
            console.log('%c🔑 Executando grecaptcha.execute()...', 'color: #2196F3;');
            try {
                const widgetId = 0; // Geralmente é 0
                await window.grecaptcha.execute(widgetId);
                await sleep(2000);
            } catch (e) {
                console.warn('Erro ao executar:', e);
            }
        }
        
        // Método 3: Aguardar token aparecer
        console.log('%c⏳ Aguardando token...', 'color: #2196F3;');
        for (let i = 0; i < 30; i++) {
            const token = document.querySelector('[name="g-recaptcha-response"]')?.value;
            if (token && token.length > 100) {
                console.log('%c✅ Token obtido!', 'color: #4CAF50; font-weight: bold;');
                console.log(`%c${token.substring(0, 50)}...`, 'color: #888;');
                return token;
            }
            await sleep(1000);
            
            if (i % 5 === 0) {
                console.log(`%c⏳ ${i}s...`, 'color: #888;');
            }
        }
        
        return null;
    }
    
    // ==========================================
    // 📝 PREENCHER CAMPOS
    // ==========================================
    console.log('\n%c📝 Preenchendo campos...', 'font-weight: bold; color: #FF9800;');
    
    const preencher = (seletor, valor) => {
        const el = document.querySelector(seletor);
        if (!el) return false;
        el.focus();
        el.value = valor;
        ['input', 'change'].forEach(e => el.dispatchEvent(new Event(e, {bubbles: true})));
        return true;
    };
    
    const campos = [
        ['input[name*="name"], input[placeholder*="Nome"]', DADOS.nome],
        ['input[type="email"]', DADOS.email],
        ['input[name*="cpf"]', DADOS.cpf],
        ['input[name*="number"], input[placeholder*="Número"]', DADOS.numero],
        ['input[name*="holder"]', DADOS.titular],
        ['input[name*="month"], input[placeholder*="Mês"]', DADOS.mes],
        ['input[name*="year"], input[placeholder*="Ano"]', DADOS.ano],
        ['input[name*="cvv"]', DADOS.cvv]
    ];
    
    for (const [seletor, valor] of campos) {
        if (preencher(seletor, valor)) {
            console.log(`%c✅ ${valor}`, 'color: #4CAF50;');
            await sleep(100);
        }
    }
    
    // ==========================================
    // 🚀 RESOLVER E ENVIAR
    // ==========================================
    const token = await resolverRecaptcha();
    
    if (!token) {
        console.log('%c❌ Não consegui resolver o reCAPTCHA', 'color: #F44336; font-weight: bold; font-size: 16px;');
        console.log('%c👉 Resolva manualmente e execute novamente', 'color: #FF9800;');
        return;
    }
    
    console.log('\n%c🚀 Enviando pagamento...', 'font-weight: bold; color: #FF5722; font-size: 16px;');
    await sleep(1000);
    
    const botao = Array.from(document.querySelectorAll('button')).find(b => 
        (b.textContent || '').toLowerCase().includes('pagar')
    );
    
    if (botao) {
        console.log('%c💳 Enviando...', 'font-weight: bold; color: #FF5722;');
        botao.click();
        
        console.log('\n%c✅ ENVIADO!', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
    } else {
        console.log('%c❌ Botão não encontrado', 'color: #F44336;');
    }
    
})();
