// Script de debug para identificar o erro no admin

console.log("=== DEBUG: Simulando fluxo de edição de curso ===");

// 1. Verificar se elementos existem na página /admin
const elementsToCheck = [
    'preview-img',
    'image-preview-img',
    'image-preview',
    'course-form',
    'course-title',
    'course-price',
    'course-image'
];

console.log("\n1. Verificando elementos no DOM:");
elementsToCheck.forEach(id => {
    const element = document.getElementById(id);
    console.log(`  - ${id}: ${element ? '✅ EXISTE' : '❌ NÃO ENCONTRADO'}`);
});

// 2. Simular o que o editCourse faz
console.log("\n2. Simulando editCourse():");
const previewImg = document.getElementById('preview-img') || document.getElementById('image-preview-img');
console.log(`  - previewImg obtido: ${previewImg ? '✅ ENCONTRADO' : '❌ NULL'}`);

if (previewImg) {
    try {
        previewImg.src = "https://via.placeholder.com/400x300?text=Test";
        console.log("  - ✅ SRC setado com sucesso!");
    } catch (error) {
        console.log(`  - ❌ ERRO ao setar src: ${error.message}`);
    }
} else {
    console.log("  - ⚠️ Não foi possível setar src (elemento não encontrado)");
}

// 3. Verificar se há múltiplos elementos com mesmo ID
console.log("\n3. Verificando duplicatas:");
const allPreviewImgs = document.querySelectorAll('#preview-img');
console.log(`  - Elementos com ID 'preview-img': ${allPreviewImgs.length}`);
const allImagePreviewImgs = document.querySelectorAll('#image-preview-img');
console.log(`  - Elementos com ID 'image-preview-img': ${allImagePreviewImgs.length}`);

console.log("\n=== FIM DO DEBUG ===");
