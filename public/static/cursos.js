// Global variables
let courses = [];
let currentCourseId = null;

// Course Form Management
function showCourseForm() {
    document.getElementById('course-form').classList.remove('hidden');
    currentCourseId = null;
    document.getElementById('form-title').textContent = 'Adicionar Novo Curso';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Curso';
}

function hideCourseForm() {
    document.getElementById('course-form').classList.add('hidden');
    document.getElementById('course-title').value = '';
    document.getElementById('course-price').value = '';
    document.getElementById('course-description').value = '';
    document.getElementById('course-content').value = '';
    document.getElementById('course-image').value = '';
    document.getElementById('course-pdf').value = '';
    document.getElementById('course-category').value = 'Geral';
    document.getElementById('course-featured').checked = false;
    document.getElementById('course-image-width').value = 400;
    document.getElementById('course-image-height').value = 300;
    
    // Resetar previews
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('pdf-preview').classList.add('hidden');
    currentCourseId = null;
}

// Image Preview
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('image-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        // Upload to R2
        uploadImageToR2(file);
    }
}

function removeImage() {
    document.getElementById('course-image').value = '';
    document.getElementById('course-image-file').value = '';
    document.getElementById('image-preview').classList.add('hidden');
}

// PDF Preview
function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('pdf-name').textContent = file.name;
        document.getElementById('pdf-preview').classList.remove('hidden');
        
        // Upload to R2
        uploadPdfToR2(file);
    }
}

function removePdf() {
    document.getElementById('course-pdf').value = '';
    document.getElementById('course-pdf-file').value = '';
    document.getElementById('pdf-preview').classList.add('hidden');
}

// Upload to R2
async function uploadImageToR2(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        
        const response = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.url) {
            document.getElementById('course-image').value = response.data.url;
            console.log('✅ Imagem enviada:', response.data.url);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar imagem:', error);
        alert('Erro ao enviar imagem. Tente novamente.');
    }
}

async function uploadPdfToR2(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'pdf');
        
        const response = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.url) {
            document.getElementById('course-pdf').value = response.data.url;
            console.log('✅ PDF enviado:', response.data.url);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar PDF:', error);
        alert('Erro ao enviar PDF. Tente novamente.');
    }
}

// Save Course
async function saveCourse(event) {
    event.preventDefault();
    
    const courseData = {
        title: document.getElementById('course-title').value,
        price: parseFloat(document.getElementById('course-price').value),
        description: document.getElementById('course-description').value,
        content: document.getElementById('course-content').value,
        image_url: document.getElementById('course-image').value,
        pdf_url: document.getElementById('course-pdf').value,
        category: document.getElementById('course-category').value,
        featured: document.getElementById('course-featured').checked,
        image_width: parseInt(document.getElementById('course-image-width').value) || 400,
        image_height: parseInt(document.getElementById('course-image-height').value) || 300,
        active: true
    };
    
    try {
        let response;
        if (currentCourseId) {
            // Update existing course
            response = await axios.put(`/api/courses/${currentCourseId}`, courseData);
        } else {
            // Create new course
            response = await axios.post('/api/courses', courseData);
        }
        
        if (response.data.id) {
            alert(currentCourseId ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
            hideCourseForm();
            loadCourses();
        }
    } catch (error) {
        console.error('Erro ao salvar curso:', error);
        alert('Erro ao salvar curso. Verifique os dados e tente novamente.');
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
            <div class="col-span-full text-center py-12">
                <i class="fas fa-book text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhum curso cadastrado ainda.</p>
                <p class="text-gray-400 mt-2">Clique em "Novo Curso" para adicionar seu primeiro curso.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = courses.map(course => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div class="relative h-48 bg-gray-200">
                ${course.image_url ? 
                    `<img src="${course.image_url}" alt="${course.title}" class="w-full h-full object-cover">` :
                    `<div class="w-full h-full flex items-center justify-center">
                        <i class="fas fa-image text-gray-400 text-5xl"></i>
                    </div>`
                }
                <div class="absolute top-2 right-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${course.active ? 'bg-green-500' : 'bg-red-500'} text-white">
                        ${course.active ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                ${course.featured ? 
                    `<div class="absolute top-2 left-2">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                            <i class="fas fa-star mr-1"></i>Destaque
                        </span>
                    </div>` : ''
                }
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2 text-gray-800">${course.title}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${course.description || 'Sem descrição'}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold text-blue-600">R$ ${course.price.toFixed(2)}</span>
                    ${course.pdf_url ? 
                        `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <i class="fas fa-file-pdf mr-1"></i>PDF Incluso
                        </span>` : ''
                    }
                </div>
                <div class="flex gap-2">
                    <button onclick="editCourse(${course.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                        <i class="fas fa-edit mr-1"></i>Editar
                    </button>
                    <button onclick="toggleCourseStatus(${course.id}, ${!course.active})" 
                        class="flex-1 ${course.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg text-sm transition">
                        <i class="fas fa-${course.active ? 'eye-slash' : 'eye'} mr-1"></i>
                        ${course.active ? 'Desativar' : 'Ativar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Edit Course
async function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    currentCourseId = courseId;
    
    // Preencher formulário
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-price').value = course.price;
    document.getElementById('course-description').value = course.description || '';
    document.getElementById('course-content').value = course.content || '';
    document.getElementById('course-image').value = course.image_url || '';
    document.getElementById('course-pdf').value = course.pdf_url || '';
    document.getElementById('course-category').value = course.category || 'Geral';
    document.getElementById('course-featured').checked = course.featured || false;
    document.getElementById('course-image-width').value = course.image_width || 400;
    document.getElementById('course-image-height').value = course.image_height || 300;
    
    // Mostrar previews se houver URLs
    if (course.image_url) {
        document.getElementById('preview-img').src = course.image_url;
        document.getElementById('image-preview').classList.remove('hidden');
    }
    if (course.pdf_url) {
        document.getElementById('pdf-name').textContent = course.pdf_url.split('/').pop();
        document.getElementById('pdf-preview').classList.remove('hidden');
    }
    
    // Atualizar título do formulário
    document.getElementById('form-title').textContent = 'Editar Curso';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar Curso';
    
    // Mostrar formulário
    document.getElementById('course-form').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle Course Status
async function toggleCourseStatus(courseId, newStatus) {
    if (!confirm(`Deseja realmente ${newStatus ? 'ativar' : 'desativar'} este curso?`)) {
        return;
    }
    
    try {
        await axios.put(`/api/courses/${courseId}`, { active: newStatus });
        alert('Status atualizado com sucesso!');
        loadCourses();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status do curso.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
});
