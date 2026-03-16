# 🐛 FIX: Erro ao enviar imagem - IDs inconsistentes

## 🎯 Problema Identificado
**Erro:** `Cannot read properties of null (reading 'innerHTML')`

### Causa Raiz
Existiam **2 formulários de curso** no painel admin com IDs diferentes para o preview de imagem:

**Formulário 1 (linha 3628):**
```html
<img id="preview-img" src="" alt="Preview">
```

**Formulário 2 (linha 3856):**
```html
<img id="image-preview-img" src="" alt="Preview">
```

### Código JavaScript (cursos.js linha 38)
```javascript
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;  // ❌ Procura 'preview-img'
            document.getElementById('image-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        uploadImageToR2(file);
    }
}
```

**Problema:** Quando o segundo formulário estava ativo, o JavaScript procurava por `preview-img` mas o HTML tinha `image-preview-img`, causando erro `null`.

---

## ✅ Solução
Padronizar o ID da imagem em ambos os formulários para `preview-img`:

### Antes
```html
<!-- Formulário 2 -->
<img id="image-preview-img" src="" alt="Preview">
```

### Depois
```html
<!-- Formulário 2 -->
<img id="preview-img" src="" alt="Preview">
```

---

## 🧪 Como Testar

### Teste Manual
1. Acesse: https://vemgo.com.br/cursos
2. Clique em "Novo Curso"
3. Clique em "Upload Imagem"
4. Selecione uma imagem
5. **Resultado esperado:** ✅ Preview aparece sem erro

### Teste Alternativo
1. Edite um curso existente
2. Clique em "Upload Imagem"
3. Selecione uma nova imagem
4. **Resultado esperado:** ✅ Preview atualiza sem erro

---

## 📍 Arquivos Modificados
- **src/index.tsx** (linha 3856): `image-preview-img` → `preview-img`

---

## 🔍 Verificação de IDs Duplicados

Para evitar problemas futuros, todos os IDs devem ser únicos ou consistentes entre formulários:

### IDs de Preview de Imagem
- ✅ `preview-img` (ambos os formulários)
- ✅ `image-preview` (container, ambos os formulários)
- ✅ `course-image` (input URL, ambos os formulários)
- ✅ `course-image-file` (input file, ambos os formulários)

### IDs de Preview de PDF
- ✅ `pdf-preview` (container, ambos os formulários)
- ✅ `pdf-name` (texto, ambos os formulários)
- ⚠️ `pdf-size` (apenas formulário 2, mas não usado no JS)
- ✅ `course-pdf` (input URL, ambos os formulários)
- ✅ `course-pdf-file` (input file, ambos os formulários)

---

## 🚀 Deploy
- **Build:** ✅ Sucesso (dist/_worker.js 478.87 kB)
- **Deploy:** ✅ Concluído
- **Preview:** https://960dadbd.vemgo.pages.dev
- **Produção:** https://vemgo.com.br/cursos

---

## ✅ Status
- **Problema:** ✅ Resolvido
- **IDs:** ✅ Padronizados
- **Upload:** ✅ Funcionando
- **Deploy:** ✅ Online

---

**🎉 Problema resolvido! Upload de imagem agora funciona em ambos os formulários!**
