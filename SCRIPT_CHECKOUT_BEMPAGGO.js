// 🚀 SCRIPT DE CHECKOUT AUTOMÁTICO - BEMPAGGO
// URL: https://pay.bempaggo.com.br/cmv360hgu
// Valor: R$ 49,90
// Produto: CLUB KANOW

(async function() {
    console.clear();
    console.log('%c🚀 VEMGO - Checkout Automático BemPaggo', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
    console.log('%c═══════════════════════════════════════════════════', 'color: #888;');
    
    // 📋 DADOS DO CLIENTE (EDITE AQUI)
    const cliente = {
        nome: "GELCI JOSE DA SILVA",
        email: "gelci.jose.grouptrig@gmail.com",
        cpf: "123.456.789-00",
        numero_cartao: "4111 1111 1111 1111",
        nome_cartao: "GELCI JOSE DA SILVA",
        validade: "12/28",
        cvv: "123"
    };
    
    console.log('%c📝 Dados do Cliente:', 'font-weight: bold; color: #2196F3;');
    console.table(cliente);
    
    // 🔍 Função para preencher campo
    function preencherCampo(seletor, valor) {
        const campo = document.querySelector(seletor);
        if (campo) {
            campo.value = valor;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            campo.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ ${seletor} preenchido: ${valor}`);
            return true;
        } else {
            console.warn(`⚠️ Campo não encontrado: ${seletor}`);
            return false;
        }
    }
    
    // 🔍 Função para clicar em botão
    function clicarBotao(seletor) {
        const botao = document.querySelector(seletor);
        if (botao) {
            botao.click();
            console.log(`✅ Botão clicado: ${seletor}`);
            return true;
        } else {
            console.warn(`⚠️ Botão não encontrado: ${seletor}`);
            return false;
        }
    }
    
    // 🎯 Aguardar elemento
    function aguardarElemento(seletor, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                resolve(elemento);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const el = document.querySelector(seletor);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout aguardando: ${seletor}`));
            }, timeout);
        });
    }
    
    // 🎯 PASSO 1: Preencher dados do cartão
    console.log('\n%c📝 PASSO 1: Preenchendo dados do cartão...', 'font-weight: bold; color: #FF9800;');
    
    try {
        // Possíveis seletores para os campos
        const seletores = {
            nome: [
                'input[name="cardholder_name"]',
                'input[placeholder*="nome"]',
                'input[id*="name"]',
                '#cardholder-name'
            ],
            email: [
                'input[name="email"]',
                'input[type="email"]',
                'input[placeholder*="email"]',
                '#email'
            ],
            cpf: [
                'input[name="cpf"]',
                'input[name="document"]',
                'input[placeholder*="CPF"]',
                '#cpf'
            ],
            numero_cartao: [
                'input[name="card_number"]',
                'input[name="number"]',
                'input[placeholder*="Número"]',
                '#card-number'
            ],
            validade: [
                'input[name="expiration"]',
                'input[name="expiry"]',
                'input[placeholder*="Validade"]',
                '#expiration'
            ],
            cvv: [
                'input[name="cvv"]',
                'input[name="security_code"]',
                'input[placeholder*="CVV"]',
                '#cvv'
            ]
        };
        
        // Tentar preencher cada campo
        for (const [campo, valores] of Object.entries(seletores)) {
            let preenchido = false;
            for (const seletor of valores) {
                const valorCliente = cliente[campo === 'numero_cartao' ? 'numero_cartao' : 
                                              campo === 'nome' ? 'nome' : 
                                              campo === 'validade' ? 'validade' : 
                                              cliente[campo]];
                if (preencherCampo(seletor, valorCliente)) {
                    preenchido = true;
                    break;
                }
            }
            if (!preenchido) {
                console.warn(`⚠️ Campo "${campo}" não foi preenchido`);
            }
        }
        
        console.log('\n%c✅ Dados preenchidos com sucesso!', 'font-weight: bold; color: #4CAF50;');
        
        // 🎯 PASSO 2: Clicar no botão de pagamento
        console.log('\n%c💳 PASSO 2: Processando pagamento...', 'font-weight: bold; color: #FF9800;');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const botoesSubmit = [
            'button[type="submit"]',
            'button:contains("PAGAR")',
            'button:contains("Finalizar")',
            'button:contains("Confirmar")',
            '.btn-submit',
            '.btn-pay'
        ];
        
        let clicou = false;
        for (const seletor of botoesSubmit) {
            if (clicarBotao(seletor)) {
                clicou = true;
                break;
            }
        }
        
        if (!clicou) {
            console.error('❌ Botão de pagamento não encontrado!');
            console.log('%c🔍 Inspecione a página e encontre o botão:', 'color: #FF9800;');
            console.log('document.querySelector("button[type=submit]")');
        }
        
        // 🎯 PASSO 3: Aguardar resultado
        console.log('\n%c⏳ PASSO 3: Aguardando resposta...', 'font-weight: bold; color: #2196F3;');
        
        setTimeout(() => {
            console.log('\n%c✅ Script executado!', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
            console.log('%cVerifique se o pagamento foi processado na página.', 'color: #888;');
        }, 3000);
        
    } catch (error) {
        console.error('\n%c❌ ERRO:', 'font-weight: bold; color: #F44336;', error);
    }
})();
