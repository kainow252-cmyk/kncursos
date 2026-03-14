# 📅 Filtros de Data nas Exportações - KN Cursos

**Deploy:** https://kncursos.com.br  
**Data:** 14/03/2026  
**Status:** ✅ **FUNCIONANDO**

---

## 🎯 Funcionalidade Implementada

Todos os endpoints de exportação (CSV, PDF resumido e PDF detalhado) agora suportam **filtros de data** via query string!

### Parâmetros Disponíveis

| Parâmetro | Formato | Descrição | Obrigatório |
|-----------|---------|-----------|-------------|
| `start_date` | YYYY-MM-DD | Data inicial (a partir de) | Não |
| `end_date` | YYYY-MM-DD | Data final (até) | Não |

**Observações:**
- Ambos os parâmetros são opcionais
- Podem ser usados independentemente ou combinados
- Quando não fornecidos, retorna todas as vendas (sem filtro)

---

## 📝 Exemplos de Uso

### 1. CSV - Todas as Vendas (sem filtro)
```bash
https://kncursos.com.br/api/admin/sales/export/csv
```

**Arquivo gerado:**
```
vendas_completas_kncursos_2026-03-14.csv
```

---

### 2. CSV - Vendas de Um Dia Específico
```bash
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-14&end_date=2026-03-14
```

**Arquivo gerado:**
```
vendas_completas_kncursos_2026-03-14_a_2026-03-14.csv
```

**Resultado:** Apenas vendas do dia 14/03/2026

---

### 3. CSV - Vendas de Um Período
```bash
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-01&end_date=2026-03-14
```

**Arquivo gerado:**
```
vendas_completas_kncursos_2026-03-01_a_2026-03-14.csv
```

**Resultado:** Vendas de 01/03 a 14/03/2026 (15 dias)

---

### 4. CSV - Vendas A Partir de Uma Data
```bash
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-10
```

**Arquivo gerado:**
```
vendas_completas_kncursos_desde_2026-03-10.csv
```

**Resultado:** Todas as vendas desde 10/03/2026 até hoje

---

### 5. CSV - Vendas Até Uma Data
```bash
https://kncursos.com.br/api/admin/sales/export/csv?end_date=2026-03-10
```

**Arquivo gerado:**
```
vendas_completas_kncursos_ate_2026-03-10.csv
```

**Resultado:** Todas as vendas até 10/03/2026

---

## 📄 PDF Resumido

### Sem Filtro
```bash
https://kncursos.com.br/api/admin/sales/export/pdf
```

**Título do PDF:**
```
🎓 Relatório de Vendas - KN Cursos
```

---

### Com Período Específico
```bash
https://kncursos.com.br/api/admin/sales/export/pdf?start_date=2026-03-01&end_date=2026-03-14
```

**Título do PDF:**
```
🎓 Relatório de Vendas - KN Cursos (2026-03-01 a 2026-03-14)
```

---

### Com Data Inicial Apenas
```bash
https://kncursos.com.br/api/admin/sales/export/pdf?start_date=2026-03-10
```

**Título do PDF:**
```
🎓 Relatório de Vendas - KN Cursos (desde 2026-03-10)
```

---

## 🔒 PDF Detalhado (CONFIDENCIAL)

### Sem Filtro
```bash
https://kncursos.com.br/api/admin/sales/export/pdf-detalhado
```

**Cabeçalho:**
```
╔═══════════════════════════════════════════════════════════════╗
║  RELATÓRIO DETALHADO DE VENDAS - KN CURSOS (CONFIDENCIAL)  ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### Com Período Específico
```bash
https://kncursos.com.br/api/admin/sales/export/pdf-detalhado?start_date=2026-03-13&end_date=2026-03-13
```

**Cabeçalho:**
```
╔═══════════════════════════════════════════════════════════════╗
║  RELATÓRIO DETALHADO DE VENDAS - KN CURSOS (CONFIDENCIAL)  ║
║  PERÍODO:  2026-03-13 A 2026-03-13  ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🧪 Testes Realizados

### Teste 1: Vendas de Hoje (14/03/2026)
```bash
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-14&end_date=2026-03-14"
```

**Resultado:** ✅ 22 vendas retornadas

---

### Teste 2: Vendas de Ontem (13/03/2026)
```bash
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-13&end_date=2026-03-13"
```

**Resultado:** ✅ 4 vendas retornadas (vendas do Curso de Desenvolvimento Web)

---

### Teste 3: PDF com Filtro de Período
```bash
curl "https://kncursos.com.br/api/admin/sales/export/pdf?start_date=2026-03-14&end_date=2026-03-14"
```

**Resultado:** ✅ PDF gerado com título:
```
🎓 Relatório de Vendas - KN Cursos (2026-03-14 a 2026-03-14)
```

---

## 💡 Casos de Uso

### 1. Relatório Diário
```bash
# Vendas de hoje
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=$(date +%Y-%m-%d)&end_date=$(date +%Y-%m-%d)"
```

