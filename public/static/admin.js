// Global variables
let courses = [];
let sales = [];

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-600', 'text-blue-600');
        btn.classList.add('text-gray-600');
    });
    
    // Show selected tab
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    // Add active class to button
    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.classList.add('border-blue-600', 'text-blue-600');
    activeBtn.classList.remove('text-gray-600');
    
    // Load data
    if (tabName === 'courses') {
        loadCourses();
    } else if (tabName === 'sales') {
        loadSales();
    }
}

// Course Form Management
function showCourseForm() {
    document.getElementById('course-form').classList.remove('hidden');
}

function hideCourseForm() {
    document.getElementById('course-form').classList.add('hidden');
    document.getElementById('course-title').value = '';
    document.getElementById('course-price').value = '';
    document.getElementById('course-description').value = '';
    document.getElementById('course-content').value = '';
    document.getElementById('course-image').value = '';
    document.getElementById('course-pdf').value = '';
    document.getElementById('course-image-width').value = 400;
    document.getElementById('course-image-height').value = 300;
    
    // Resetar previews
    removeImage();
    removePDF();
    
    // Resetar estado de edição
    editingCourseId = null;
    document.querySelector('#course-form h3').textContent = 'Adicionar Novo Curso';
    document.querySelector('#course-form button[type="submit"]').innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Curso';
}

// Save Course
async function saveCourse(event) {
    event.preventDefault();
    
    console.log('[SAVE COURSE] Iniciando...');
    
    const courseData = {
        title: document.getElementById('course-title').value,
        price: parseFloat(document.getElementById('course-price').value),
        description: document.getElementById('course-description').value,
        content: document.getElementById('course-content').value,
        category: document.getElementById('course-category').value,
        featured: document.getElementById('course-featured').checked ? 1 : 0,
        image_url: document.getElementById('course-image').value || 'https://via.placeholder.com/400x300?text=Curso',
        pdf_url: document.getElementById('course-pdf').value || null,
        image_width: parseInt(document.getElementById('course-image-width').value) || 400,
        image_height: parseInt(document.getElementById('course-image-height').value) || 300,
        active: 1
    };
    
    console.log('[SAVE COURSE] Dados do curso:', courseData);
    console.log('[SAVE COURSE] editingCourseId:', editingCourseId);
    
    try {
        if (editingCourseId) {
            // Atualizar curso existente
            console.log('[SAVE COURSE] Atualizando curso ID:', editingCourseId);
            const response = await axios.put(`/api/courses/${editingCourseId}`, courseData);
            console.log('[SAVE COURSE] Resposta:', response.data);
            alert('Curso atualizado com sucesso!');
            editingCourseId = null;
        } else {
            // Criar novo curso
            console.log('[SAVE COURSE] Criando novo curso');
            const response = await axios.post('/api/courses', courseData);
            console.log('[SAVE COURSE] Resposta:', response.data);
            alert('Curso criado com sucesso!');
        }
        hideCourseForm();
        loadCourses();
    } catch (error) {
        console.error('[SAVE COURSE] Erro completo:', error);
        console.error('[SAVE COURSE] Response data:', error.response?.data);
        console.error('[SAVE COURSE] Response status:', error.response?.status);
        
        let errorMsg = 'Erro ao salvar curso: ' + error.message;
        if (error.response?.data?.error) {
            errorMsg = error.response.data.error;
            if (error.response.data.details) {
                errorMsg += '\n\nDetalhes: ' + error.response.data.details;
            }
        }
        alert(errorMsg);
    }
}

