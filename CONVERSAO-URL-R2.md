# 🔄 Sistema de Conversão Automática de URLs para R2

## ✅ **Implementado**

### **Backend - Endpoint `/api/upload-from-url`**

**Localização**: `src/index.tsx` (linha ~204)

**Funcionalidade**:
- Recebe uma URL externa de imagem ou PDF
- Baixa o arquivo automaticamente
- Faz upload para o R2
- Retorna a URL interna (`/files/...`)

**Uso**:
```javascript
POST /api/upload-from-url
Content-Type: application/json

{
  "url": "https://example.com/image.jpg",
  "type": "image"  // ou "pdf"
}

// Resposta:
{
  "success": true,
  "url": "/files/images/1710409200-abc123.jpg",  ← URL interna!
  "key": "images/1710409200-abc123.jpg",
  "size": 245678,
  "type": "image/jpeg",
  "originalUrl": "https://example.com/image.jpg"
}
```

**Validações**:
- ✅ Tipos permitidos: JPG, PNG, GIF, WEBP, PDF
- ✅ Tamanho máximo: 10 MB
- ✅ Content-Type verificado
- ✅ Nome único gerado automaticamente

---

## ⏳ **Pendente - Frontend**

### **Função JavaScript `saveCourse`**

**O que precisa ser implementado**:

1. **Interceptar o campo de URL de imagem**:
   - Se admin colar URL externa → chamar `/api/upload-from-url`
   - Substituir pela URL interna antes de salvar

2. **Interceptar o campo de URL de PDF**:
   - Mesma lógica da imagem
   - Converter URL externa → URL interna

3. **Fluxo Completo**:
```javascript
async function saveCourse(event) {
  event.preventDefault()
  
  // 1. Pegar valores do formulário
  const title = document.getElementById('course-title').value
  const price = document.getElementById('course-price').value
  let imageUrl = document.getElementById('course-image').value
  let pdfUrl = document.getElementById('course-pdf').value
  
  // 2. Se imageUrl for externa, converter para R2
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    if (!imageUrl.includes('/files/')) {  // Não é nossa URL
      const response = await axios.post('/api/upload-from-url', {
        url: imageUrl,
        type: 'image'
      })
      imageUrl = response.data.url  // /files/images/...
    }
  }
  
  // 3. Se pdfUrl for externa, converter para R2
  if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))) {
    if (!pdfUrl.includes('/files/')) {
      const response = await axios.post('/api/upload-from-url', {
        url: pdfUrl,
        type: 'pdf'
      })
      pdfUrl = response.data.url  // /files/pdfs/...
    }
  }
  
  // 4. Salvar curso com URLs internas
  await axios.post('/api/courses', {
    title,
    price,
    image_url: imageUrl,
    pdf_url: pdfUrl,
    // ... outros campos
  })
  
  // 5. Recarregar lista de cursos
  loadCourses()
}
```

---

## 📝 **Onde Adicionar o Código Frontend**

### **Opção 1: Inline no HTML** (mais simples)

Adicionar antes do fechamento `</script>` na página `/admin`:

**Localização**: Procurar por `<script src="https://cdn.jsdelivr.net/npm/axios` no bloco do admin