### 2. Relatório Semanal
```bash
# Últimos 7 dias
START_DATE=$(date -d '7 days ago' +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=$START_DATE&end_date=$END_DATE"
```

### 3. Relatório Mensal
```bash
# Mês atual
START_DATE=$(date +%Y-%m-01)
END_DATE=$(date +%Y-%m-%d)
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=$START_DATE&end_date=$END_DATE"
```

### 4. Relatório do Mês Anterior
```bash
# Mês passado (completo)
START_DATE=$(date -d 'last month' +%Y-%m-01)
END_DATE=$(date -d 'last month' +%Y-%m-31)
curl "https://kncursos.com.br/api/admin/sales/export/csv?start_date=$START_DATE&end_date=$END_DATE"
```

---

## 📊 Nomenclatura dos Arquivos CSV

O nome do arquivo CSV é gerado automaticamente com base nos filtros:

| Filtros | Formato do Nome |
|---------|-----------------|
| Sem filtro | `vendas_completas_kncursos_2026-03-14.csv` |
| Período completo | `vendas_completas_kncursos_2026-03-01_a_2026-03-14.csv` |
| Apenas início | `vendas_completas_kncursos_desde_2026-03-10.csv` |
| Apenas fim | `vendas_completas_kncursos_ate_2026-03-10.csv` |

**Vantagens:**
- ✅ Nome do arquivo indica claramente o período
- ✅ Fácil organização de múltiplos exports
- ✅ Evita confusão ao baixar vários relatórios

---

## 🔍 Query SQL Executada

### Sem Filtros
```sql
SELECT s.*, c.title as course_title
FROM sales s
JOIN payment_links pl ON s.link_code = pl.link_code
JOIN courses c ON pl.course_id = c.id
WHERE 1=1
ORDER BY s.purchased_at DESC
```

### Com Filtros
```sql
SELECT s.*, c.title as course_title
FROM sales s
JOIN payment_links pl ON s.link_code = pl.link_code
JOIN courses c ON pl.course_id = c.id
WHERE 1=1
  AND DATE(s.purchased_at) >= '2026-03-01'  -- start_date
  AND DATE(s.purchased_at) <= '2026-03-14'  -- end_date
ORDER BY s.purchased_at DESC
```

**Observação:** A função `DATE()` garante que apenas a parte da data é comparada, ignorando horas/minutos/segundos.

---

## 🌐 URLs Completas - Referência Rápida

### CSV
```bash
# Todas
https://kncursos.com.br/api/admin/sales/export/csv

# Hoje
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-14&end_date=2026-03-14

# Ontem
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-13&end_date=2026-03-13

# Últimos 7 dias
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-07&end_date=2026-03-14

# Mês atual
https://kncursos.com.br/api/admin/sales/export/csv?start_date=2026-03-01
```

### PDF Resumido
```bash
# Todas
https://kncursos.com.br/api/admin/sales/export/pdf

# Período específico
https://kncursos.com.br/api/admin/sales/export/pdf?start_date=2026-03-01&end_date=2026-03-14
```

### PDF Detalhado
```bash
# Todas
https://kncursos.com.br/api/admin/sales/export/pdf-detalhado

# Período específico
https://kncursos.com.br/api/admin/sales/export/pdf-detalhado?start_date=2026-03-01&end_date=2026-03-14
```

---

## ✅ Validação

### Checklist de Testes
- [x] CSV sem filtro retorna todas as vendas
- [x] CSV com `start_date` e `end_date` filtra corretamente
- [x] CSV com apenas `start_date` funciona
- [x] CSV com apenas `end_date` funciona
- [x] Nome do arquivo CSV reflete o período filtrado
- [x] PDF resumido com filtro exibe período no título
- [x] PDF detalhado com filtro exibe período no cabeçalho
- [x] Query SQL usa `DATE()` para comparação precisa
- [x] Parâmetros são opcionais (não quebra se omitidos)

---

## 🎯 Próximos Passos (Opcional)

### Melhorias Futuras
- [ ] Adicionar filtro por curso (`?course_id=3`)
- [ ] Adicionar filtro por status (`?status=completed`)
- [ ] Adicionar filtro por valor mínimo/máximo
- [ ] Adicionar paginação nos PDFs
- [ ] Criar endpoint de estatísticas por período
- [ ] Interface visual com calendário para seleção de datas

---

## 📌 Conclusão

✅ **Filtros de data implementados com sucesso!**

Todos os 3 endpoints de exportação agora suportam:
- ✅ Filtro por data inicial (`start_date`)
- ✅ Filtro por data final (`end_date`)
- ✅ Nome do arquivo/título reflete o período
- ✅ Compatível com CSV, PDF resumido e PDF detalhado

**Deploy:** https://kncursos.com.br (ID: 5ad33df8)  
**Build:** 480.25 kB em 2.66s  
**Status:** 🟢 PRODUÇÃO

---

**Desenvolvido por:** GenSpark AI Developer  
**Data:** 14/03/2026
