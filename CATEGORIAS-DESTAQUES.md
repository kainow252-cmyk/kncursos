# ✨ Sistema de Categorias e Destaques para Cursos

## 🎯 Funcionalidades Implementadas

### 1. **Categorias de Cursos**
- ✅ Campo `category` adicionado à tabela courses
- ✅ 10 categorias pré-definidas disponíveis
- ✅ Filtro de categoria na página home
- ✅ Badges coloridos com ícones para cada categoria
- ✅ Seletor de categoria no admin ao cadastrar/editar curso

### 2. **Sistema de Destaques**
- ✅ Campo `featured` (boolean) adicionado à tabela courses
- ✅ Seção especial "Cursos em Destaque" na home
- ✅ Badge dourado "DESTAQUE" nos cursos destacados
- ✅ Checkbox "Destacar na Home" no formulário admin

### 3. **Interface da Home**
- ✅ Filtros por categoria (botões clicáveis)
- ✅ Seção de destaques separada no topo
- ✅ Grid responsivo de cursos
- ✅ Ícones personalizados por categoria

## 📊 Categorias Disponíveis

| Categoria | Ícone | Descrição |
|-----------|-------|-----------|
| **Marketing Digital** | 📢 `fa-bullhorn` | Cursos de marketing online, SEO, redes sociais |
| **Tecnologia** | 💻 `fa-laptop-code` | Programação, desenvolvimento web, apps |
| **Negócios Online** | 🏪 `fa-store` | E-commerce, vendas online, dropshipping |
| **Design** | 🎨 `fa-palette` | Design gráfico, UI/UX, edição |
| **Vendas** | 📈 `fa-chart-line` | Técnicas de vendas, negociação |
| **Produtividade** | ✅ `fa-tasks` | Gestão de tempo, organização |
| **Finanças** | 💰 `fa-dollar-sign` | Investimentos, educação financeira |
| **Idiomas** | 🗣️ `fa-language` | Cursos de línguas estrangeiras |
| **Desenvolvimento Pessoal** | 🎓 `fa-user-graduate` | Soft skills, liderança |
| **Geral** | 📚 `fa-book` | Outros cursos |

## 🗄️ Estrutura do Banco de Dados

### Migration: `0008_add_category_and_featured.sql`

```sql
-- Adicionar coluna category (padrão: 'Geral')
ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'Geral';

-- Adicionar coluna featured (padrão: 0 = não destacado)
ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
```

### Campos Atualizados na Tabela `courses`

```
id              INTEGER PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
price           REAL NOT NULL
content         TEXT
image_url       TEXT
pdf_url         TEXT
category        TEXT DEFAULT 'Geral'         ← NOVO
featured        INTEGER DEFAULT 0             ← NOVO
active          INTEGER DEFAULT 1
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

## 🎨 Interface do Admin

### Formulário de Curso

**Novos Campos:**

1. **Seletor de Categoria** (dropdown)
   - 10 opções pré-definidas
   - Campo obrigatório
   - Ícone: `<i class="fas fa-tag"></i>`

2. **Checkbox "Destacar na Home"**
   - Visual atraente com fundo azul
   - Ícone de estrela amarela
   - Toggle simples on/off

### Exemplo de Código HTML

```html
<select id="course-category" required class="w-full px-4 py-2 border rounded-lg">
    <option value="">Selecione uma categoria</option>
    <option value="Marketing Digital">Marketing Digital</option>
    <option value="Tecnologia">Tecnologia</option>
    <!-- ... outras categorias ... -->
</select>

<label class="flex items-center gap-3 cursor-pointer bg-blue-50">
    <input type="checkbox" id="course-featured" class="w-5 h-5">
    <i class="fas fa-star text-yellow-500"></i>
    <span>Destacar na Home</span>
</label>
```

## 🏠 Interface da Home

### 1. Filtros de Categoria

**Localização**: Topo da página, abaixo do hero

**Funcionalidade**:
- Botões clicáveis para cada categoria
- Botão "Todos" para mostrar todos os cursos
- Estado ativo visual (azul)
- Filtragem instantânea via JavaScript

```javascript
function filterCategory(category) {
    currentFilter = category;
    renderCourses(); // Re-renderiza apenas cursos da categoria
}
```

### 2. Seção de Cursos em Destaque

**Características**:
- ⭐ Título "Cursos em Destaque" com ícone de estrela
- Grid de 3 colunas (responsivo)
- Badge dourado "DESTAQUE" no card
- Oculta automaticamente se não houver destaques

### 3. Seção de Todos os Cursos

**Características**:
- Grid de 4 colunas no desktop (responsivo)
- Badge de categoria em cada card
- Ícone específico da categoria
- Filtragem dinâmica por categoria

### Estrutura do Card de Curso

```html
<div class="bg-white rounded-xl shadow-lg">
    <div class="relative">
        <img src="curso.jpg" class="w-full h-40 object-cover">
        
        <!-- Badge de Destaque (se featured === 1) -->
        <div class="absolute top-2 left-2 bg-yellow-500">
            <i class="fas fa-star"></i>DESTAQUE
        </div>
        
        <!-- Badge de PDF (se pdf_url existe) -->
        <div class="absolute top-2 right-2 bg-red-500">
            <i class="fas fa-file-pdf"></i>PDF
        </div>
        
        <!-- Preço -->
        <div class="absolute bottom-0 left-0 right-0">
            <span class="text-white text-2xl font-bold">R$ 197.00</span>
        </div>
    </div>
    
    <div class="p-4">
        <!-- Badge de Categoria -->
        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            <i class="fas fa-bullhorn"></i>
            Marketing Digital
        </span>
        
        <h3>Título do Curso</h3>
        <p>Descrição...</p>
        
        <a href="/curso/1" class="bg-gradient-to-r from-green-500 to-green-600">
            <i class="fas fa-shopping-cart"></i>
            COMPRAR AGORA
        </a>
    </div>
