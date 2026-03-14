// ============================================
// DASHBOARD ADMIN - app.js
// ============================================

let currentTab = 'courses';

// Carregar estatísticas
async function loadStats() {
    try {
        const response = await axios.get('/api/stats');
        if (response.data.success) {
            const stats = response.data.stats;
            document.getElementById('stat-courses').textContent = stats.total_courses;
            document.getElementById('stat-sales').textContent = stats.total_sales;
            document.getElementById('stat-revenue').textContent = `R$ ${stats.total_revenue.toFixed(2)}`;
            document.getElementById('stat-links').textContent = stats.active_links;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carregar lista de cursos
async function loadCourses() {
    try {
        const response = await axios.get('/api/courses');
        if (response.data.success) {
            const coursesList = document.getElementById('courses-list');
            const courses = response.data.courses;
            
            if (courses.length === 0) {
                coursesList.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fas fa-book text-6xl mb-4"></i>
                        <p class="text-lg">Nenhum curso cadastrado ainda</p>
                        <button onclick="showTab('new-course')" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Criar Primeiro Curso
                        </button>
                    </div>
                `;
                return;
            }
            
            coursesList.innerHTML = courses.map(course => `
                <div class="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                    <img src="${course.image_url || 'https://via.placeholder.com/400x200?text=Sem+Imagem'}" 
                         alt="${course.title}" 
                         class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-2">${course.title}</h3>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">${course.description || 'Sem descrição'}</p>
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-2xl font-bold text-blue-600">R$ ${parseFloat(course.price).toFixed(2)}</span>
                            <span class="text-sm text-gray-500">
                                <i class="far fa-clock mr-1"></i>
                                ${new Date(course.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="generateLink(${course.id})" 
                                    class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                                <i class="fas fa-link mr-1"></i>Gerar Link
                            </button>
                            <button onclick="viewLinks(${course.id})" 
                                    class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                                <i class="fas fa-eye mr-1"></i>Ver Links
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar cursos');
    }
}

// Gerar link de pagamento
async function generateLink(courseId) {
    if (!confirm('Deseja gerar um novo link de pagamento para este curso?')) {
        return;
    }
    
    try {
        const response = await axios.post('/api/payment-links', { course_id: courseId });
        if (response.data.success) {
            const link = response.data.full_link;
            
            // Copiar para clipboard
            navigator.clipboard.writeText(link);
            
            // Mostrar modal com o link
            alert(`Link gerado com sucesso!\n\n${link}\n\n✓ Link copiado para a área de transferência!`);
            
            loadStats();
        }
    } catch (error) {
        console.error('Erro ao gerar link:', error);
        alert('Erro ao gerar link de pagamento');
    }
}

// Ver links de um curso
async function viewLinks(courseId) {
    try {
        const response = await axios.get(`/api/courses/${courseId}/links`);
        if (response.data.success) {
            const links = response.data.links;
            
            if (links.length === 0) {
                alert('Este curso ainda não possui links de pagamento.\n\nClique em "Gerar Link" para criar o primeiro.');
                return;
            }
            
            const linksList = links.map(link => {
                const fullLink = `${window.location.origin}/checkout/${link.link_code}`;
                return `📎 ${link.link_code}\n   ${fullLink}\n   Criado: ${new Date(link.created_at).toLocaleDateString('pt-BR')}`;
            }).join('\n\n');
            
            alert(`Links de pagamento para "${links[0].course_title}":\n\n${linksList}`);
        }
    } catch (error) {
        console.error('Erro ao carregar links:', error);
        alert('Erro ao carregar links');
    }
}

// Carregar vendas
async function loadSales() {
    try {
        const response = await axios.get('/api/sales');
        if (response.data.success) {
            const salesList = document.getElementById('sales-list');
            const sales = response.data.sales;
            
            if (sales.length === 0) {
                salesList.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-shopping-cart text-6xl mb-4"></i>
                        <p class="text-lg">Nenhuma venda registrada ainda</p>
                    </div>
                `;
                return;
            }
            
            salesList.innerHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Curso</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${sales.map(sale => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    ${new Date(sale.purchased_at).toLocaleString('pt-BR')}
                                </td>
                                <td class="px-4 py-3 text-sm font-medium">${sale.course_title}</td>
                                <td class="px-4 py-3 text-sm">${sale.customer_name}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${sale.customer_email}</td>
                                <td class="px-4 py-3 text-sm text-right font-bold text-green-600">
                                    R$ ${parseFloat(sale.amount).toFixed(2)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar vendas');
    }
}

// Trocar tabs
function showTab(tabName) {
    currentTab = tabName;
    
    // Atualizar botões
    document.querySelectorAll('nav button').forEach(btn => {
        btn.className = 'px-6 py-3 font-semibold text-gray-600 hover:text-blue-600';
    });
    document.getElementById(`tab-${tabName}`).className = 'px-6 py-3 font-semibold border-b-2 border-blue-500 text-blue-600';
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    
    // Carregar dados da tab
    if (tabName === 'courses') {
        loadCourses();
    } else if (tabName === 'sales') {
        loadSales();
    }
}

// Formulário de novo curso
document.getElementById('form-new-course').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        content: formData.get('content'),
        image_url: formData.get('image_url')
    };
    
    try {
        const response = await axios.post('/api/courses', data);
        if (response.data.success) {
            alert('✓ Curso criado com sucesso!');
            e.target.reset();
            showTab('courses');
            loadStats();
        }
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        alert('Erro ao criar curso. Verifique os dados e tente novamente.');
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadCourses();
});

// Expor funções globalmente
window.showTab = showTab;
window.generateLink = generateLink;
window.viewLinks = viewLinks;