**Adicionar**:
```javascript
// Função para converter URL externa em URL do R2
async function convertUrlToR2(url, type) {
  if (!url) return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url
  if (url.includes('/files/')) return url  // Já é nossa URL
  
  try {
    console.log(`[CONVERT] Convertendo URL externa: ${url}`)
    const response = await axios.post('/api/upload-from-url', { url, type })
    console.log(`[CONVERT] ✅ Convertido para: ${response.data.url}`)
    return response.data.url
  } catch (error) {
    console.error('[CONVERT] ❌ Erro:', error)
    alert('Erro ao processar URL: ' + (error.response?.data?.error || error.message))
    throw error
  }
}

// Função para salvar curso
async function saveCourse(event) {
  event.preventDefault()
  
  const submitBtn = document.getElementById('submit-btn')
  const originalText = submitBtn.innerHTML
  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...'
  
  try {
    // Pegar valores do formulário
    const title = document.getElementById('course-title').value
    const description = document.getElementById('course-description').value
    const price = document.getElementById('course-price').value
    const content = document.getElementById('course-content').value
    const category = document.getElementById('course-category').value
    const featured = document.getElementById('course-featured').checked
    let imageUrl = document.getElementById('course-image').value
    let pdfUrl = document.getElementById('course-pdf').value
    const imageWidth = document.getElementById('course-image-width').value
    const imageHeight = document.getElementById('course-image-height').value
    
    // Validar campos obrigatórios
    if (!title || !price) {
      alert('Título e preço são obrigatórios')
      submitBtn.disabled = false
      submitBtn.innerHTML = originalText
      return
    }
    
    // Converter URLs externas para R2
    if (imageUrl) {
      imageUrl = await convertUrlToR2(imageUrl, 'image')
    }
    
    if (pdfUrl) {
      pdfUrl = await convertUrlToR2(pdfUrl, 'pdf')
    }
    
    // Criar curso
    const response = await axios.post('/api/courses', {
      title,
      description,
      price: parseFloat(price),
      content,
      category,
      featured: featured ? 1 : 0,
      image_url: imageUrl || '',
      pdf_url: pdfUrl || '',
      image_width: parseInt(imageWidth) || 400,
      image_height: parseInt(imageHeight) || 300
    })
    
    console.log('[SAVE COURSE] ✅ Curso salvo:', response.data)
    alert('Curso salvo com sucesso!')
    
    // Limpar formulário
    document.getElementById('course-title').value = ''
    document.getElementById('course-description').value = ''
    document.getElementById('course-price').value = ''
    document.getElementById('course-content').value = ''
    document.getElementById('course-category').value = 'Geral'
    document.getElementById('course-featured').checked = false
    document.getElementById('course-image').value = ''
    document.getElementById('course-pdf').value = ''
    document.getElementById('course-image-width').value = '400'
    document.getElementById('course-image-height').value = '300'
    
    // Recarregar lista de cursos
    // loadCourses()  // Se existir função loadCourses
    
    // Esconder formulário
    if (typeof hideCourseForm === 'function') {
      hideCourseForm()
    }
    
  } catch (error) {
    console.error('[SAVE COURSE] ❌ Erro:', error)
    alert('Erro ao salvar curso: ' + (error.response?.data?.error || error.message))
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = originalText
  }
}

// Handlers de upload de arquivo (upload direto)
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData)
    document.getElementById('course-image').value = response.data.url
    alert('Imagem enviada com sucesso!')
  } catch (error) {
    console.error('Erro no upload:', error)
    alert('Erro ao enviar imagem: ' + (error.response?.data?.error || error.message))
  }
}

async function handlePdfUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData)
    document.getElementById('course-pdf').value = response.data.url
    alert('PDF enviado com sucesso!')
  } catch (error) {
    console.error('Erro no upload:', error)
    alert('Erro ao enviar PDF: ' + (error.response?.data?.error || error.message))
  }
}
```

---

### **Opção 2: Adicionar via Edit Tool**

Procurar no arquivo por:
```
</script>
        </body>
    </html>
  `)
})
```

E adicionar o código JavaScript antes do `</script>`.

---

## 🎯 **Resultado Esperado**

### **Antes** (sem a implementação):
- Admin cola: `https://exemplo.com/imagem.jpg`
- Sistema salva: `https://exemplo.com/imagem.jpg`
- **Problema**: URL externa aparece no site

### **Depois** (com a implementação):
- Admin cola: `https://exemplo.com/imagem.jpg`
- Sistema:
  1. Baixa `https://exemplo.com/imagem.jpg`
  2. Faz upload para R2
  3. Salva: `/files/images/1710409200-abc123.jpg`
- **Resultado**: URL interna, controle total!

---

## ✅ **Vantagens da Solução**

1. ✅ **Facilidade para o Admin**: Pode colar qualquer URL
2. ✅ **Controle Total**: Todos os arquivos ficam no R2
3. ✅ **Performance**: Arquivos servidos do R2 (CDN)
4. ✅ **Backup**: Arquivos não dependem de sites externos
5. ✅ **URLs Limpas**: `/files/images/...` em vez de URLs longas
6. ✅ **Segurança**: Validação de tipos e tamanhos
7. ✅ **Transparente**: Admin nem percebe a conversão

---

## 🧪 **Como Testar**

1. **Acessar**: https://kncursos.com.br/admin
2. **Login**: admin / kncursos2024
3. **Criar curso**:
   - Título: Curso Teste
   - Preço: 99.00
   - **Imagem**: Colar `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400`
   - **PDF**: Colar `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
4. **Salvar**
5. **Verificar no banco**:
   ```sql
   SELECT id, title, image_url, pdf_url FROM courses WHERE id = X
   ```
6. **Resultado esperado**:
   - `image_url`: `/files/images/1710409200-abc123.jpg`
   - `pdf_url`: `/files/pdfs/1710409200-def456.pdf`

---

## 📋 **Checklist de Implementação**

- [x] Endpoint `/api/upload-from-url` criado
- [x] Validações de tipo e tamanho
- [x] Upload para R2 funcionando
- [ ] Função `saveCourse()` no frontend
- [ ] Função `convertUrlToR2()` no frontend
- [ ] Handlers `handleImageUpload()` e `handlePdfUpload()`
- [ ] Testes de conversão de URL
- [ ] Build e deploy

---

**Criado em**: 2026-03-14  
**Status**: Backend pronto, frontend pendente  
**Prioridade**: Alta  
**Estimativa**: 15-30 minutos para implementar frontend
