-- Adicionar PDF placeholder para todos os cursos sem PDF
UPDATE courses 
SET pdf_url = 'https://www.genspark.ai/api/files/s/placeholder_' || id || '.pdf'
WHERE pdf_url IS NULL;

-- Verificar resultado
SELECT id, title, pdf_url FROM courses LIMIT 10;