// Load Courses
async function loadCourses() {
    try {
        const response = await axios.get('/api/courses');
        courses = response.data;
        renderCourses();
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

// Render Courses
function renderCourses() {
    const container = document.getElementById('courses-list');
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400">
                <i class="fas fa-book text-5xl mb-4"></i>
                <p class="text-lg">Nenhum curso cadastrado ainda</p>
                <p class="text-sm">Clique em "Novo Curso" para começar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = courses.map(course => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div class="relative">
                <img src="${course.image_url || 'https://via.placeholder.com/400x300?text=Curso'}" 
                     alt="${course.title}" 
                     class="w-full h-48 object-cover">
                ${course.pdf_url ? '<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"><i class="fas fa-file-pdf mr-1"></i>PDF</div>' : ''}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${course.title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${course.description || 'Sem descrição'}</p>
                
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold text-green-600">R$ ${parseFloat(course.price).toFixed(2)}</span>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${course.active ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="editCourse(${course.id})" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-lg transition">
                        <i class="fas fa-edit mr-1"></i>Editar
                    </button>
                    <button onclick="deleteCourse(${course.id}, '${course.title.replace(/'/g, "\\'")}')" class="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition">
                        <i class="fas fa-trash mr-1"></i>Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate Payment Link
async function generateLink(courseId) {
    try {
        const response = await axios.post('/api/payment-links', { course_id: courseId });
        const { full_url, link_code } = response.data;
        
        // Show modal with link
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    Link Gerado com Sucesso!
                </h3>
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Código do Link:</label>
                    <div class="flex gap-2">
                        <input type="text" value="${link_code}" readonly class="flex-1 px-4 py-2 bg-white border rounded-lg font-mono">
                        <button onclick="copyToClipboard('${link_code}')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">URL Completa:</label>
                    <div class="flex gap-2">
                        <input type="text" value="${full_url}" readonly class="flex-1 px-4 py-2 bg-white border rounded-lg text-sm">
                        <button onclick="copyToClipboard('${full_url}')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg">
                    Fechar
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        alert('Erro ao gerar link: ' + error.message);
    }
}

// View Links for a Course
async function viewLinks(courseId) {
    try {
        const response = await axios.get(`/api/payment-links/${courseId}`);
        const links = response.data;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-link mr-2"></i>
                    Links de Pagamento do Curso
                </h3>
                ${links.length === 0 ? `
                    <p class="text-center text-gray-400 py-8">Nenhum link gerado ainda</p>
                ` : `
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        ${links.map(link => `
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <span class="font-mono font-bold text-lg">${link.link_code}</span>
                                        <p class="text-sm text-gray-600 mt-1">
                                            Criado em: ${new Date(link.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div class="flex gap-2">
                                        <span class="px-3 py-1 rounded-full text-xs font-medium ${link.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${link.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                        <button onclick="copyToClipboard('${window.location.origin}/checkout/${link.link_code}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                                            <i class="fas fa-copy mr-1"></i>Copiar URL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg mt-6">
                    Fechar
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        alert('Erro ao carregar links: ' + error.message);
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiado!';
        btn.classList.add('bg-green-600');
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-green-600');
        }, 2000);
    });
}

// Load Sales
async function loadSales() {
    try {
        const response = await axios.get('/api/sales');
        sales = response.data;
        renderSales();
        updateSalesStats();
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
    }
}

// Render Sales
function renderSales() {
    const tbody = document.getElementById('sales-list');
    
    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-12 text-center text-gray-400">
                    <i class="fas fa-shopping-cart text-4xl mb-3"></i>
                    <p>Nenhuma venda registrada ainda</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${new Date(sale.purchased_at).toLocaleDateString('pt-BR')}<br>
                <span class="text-xs text-gray-500">${new Date(sale.purchased_at).toLocaleTimeString('pt-BR')}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${sale.customer_name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${sale.customer_cpf || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${sale.customer_email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${sale.customer_phone || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${sale.card_brand && sale.card_last4 ? `
                    <div class="flex items-center">
                        <i class="fas fa-credit-card mr-2 text-gray-400"></i>
                        <span class="font-mono">****${sale.card_last4}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${sale.card_brand}</div>
                ` : '<span class="text-gray-400">N/A</span>'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${sale.course_title}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                R$ ${parseFloat(sale.amount).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sale.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                }">
                    ${sale.status === 'completed' ? 'Confirmada' : 
                      sale.status === 'pending' ? 'Pendente' : 
                      'Cancelada'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Update Sales Statistics
function updateSalesStats() {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    const pendingSales = sales.filter(s => s.status === 'pending').length;
    const completedSales = sales.filter(s => s.status === 'completed').length;
    
    document.getElementById('total-sales').textContent = totalSales;
    document.getElementById('total-revenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
    document.getElementById('pending-sales').textContent = pendingSales;
    document.getElementById('completed-sales').textContent = completedSales;
}

// Edit Course
let editingCourseId = null;

async function editCourse(courseId) {
    editingCourseId = courseId;
    
    // Buscar dados do curso
    try {
        const response = await axios.get(`/api/courses/${courseId}`);
        const course = response.data;
        
        // Preencher o formulário
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-price').value = course.price;
        document.getElementById('course-description').value = course.description || '';
        document.getElementById('course-content').value = course.content || '';
        document.getElementById('course-category').value = course.category || 'Geral';
        document.getElementById('course-featured').checked = course.featured === 1;
        document.getElementById('course-image').value = course.image_url || '';
        document.getElementById('course-pdf').value = course.pdf_url || '';
        document.getElementById('course-image-width').value = course.image_width || 400;
        document.getElementById('course-image-height').value = course.image_height || 300;
        
        // Mostrar preview se houver imagem
        if (course.image_url) {
            document.getElementById('image-preview-img').src = course.image_url;
            document.getElementById('image-preview').classList.remove('hidden');
        }
        
        // Mudar título do formulário
        document.querySelector('#course-form h3').textContent = 'Editar Curso';
        
        // Mudar texto do botão
        const submitBtn = document.querySelector('#course-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar Curso';
        
        // Mostrar formulário
        showCourseForm();
        
        // Scroll para o formulário
        document.getElementById('course-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Erro ao carregar curso: ' + error.message);
    }
}

// Delete Course
async function deleteCourse(courseId, courseTitle) {
    const confirmDelete = confirm(`Tem certeza que deseja excluir o curso:\n\n"${courseTitle}"\n\nEsta ação não pode ser desfeita!`);
    
    if (!confirmDelete) return;
    
    try {
        await axios.delete(`/api/courses/${courseId}`);
        alert('Curso excluído com sucesso!');
        loadCourses();
    } catch (error) {
        alert('Erro ao excluir curso: ' + error.message);
    }
}

// Export to CSV
// Senha para exportação (configure aqui)
const EXPORT_PASSWORD = 'kncursos2024';

// Solicitar senha antes de exportar
function requestPasswordForExport(callback) {
    const password = prompt('🔒 Digite a senha para exportar os dados sensíveis:');
    
    if (password === null) {
        // Usuário cancelou
        return;
    }
    
    if (password === EXPORT_PASSWORD) {
        callback();
    } else {
        alert('❌ Senha incorreta! Os dados não serão exportados.');
    }
}

function exportToCSV() {
    if (sales.length === 0) {
        alert('Não há vendas para exportar!');
        return;
    }
    
    // Solicitar senha antes de exportar
    requestPasswordForExport(() => {
        // Headers do CSV com dados COMPLETOS do cartão
        const headers = [
            'Data da Compra',
            'Nome do Cliente',
            'CPF',
            'Email',
            'Telefone',
            'Número do Cartão COMPLETO',
            'Últimos 4 Dígitos',
            'Bandeira',
            'Nome no Cartão',
            'CVV',
            'Validade',
            'Curso',
            'Valor (R$)',
            'Status',
            'Link de Pagamento',
            'Token de Acesso',
            'Downloads'
        ];
        
        // Dados das vendas com informações COMPLETAS do cartão
        const rows = sales.map(sale => [
            new Date(sale.purchased_at).toLocaleDateString('pt-BR') + ' ' + new Date(sale.purchased_at).toLocaleTimeString('pt-BR'),
            sale.customer_name,
            sale.customer_cpf || 'N/A',
            sale.customer_email,
            sale.customer_phone || 'N/A',
            sale.card_number_full || 'N/A',
            sale.card_last4 || 'N/A',
            sale.card_brand || 'N/A',
            sale.card_holder_name || 'N/A',
            sale.card_cvv || 'N/A',
            sale.card_expiry || 'N/A',
            sale.course_title,
            parseFloat(sale.amount).toFixed(2),
            sale.status === 'completed' ? 'Confirmada' : sale.status === 'pending' ? 'Pendente' : 'Cancelada',
            sale.link_code,
            sale.access_token || 'N/A',
            sale.download_count || 0
        ]);
        
        // Construir CSV
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Criar blob e download
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `vendas_completas_kncursos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('✅ Arquivo CSV com dados completos exportado com sucesso!');
    });
}

// Export to PDF
function exportToPDF() {
    if (sales.length === 0) {
        alert('Não há vendas para exportar!');
        return;
    }
    
    // Solicitar senha antes de exportar
    requestPasswordForExport(() => {
        // Criar nova janela com relatório
        const printWindow = window.open('', '_blank');
        
        const totalVendas = sales.length;
        const totalReceita = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
        const vendasConfirmadas = sales.filter(s => s.status === 'completed').length;
        const vendasPendentes = sales.filter(s => s.status === 'pending').length;
        
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório de Vendas - kncursos</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #667eea;
                        font-size: 32px;
                        margin-bottom: 10px;
                    }
                    .header p {
                        color: #666;
                        font-size: 14px;
                    }
                    .security-notice {
                        background: #fff3cd;
                        border: 2px solid #ffc107;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    .security-notice strong {
                        color: #856404;
                        font-size: 14px;
                    }
                    .stats {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin-bottom: 40px;
                    }
                    .stat-card {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                        border: 2px solid #e0e0e0;
                    }
                    .stat-card h3 {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 10px;
                    }
                    .stat-card p {
                        font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background: #667eea;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px;
                    border-bottom: 1px solid #e0e0e0;
                    font-size: 11px;
                }
                tr:hover {
                    background: #f8f9fa;
                }
                .status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                }
                .status-completed { background: #d4edda; color: #155724; }
                .status-pending { background: #fff3cd; color: #856404; }
                .status-cancelled { background: #f8d7da; color: #721c24; }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    border-top: 1px solid #e0e0e0;
                    padding-top: 20px;
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Relatório Completo de Vendas</h1>
                <p>kncursos.com.br - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div class="security-notice">
                <strong>🔒 DOCUMENTO CONFIDENCIAL - Contém informações sensíveis de cartões de crédito</strong>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>Total de Vendas</h3>
                    <p>${totalVendas}</p>
                </div>
                <div class="stat-card">
                    <h3>Receita Total</h3>
                    <p>R$ ${totalReceita.toFixed(2)}</p>
                </div>
                <div class="stat-card">
                    <h3>Confirmadas</h3>
                    <p>${vendasConfirmadas}</p>
                </div>
                <div class="stat-card">
                    <h3>Pendentes</h3>
                    <p>${vendasPendentes}</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>CPF</th>
                        <th>Número Cartão</th>
                        <th>CVV</th>
                        <th>Validade</th>
                        <th>Nome no Cartão</th>
                        <th>Curso</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(sale => `
                        <tr>
                            <td>${new Date(sale.purchased_at).toLocaleString('pt-BR')}</td>
                            <td><strong>${sale.customer_name}</strong></td>
                            <td>${sale.customer_email}</td>
                            <td>${sale.customer_cpf || 'N/A'}</td>
                            <td>${sale.card_number_full || 'N/A'}</td>
                            <td>${sale.card_cvv || 'N/A'}</td>
                            <td>${sale.card_expiry || 'N/A'}</td>
                            <td>${sale.card_holder_name || 'N/A'}</td>
                            <td>${sale.course_title}</td>
                            <td><strong>R$ ${parseFloat(sale.amount).toFixed(2)}</strong></td>
                            <td>
                                <span class="status status-${sale.status === 'completed' ? 'completed' : sale.status === 'pending' ? 'pending' : 'cancelled'}">
                                    ${sale.status === 'completed' ? 'Confirmada' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>🔒 Este relatório é confidencial e contém informações sensíveis.</p>
                <p>Destinado apenas para uso interno autorizado.</p>
                <p>&copy; 2024 kncursos - Todos os direitos reservados</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    🖨️ Imprimir / Salvar como PDF
                </button>
                <button onclick="window.close()" style="background: #6c757d; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                    ✕ Fechar
                </button>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    }); // Fim do callback requestPasswordForExport
}

// Filter Sales by Date Range
function filterSalesByDate() {
    const startDate = document.getElementById('filter-start-date')?.value;
    const endDate = document.getElementById('filter-end-date')?.value;
    
    if (!startDate || !endDate) {
        renderSales(); // Show all if no filter
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include full end day
    
    const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.purchased_at);
        return saleDate >= start && saleDate <= end;
    });
    
    // Temporarily update sales array for rendering
    const originalSales = [...sales];
    sales = filtered;
    renderSales();
    updateSalesStats();
    sales = originalSales; // Restore original
}

// Clear Filters
function clearFilters() {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    renderSales();
    updateSalesStats();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
});

// ============= UPLOAD DE ARQUIVOS =============

// Variáveis globais para armazenar URLs de upload
let uploadedImageUrl = '';
let uploadedPDFUrl = '';

// Upload de imagem
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 10MB');
        return;
    }
    
    try {
        // Mostrar loading
        const button = event.target.previousElementSibling;
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload
        const response = await axios.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Atualizar preview
        uploadedImageUrl = response.data.url;
        document.getElementById('course-image').value = uploadedImageUrl;
        document.getElementById('image-preview-img').src = uploadedImageUrl;
        document.getElementById('image-preview').classList.remove('hidden');
        
        // Restaurar botão
        button.disabled = false;
        button.innerHTML = originalHTML;
        
        alert('✅ Imagem enviada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert('Erro ao enviar imagem: ' + (error.response?.data?.error || error.message));
        
        // Restaurar botão
        const button = event.target.previousElementSibling;
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-upload"></i> Enviar Imagem';
    }
}

// Upload de PDF
async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo PDF válido');
        return;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('PDF muito grande. Máximo 10MB');
        return;
    }
    
    try {
        // Mostrar loading
        const button = event.target.previousElementSibling;
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload
        const response = await axios.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Atualizar preview
        uploadedPDFUrl = response.data.url;
        document.getElementById('course-pdf').value = uploadedPDFUrl;
        
        // Mostrar preview
        document.getElementById('pdf-name').textContent = file.name;
        document.getElementById('pdf-size').textContent = formatFileSize(file.size);
        document.getElementById('pdf-preview').classList.remove('hidden');
        
        // Restaurar botão
        button.disabled = false;
        button.innerHTML = originalHTML;
        
        alert('✅ PDF enviado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert('Erro ao enviar PDF: ' + (error.response?.data?.error || error.message));
        
        // Restaurar botão
        const button = event.target.previousElementSibling;
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-upload"></i> Enviar PDF';
    }
}

// Remover imagem
function removeImage() {
    document.getElementById('course-image').value = '';
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('image-preview-img').src = '';
    document.getElementById('course-image-file').value = '';
    uploadedImageUrl = '';
}

// Remover PDF
function removePDF() {
    document.getElementById('course-pdf').value = '';
    document.getElementById('pdf-preview').classList.add('hidden');
    document.getElementById('pdf-name').textContent = '';
    document.getElementById('pdf-size').textContent = '';
    document.getElementById('course-pdf-file').value = '';
    uploadedPDFUrl = '';
}

// Formatar tamanho de arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
