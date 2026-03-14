// ============================================
// CHECKOUT PAGE - checkout.js
// ============================================

async function loadCheckoutData() {
    const linkCode = window.LINK_CODE;
    
    try {
        const response = await axios.get(`/api/checkout/${linkCode}`);
        
        if (response.data.success) {
            const course = response.data.course;
            
            // Preencher dados do curso
            document.getElementById('course-title').textContent = course.title;
            document.getElementById('course-description').textContent = course.description || 'Sem descrição';
            document.getElementById('course-price').textContent = `R$ ${parseFloat(course.price).toFixed(2)}`;
            document.getElementById('course-content').textContent = course.content || 'Conteúdo não disponível';
            document.getElementById('course-image').src = course.image_url || 'https://via.placeholder.com/400x300?text=Sem+Imagem';
            
            // Mostrar conteúdo
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('checkout-content').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar checkout:', error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    }
}

// Processar compra
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        link_code: window.LINK_CODE,
        customer_name: formData.get('customer_name'),
        customer_email: formData.get('customer_email'),
        customer_phone: formData.get('customer_phone')
    };
    
    try {
        const response = await axios.post('/api/sales', data);
        
        if (response.data.success) {
            document.getElementById('checkout-content').classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Erro ao processar compra:', error);
        alert('Erro ao processar compra. Por favor, tente novamente.');
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
});
