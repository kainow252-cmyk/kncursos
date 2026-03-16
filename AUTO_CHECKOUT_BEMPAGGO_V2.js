// 🎯 SCRIPT AVANÇADO: AUTO-CHECKOUT BEMPAGGO
// URL: https://pay.bempaggo.com.br/cmv360hgu
// Este script inspeciona a página, encontra os campos e preenche automaticamente

(async function() {
    console.clear();
    console.log('%c🚀 VEMGO - Auto Checkout BemPaggo v2.0', 'font-size: 24px; font-weight: bold; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');
    
    // ==========================================
    // 📋 CONFIGURAÇÃO - EDITE SEUS DADOS AQUI
    // ==========================================
    const DADOS_PAGAMENTO = {
        nome_titular: "GELCI JOSE DA SILVA",
        email: "gelci.jose.grouptrig@gmail.com",
        cpf: "12345678900",
        telefone: "11999999999",
        
        // Dados do Cartão
        numero_cartao: "4111111111111111",
        nome_cartao: "GELCI JOSE DA SILVA",
        mes_validade: "12",
        ano_validade: "2028",
        cvv: "123",
        
        // Endereço (se necessário)
        cep: "01310-100",
        endereco: "Avenida Paulista",
        numero: "1578",
        complemento: "Apto 101",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP"
    };
    
    console.log('%c📝 Dados Carregados:', 'font-weight: bold; color: #2196F3; font-size: 14px;');
    console.table(DADOS_PAGAMENTO);
    
    // ==========================================
    // 🛠️ FUNÇÕES AUXILIARES
    // ==========================================
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function preencherInput(elemento, valor) {
        if (!elemento) return false;
        
        elemento.focus();
        elemento.value = valor;
        
        // Disparar eventos para frameworks JS
        ['input', 'change', 'blur', 'keyup', 'keydown'].forEach(eventType => {
            elemento.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
        
        return true;
    }
    
    function encontrarCampo(keywords) {
        // Tentar por name
        for (const keyword of keywords) {
            let campo = document.querySelector(`input[name*="${keyword}"], input[id*="${keyword}"]`);
            if (campo) return campo;
        }
        
        // Tentar por placeholder
        const inputs = document.querySelectorAll('input');
        for (const input of inputs) {
            const placeholder = (input.placeholder || '').toLowerCase();
            const label = input.labels?.[0]?.textContent?.toLowerCase() || '';
            
            for (const keyword of keywords) {
                if (placeholder.includes(keyword.toLowerCase()) || label.includes(keyword.toLowerCase())) {
                    return input;
                }
            }
        }
        
        return null;
    }
    
    // ==========================================
    // 🔍 PASSO 1: INSPECIONAR PÁGINA
    // ==========================================
    console.log('\n%c🔍 PASSO 1: Inspecionando página...', 'font-weight: bold; color: #FF9800; font-size: 16px;');
    
    const todosInputs = document.querySelectorAll('input, select, textarea');
    console.log(`📊 Total de campos encontrados: ${todosInputs.length}`);
    
    const mapaCampos = new Map();
    todosInputs.forEach((input, index) => {
        const info = {
            tipo: input.type || input.tagName.toLowerCase(),
            name: input.name || '-',
            id: input.id || '-',
            placeholder: input.placeholder || '-',
            classe: input.className || '-'
        };
        mapaCampos.set(index, info);
    });
    
    console.table(Array.from(mapaCampos.values()));
    
    // ==========================================
    // 📝 PASSO 2: PREENCHER CAMPOS
    // ==========================================
    console.log('\n%c📝 PASSO 2: Preenchendo campos...', 'font-weight: bold; color: #2196F3; font-size: 16px;');
    
    const mapeamento = [
        { campo: 'nome_titular', keywords: ['name', 'nome', 'titular', 'holder'] },
        { campo: 'email', keywords: ['email', 'e-mail'] },
        { campo: 'cpf', keywords: ['cpf', 'document', 'documento'] },
        { campo: 'telefone', keywords: ['phone', 'telefone', 'celular', 'mobile'] },
        { campo: 'numero_cartao', keywords: ['card', 'cartao', 'numero', 'number'] },
        { campo: 'nome_cartao', keywords: ['cardholder', 'titular'] },
        { campo: 'mes_validade', keywords: ['month', 'mes', 'mm', 'expiry'] },
        { campo: 'ano_validade', keywords: ['year', 'ano', 'yy', 'yyyy'] },
        { campo: 'cvv', keywords: ['cvv', 'cvc', 'security', 'codigo'] },
        { campo: 'cep', keywords: ['cep', 'postal', 'zip'] },
        { campo: 'endereco', keywords: ['street', 'address', 'endereco', 'rua'] },
        { campo: 'numero', keywords: ['number', 'numero', 'num'] },
        { campo: 'complemento', keywords: ['complement', 'complemento', 'apto'] },
        { campo: 'bairro', keywords: ['district', 'bairro', 'neighborhood'] },
        { campo: 'cidade', keywords: ['city', 'cidade'] },
        { campo: 'estado', keywords: ['state', 'estado', 'uf'] }
    ];
    
    let preenchidos = 0;
    let naoEncontrados = [];
    
    for (const { campo, keywords } of mapeamento) {
        const elemento = encontrarCampo(keywords);
        const valor = DADOS_PAGAMENTO[campo];
        
        if (elemento && valor) {
            if (preencherInput(elemento, valor)) {
                console.log(`%c✅ ${campo}: ${valor}`, 'color: #4CAF50;');
                preenchidos++;
                await sleep(100);
            }
        } else if (valor) {
            naoEncontrados.push(campo);
            console.log(`%c⚠️ ${campo}: Campo não encontrado`, 'color: #FF9800;');
        }
    }
    
    console.log(`\n%c📊 Resumo: ${preenchidos} campos preenchidos`, 'font-weight: bold; color: #4CAF50;');
    if (naoEncontrados.length > 0) {
        console.log(`%c⚠️ Não encontrados: ${naoEncontrados.join(', ')}`, 'color: #FF9800;');
    }
    
    // ==========================================
    // 🎯 PASSO 3: ENCONTRAR E CLICAR NO BOTÃO
    // ==========================================
    console.log('\n%c🎯 PASSO 3: Procurando botão de pagamento...', 'font-weight: bold; color: #9C27B0; font-size: 16px;');
    
    const botoes = document.querySelectorAll('button, input[type="submit"], a[role="button"]');
    console.log(`🔍 ${botoes.length} botões encontrados`);
    
    let botaoPagar = null;
    const keywordsBotao = ['pagar', 'pay', 'finalizar', 'confirmar', 'submit', 'enviar', 'processar'];
    
    for (const botao of botoes) {
        const texto = (botao.textContent || botao.value || '').toLowerCase();
        if (keywordsBotao.some(keyword => texto.includes(keyword))) {
            botaoPagar = botao;
            console.log(`%c✅ Botão encontrado: "${botao.textContent || botao.value}"`, 'color: #4CAF50;');
            break;
        }
    }
    
    if (botaoPagar) {
        console.log('\n%c⏳ Aguardando 2 segundos antes de clicar...', 'color: #2196F3;');
        await sleep(2000);
        
        console.log('%c💳 Clicando no botão de pagamento...', 'font-weight: bold; color: #FF5722;');
        botaoPagar.click();
        
        console.log('\n%c✅ PAGAMENTO ENVIADO!', 'font-size: 18px; font-weight: bold; color: #4CAF50; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
        console.log('%c⏳ Aguardando resposta do servidor...', 'color: #2196F3;');
        
        // Monitorar resposta
        setTimeout(() => {
            const mensagemSucesso = document.querySelector('.success, .approved, [class*="success"], [class*="approved"]');
            const mensagemErro = document.querySelector('.error, .denied, [class*="error"], [class*="denied"]');
            
            if (mensagemSucesso) {
                console.log('%c🎉 PAGAMENTO APROVADO!', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
            } else if (mensagemErro) {
                console.log('%c❌ PAGAMENTO RECUSADO', 'font-size: 20px; font-weight: bold; color: #F44336;');
                console.log('Motivo:', mensagemErro.textContent);
            } else {
                console.log('%c⏳ Ainda processando...', 'color: #FF9800;');
            }
        }, 5000);
        
    } else {
        console.log('%c❌ Botão de pagamento não encontrado!', 'font-weight: bold; color: #F44336;');
        console.log('\n%c🔍 Botões disponíveis:', 'font-weight: bold;');
        botoes.forEach((botao, index) => {
            console.log(`${index + 1}. "${botao.textContent?.trim() || botao.value}"`);
        });
        console.log('\n%c💡 Dica: Clique manualmente ou identifique o botão correto', 'color: #2196F3;');
    }
    
    // ==========================================
    // 📊 RELATÓRIO FINAL
    // ==========================================
    console.log('\n%c═══════════════════════════════════════════════════════════', 'color: #888;');
    console.log('%c📊 RELATÓRIO FINAL', 'font-size: 18px; font-weight: bold; color: #9C27B0;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');
    console.log(`✅ Campos preenchidos: ${preenchidos}`);
    console.log(`⚠️ Campos não encontrados: ${naoEncontrados.length}`);
    console.log(`🎯 Botão de pagamento: ${botaoPagar ? '✅ Encontrado e clicado' : '❌ Não encontrado'}`);
    console.log('%c\n🎉 Script executado com sucesso!', 'font-weight: bold; color: #4CAF50; font-size: 16px;');
    
})();

// ==========================================
// 💡 INSTRUÇÕES DE USO
// ==========================================
console.log('\n%c💡 COMO USAR ESTE SCRIPT:', 'font-weight: bold; font-size: 14px; color: #2196F3;');
console.log('1. Abra a página: https://pay.bempaggo.com.br/cmv360hgu');
console.log('2. Pressione F12 para abrir o Console');
console.log('3. Cole este script completo');
console.log('4. Pressione Enter');
console.log('5. O script vai preencher tudo e enviar automaticamente!');