</div>
```

## 🔧 API Endpoints Atualizados

### POST `/api/courses` (Criar Curso)

**Request Body:**
```json
{
  "title": "Curso de Marketing Digital",
  "description": "Aprenda marketing online",
  "price": 197.00,
  "content": "Módulo 1, Módulo 2...",
  "image_url": "https://exemplo.com/imagem.jpg",
  "pdf_url": "https://exemplo.com/curso.pdf",
  "category": "Marketing Digital",  // NOVO
  "featured": 1                      // NOVO (0 ou 1)
}
```

### PUT `/api/courses/:id` (Atualizar Curso)

**Request Body:** (mesma estrutura do POST)

### GET `/api/courses` (Listar Cursos)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Curso de Marketing Digital",
    "category": "Marketing Digital",
    "featured": 1,
    "price": 197.00,
    "description": "...",
    "content": "...",
    "image_url": "...",
    "pdf_url": "...",
    "active": 1,
    "created_at": "2026-03-13 19:45:00"
  }
]
```

## 🧪 Como Testar

### 1. Testar Filtros de Categoria na Home

```bash
# Acesse: http://localhost:3000/
# 1. Clique em "Marketing Digital" → Mostra apenas cursos dessa categoria
# 2. Clique em "Tecnologia" → Mostra apenas cursos de tecnologia
# 3. Clique em "Todos" → Mostra todos os cursos
```

### 2. Testar Seção de Destaques

```bash
# 1. Acesse o admin: http://localhost:3000/admin
# 2. Edite um curso
# 3. Marque "Destacar na Home"
# 4. Salve
# 5. Volte para home: http://localhost:3000/
# 6. Verifique seção "Cursos em Destaque" no topo
```

### 3. Testar Cadastro com Categoria

```bash
# 1. Acesse admin: http://localhost:3000/admin
# 2. Clique em "Novo Curso"
# 3. Preencha todos os campos
# 4. Selecione uma categoria no dropdown
# 5. Marque ou desmarque "Destacar na Home"
# 6. Salve
# 7. Verifique na home se aparece corretamente
```

### 4. Testar API via curl

```bash
# Listar cursos com categoria e featured
curl http://localhost:3000/api/courses | jq '.[0] | {title, category, featured}'

# Criar curso com categoria
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Curso",
    "price": 99.00,
    "description": "Descrição",
    "content": "Conteúdo",
    "category": "Design",
    "featured": 1
  }'
```

## 📁 Arquivos Modificados

### Backend (src/index.tsx)
- ✅ Adicionado suporte a `category` e `featured` no POST /api/courses
- ✅ Adicionado suporte a `category` e `featured` no PUT /api/courses/:id
- ✅ Atualizada página home com filtros e destaques
- ✅ JavaScript da home com funções de filtro e renderização

### Frontend Admin (public/static/admin.js)
- ✅ Função `saveCourse()` envia `category` e `featured`
- ✅ Função `editCourse()` preenche `category` e `featured`

### Database (migrations/)
- ✅ Nova migration: `0008_add_category_and_featured.sql`

## 🌐 URLs para Teste

- **Home com Filtros**: http://localhost:3000/
- **Admin para Cadastro**: http://localhost:3000/admin
- **Produção**: https://kncursos.pages.dev/
- **Versão Atual**: https://5e5cdfc8.kncursos.pages.dev/

## ✅ Checklist

- [x] Migration criada e aplicada localmente
- [x] Campos `category` e `featured` adicionados ao formulário admin
- [x] Seletor de categoria com 10 opções
- [x] Checkbox "Destacar na Home" no formulário
- [x] APIs POST e PUT atualizadas
- [x] Filtros de categoria na home
- [x] Seção de destaques na home
- [x] Badges de categoria em cada card
- [x] Ícones personalizados por categoria
- [x] JavaScript de filtro funcional
- [x] Build concluído (378 KB bundle)
- [x] Servidor reiniciado
- [x] Deploy na Cloudflare concluído
- [x] Documentação criada
- [x] Commit realizado

## 🎨 Design Visual

### Filtros de Categoria
- Botões arredondados (rounded-full)
- Estado ativo: azul com texto branco
- Estado normal: branco com texto cinza
- Hover: azul com texto branco
- Sombra suave (shadow-md)

### Badge de Destaque
- Fundo amarelo (`bg-yellow-500`)
- Texto branco
- Ícone de estrela
- Posição: topo esquerdo do card

### Badge de Categoria
- Fundo azul claro (`bg-blue-100`)
- Texto azul escuro (`text-blue-700`)
- Ícone específico da categoria
- Tamanho pequeno (text-xs)

## 📊 Impacto na Performance

- **Índices criados**: 2 (category, featured)
- **Queries otimizadas**: Filtros por categoria são instantâneos
- **Bundle size**: +8.5 KB (de 369 KB para 378 KB)
- **JavaScript extra**: ~100 linhas (filtros e destaques)

## 🚀 Próximos Passos Sugeridos

- [ ] Adicionar contador de cursos por categoria
- [ ] Ordenação (mais vendidos, mais baratos, etc.)
- [ ] Busca por nome de curso
- [ ] Categorias dinâmicas (cadastráveis pelo admin)
- [ ] Limite de cursos em destaque (máx 6)
- [ ] Analytics de categoria mais popular

---

**Data**: 2026-03-13  
**Status**: ✅ Concluído  
**Deploy**: https://5e5cdfc8.kncursos.pages.dev/
