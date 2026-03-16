# 🐛 DEBUG: Erro ao Carregar Curso no Admin

## ❌ Problema Relatado
**Erro:** "Cannot set properties of null (setting 'src'), somente no admin dá erro!"

## 🔍 Análise Realizada

### Arquivos Verificados
1. ✅ **public/static/admin.js** - Função `editCourse()` com null-checks corretos
2. ✅ **src/index.tsx** (linha 3856) - Elemento `<img id="preview-img">` presente
3. ✅ **Código inline** - Funções `removeImage()`, `removePdf()`, `handleImageUpload()` verificadas

### Código Correto Implementado
```javascript
// Linha 409-416 em admin.js
if (course.image_url) {
    const previewImg = document.getElementById('preview-img') || 
                       document.getElementById('image-preview-img');
    if (previewImg) {
        previewImg.src = course.image_url;  // ✅ Apenas se elemento existir
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.classList.remove('hidden');
        }
    }
}
```

## 🧪 INSTRUÇÕES DE TESTE

### **PASSO 1: Abrir o Admin com Console Aberto**
1. Acesse: **https://vemgo.com.br/admin**
2. Faça login com suas credenciais
3. **ANTES DE CLICAR EM QUALQUER COISA**, abra o console do navegador:
   - Chrome/Edge: `F12` ou `Ctrl+Shift+J`
   - Firefox: `F12` ou `Ctrl+Shift+K`
   - Safari: `Cmd+Option+C`

### **PASSO 2: Reproduzir o Erro**
1. Vá para a aba **"Cursos"**
2. Clique no botão **"Editar"** em qualquer curso
3. **COPIE TODOS OS LOGS** que aparecerem no console

### **PASSO 3: Enviar Logs**
Procure por logs começando com `[EDIT COURSE]`:
```
[EDIT COURSE] Iniciando edição do curso: 6
[EDIT COURSE] Buscando dados...
[EDIT COURSE] Curso carregado: {id: 6, title: "...", ...}
[EDIT COURSE] Tentando mostrar preview da imagem: https://...
[EDIT COURSE] Elemento preview-img encontrado: SIM
[EDIT COURSE] Setando src...
[EDIT COURSE] ✅ SRC setado com sucesso!
```

### **PASSO 4: Verificar Elementos no DOM**
No console, execute este comando:
```javascript
console.log({
  'preview-img': document.getElementById('preview-img'),
  'image-preview-img': document.getElementById('image-preview-img'),
  'image-preview': document.getElementById('image-preview'),
  'course-form': document.getElementById('course-form')
});
```

E envie o resultado.

## 🎯 Possíveis Causas

### **Causa #1: Cache do Navegador**
O navegador pode estar carregando versão antiga do `admin.js`.

**Solução:**
1. Limpar cache: `Ctrl+Shift+Delete`
2. Ou abrir em **modo anônimo/privado**
3. Ou fazer **hard refresh**: `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

### **Causa #2: Timing Issue**
O JavaScript pode estar rodando antes da página carregar completamente.

**Solução:** Já implementada com logs de debug.

### **Causa #3: Erro em Outro Lugar**
O erro pode estar vindo de **outro arquivo JavaScript** sendo carregado.

**Teste:** Verificar se há erros no console **ANTES** de clicar em "Editar".

## 📊 Status Atual
- ✅ Código com null-checks implementado
- ✅ Logs de debug adicionados
- ✅ Deploy realizado: **https://vemgo.com.br/admin**
- ⏳ Aguardando logs do console para diagnóstico final

## 🔗 URLs de Teste
- **Produção:** https://vemgo.com.br/admin
- **Preview:** https://4983311c.vemgo.pages.dev/admin

## 📝 Próximos Passos
1. ⏳ Usuário abre console e testa
2. ⏳ Usuário envia logs completos
3. ⏳ Análise dos logs para identificar causa exata
4. ⏳ Aplicar correção definitiva

---

**💡 Dica:** Se o erro ainda aparecer após hard refresh, envie:
1. Screenshot do erro
2. Logs do console (começando com `[EDIT COURSE]`)
3. Resultado do comando de verificação de elementos no DOM
