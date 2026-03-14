import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { Resend } from 'resend'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ASAAS_API_KEY: string;
  ASAAS_ENV: string;
  ASAAS_WEBHOOK_TOKEN: string;
  SUITPAY_CLIENT_ID: string;
  SUITPAY_CLIENT_SECRET: string;
  SUITPAY_ENV: string;
  RESEND_API_KEY: string;
  RESEND_WEBHOOK_SECRET: string;
  EMAIL_FROM: string;
  JWT_SECRET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// ============= SECURITY MIDDLEWARE =============

// Rate limiting simples (em memória) - auto-limpeza ao verificar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const rateLimit = (limit: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    const record = rateLimitMap.get(ip)
    
    // Auto-limpeza: remover entradas expiradas durante verificação
    if (record && now >= record.resetTime) {
      rateLimitMap.delete(ip)
    }
    
    const currentRecord = rateLimitMap.get(ip)
    
    if (currentRecord && now < currentRecord.resetTime) {
      if (currentRecord.count >= limit) {
        return c.json({ error: 'Muitas requisições. Tente novamente em alguns minutos.' }, 429)
      }
      currentRecord.count++
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    }
    
    await next()
  }
}

// Security headers
app.use('*', async (c, next) => {
  // Remover header X-Powered-By
  c.res.headers.delete('X-Powered-By')
  
  // Adicionar security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  c.res.headers.set('X-Frame-Options', 'DENY')
  c.res.headers.set('X-XSS-Protection', '1; mode=block')
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  await next()
})

// Enable CORS
app.use('/api/*', cors())

// Rate limiting para endpoints sensíveis
app.use('/api/auth/*', rateLimit(5, 60000)) // 5 req/min
app.use('/api/checkout/*', rateLimit(10, 60000)) // 10 req/min

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============= API ROUTES =============

// ============= AUTH ROUTES =============

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    const { DB, JWT_SECRET } = c.env

    // Buscar usuário no banco de dados
    const user = await DB.prepare(`
      SELECT * FROM users 
      WHERE username = ? AND password = ? AND active = 1
    `).bind(username, password).first()

    // Validar credenciais
    if (user) {
      // Gerar JWT token com role do usuário
      const token = await sign(
        {
          username: user.username,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 horas
        },
        JWT_SECRET || 'default-secret-key-change-in-production',
        'HS256'
      )

      // Definir cookie
      const isProduction = c.req.url.includes('https://')
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 horas
      })

      return c.json({ 
        success: true, 
        message: 'Login realizado com sucesso',
        role: user.role,
        name: user.name
      })
    }

    return c.json({ success: false, message: 'Usuário ou senha inválidos' }, 401)
  } catch (error: any) {
    console.error('Erro no login:', error)
    return c.json({ success: false, message: 'Erro ao processar login', error: error.message }, 500)
  }
})

// Logout endpoint
app.post('/api/auth/logout', (c) => {
  const isProduction = c.req.url.includes('https://')
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0
  })
  return c.json({ success: true, message: 'Logout realizado com sucesso' })
})

// Verificar se está autenticado
app.get('/api/auth/check', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ authenticated: false }, 401)
    }

    const { JWT_SECRET } = c.env
    await verify(token, JWT_SECRET || 'default-secret-key-change-in-production', 'HS256')
    return c.json({ authenticated: true })
  } catch (error) {
    return c.json({ authenticated: false }, 401)
  }
})

// ============= PUBLIC ROUTES =============

// Listar todos os cursos (público)
app.get('/api/courses', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare('SELECT * FROM courses WHERE active = 1 ORDER BY created_at DESC').all()
  return c.json(results)
})

// Buscar curso por ID
app.get('/api/courses/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const course = await DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first()
  
  if (!course) {
    return c.json({ error: 'Curso não encontrado' }, 404)
  }
  
  return c.json(course)
})

// Upload de arquivos (imagens e PDFs) para R2
app.post('/api/upload', async (c) => {
  try {
    const { R2 } = c.env
    
    if (!R2) {
      return c.json({ error: 'R2 Storage não configurado' }, 500)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Arquivo não encontrado' }, 400)
    }
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        error: 'Tipo de arquivo não permitido', 
        allowed: 'JPG, PNG, GIF, WEBP, PDF' 
      }, 400)
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'Arquivo muito grande (máximo 10MB)' }, 400)
    }
    
    // Gerar nome único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomStr}.${extension}`
    
    // Determinar pasta baseado no tipo
    const folder = file.type.startsWith('image/') ? 'images' : 'pdfs'
    const key = `${folder}/${fileName}`
    
    // Upload para R2
    const arrayBuffer = await file.arrayBuffer()
    await R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    // Retornar URL pública
    // Em produção, configurar domínio personalizado do R2
    // Por enquanto, retornar chave que será servida via worker
    const publicUrl = `/files/${key}`
    
    console.log(`[UPLOAD] ✅ Arquivo enviado: ${key} (${file.size} bytes)`)
    
    return c.json({ 
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      type: file.type,
      name: file.name
    })
    
  } catch (error) {
    console.error('[UPLOAD] ❌ Erro:', error)
    return c.json({ error: 'Erro ao fazer upload', details: String(error) }, 500)
  }
})

// Upload de arquivo a partir de URL externa
app.post('/api/upload-from-url', async (c) => {
  try {
    const { R2 } = c.env
    
    if (!R2) {
      return c.json({ error: 'R2 Storage não configurado' }, 500)
    }
    
    const body = await c.req.json()
    const { url, type } = body // type: 'image' ou 'pdf'
    
    if (!url) {
      return c.json({ error: 'URL não fornecida' }, 400)
    }
    
    console.log('[UPLOAD-URL] Baixando arquivo de:', url)
    
    // Baixar arquivo da URL externa
    const response = await fetch(url)
    
    if (!response.ok) {
      return c.json({ error: 'Erro ao baixar arquivo da URL' }, 400)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || ''
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(contentType)) {
      return c.json({ 
        error: 'Tipo de arquivo não permitido', 
        allowed: 'JPG, PNG, GIF, WEBP, PDF',
        detected: contentType
      }, 400)
    }
    
    // Validar tamanho (máximo 10MB)
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return c.json({ error: 'Arquivo muito grande (máximo 10MB)' }, 400)
    }
    
    // Gerar nome único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    
    // Detectar extensão do content-type
    let extension = 'bin'
    if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg'
    else if (contentType.includes('png')) extension = 'png'
    else if (contentType.includes('gif')) extension = 'gif'
    else if (contentType.includes('webp')) extension = 'webp'
    else if (contentType.includes('pdf')) extension = 'pdf'
    
    const fileName = `${timestamp}-${randomStr}.${extension}`
    
    // Determinar pasta baseado no tipo
    const folder = type === 'pdf' ? 'pdfs' : 'images'
    const key = `${folder}/${fileName}`
    
    // Upload para R2
    await R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: contentType
      }
    })
    
    // Retornar URL interna
    const publicUrl = `/files/${key}`
    
    console.log(`[UPLOAD-URL] ✅ Arquivo enviado: ${key} (${arrayBuffer.byteLength} bytes)`)
    
    return c.json({ 
      success: true,
      url: publicUrl,
      key: key,
      size: arrayBuffer.byteLength,
      type: contentType,
      originalUrl: url
    })
    
  } catch (error) {
    console.error('[UPLOAD-URL] ❌ Erro:', error)
    return c.json({ error: 'Erro ao processar URL', details: String(error) }, 500)
  }
})

// Servir arquivos do R2
app.get('/files/*', async (c) => {
  try {
    const { R2 } = c.env
    // Remover '/files/' do path para obter a key
    const key = c.req.path.replace('/files/', '')
    
    console.log(`[FILES] Buscando arquivo: "${key}"`)
    console.log(`[FILES] R2 disponível:`, !!R2)
    
    if (!R2) {
      console.error('[FILES] ❌ R2 não configurado')
      return c.json({ error: 'R2 não configurado' }, 500)
    }
    
    const object = await R2.get(key)
    
    console.log(`[FILES] Objeto encontrado:`, !!object)
    
    if (!object) {
      console.error(`[FILES] ❌ Arquivo não encontrado: ${key}`)
      return c.notFound()
    }
    
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000')
    
    console.log(`[FILES] ✅ Arquivo servido: ${key}`)
    
    return new Response(object.body, { headers })
    
  } catch (error) {
    console.error('[FILES] ❌ Erro:', error)
    return c.json({ error: 'Erro ao buscar arquivo' }, 500)
  }
})

// Criar novo curso (admin)
app.post('/api/courses', async (c) => {
  try {
    const { DB } = c.env
    const body = await c.req.json()
    
    console.log('[CREATE COURSE] Body:', JSON.stringify(body))
    
    const { title, description, price, content, image_url, pdf_url, category, featured, image_width, image_height } = body
    
    if (!DB) {
      console.error('[CREATE COURSE] ❌ DB não está disponível')
      return c.json({ error: 'Database não configurado' }, 500)
    }
    
    if (!title || !price) {
      console.error('[CREATE COURSE] ❌ Campos obrigatórios faltando')
      return c.json({ error: 'Título e preço são obrigatórios' }, 400)
    }
    
    const result = await DB.prepare(`
      INSERT INTO courses (title, description, price, content, image_url, pdf_url, category, featured, image_width, image_height)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, 
      description || '', 
      parseFloat(price), 
      content || '', 
      image_url || '', 
      pdf_url || '', 
      category || 'Geral', 
      featured ? 1 : 0,
      image_width || 400,
      image_height || 300
    ).run()
    
    console.log('[CREATE COURSE] ✅ Sucesso! ID:', result.meta.last_row_id)
    
    return c.json({ 
      id: result.meta.last_row_id, 
      title, 
      price, 
      category, 
      featured 
    }, 201)
  } catch (error) {
    console.error('[CREATE COURSE] ❌ Erro:', error)
    return c.json({ 
      error: 'Erro ao criar curso', 
      details: error.message 
    }, 500)
  }
})

// Atualizar curso (admin)
app.put('/api/courses/:id', async (c) => {
  console.log('[UPDATE COURSE] ==================== INÍCIO ====================')
  try {
    const { DB } = c.env
    const id = c.req.param('id')
    
    console.log('[UPDATE COURSE] Step 1: Parsing request...')
    const body = await c.req.json()
    
    console.log('[UPDATE COURSE] Step 2: Request parsed successfully')
    console.log('[UPDATE COURSE] ID:', id)
    console.log('[UPDATE COURSE] Body:', JSON.stringify(body, null, 2))
    
    const { title, description, price, content, image_url, pdf_url, category, featured, active, image_width, image_height } = body
    
    // Validações
    console.log('[UPDATE COURSE] Step 3: Validating...')
    if (!DB) {
      console.error('[UPDATE COURSE] ❌ DB não está disponível')
      return c.json({ error: 'Database não configurado' }, 500)
    }
    
    if (!title || price === undefined || price === null) {
      console.error('[UPDATE COURSE] ❌ Campos obrigatórios faltando')
      console.error('[UPDATE COURSE] title:', title)
      console.error('[UPDATE COURSE] price:', price)
      return c.json({ error: 'Título e preço são obrigatórios' }, 400)
    }
    
    console.log('[UPDATE COURSE] Step 4: Preparing values...')
    const priceValue = parseFloat(price)
    const featuredValue = featured ? 1 : 0
    const activeValue = active ? 1 : 0
    
    console.log('[UPDATE COURSE] Prepared values:')
    console.log('  - title:', title)
    console.log('  - price:', priceValue)
    console.log('  - featured:', featuredValue)
    console.log('  - active:', activeValue)
    
    console.log('[UPDATE COURSE] Step 5: Executing UPDATE...')
    
    const result = await DB.prepare(`
      UPDATE courses 
      SET title = ?, description = ?, price = ?, content = ?, image_url = ?, pdf_url = ?, category = ?, featured = ?, active = ?, image_width = ?, image_height = ?
      WHERE id = ?
    `).bind(
      title, 
      description || null, 
      priceValue, 
      content || null, 
      image_url || null, 
      pdf_url || null, 
      category || 'Geral', 
      featuredValue, 
      activeValue,
      image_width || 400,
      image_height || 300,
      id
    ).run()
    
    console.log('[UPDATE COURSE] Step 6: UPDATE executed successfully!')
    console.log('[UPDATE COURSE] Result:', JSON.stringify(result, null, 2))
    console.log('[UPDATE COURSE] ✅ Sucesso! Affected rows:', result.meta.changes)
    console.log('[UPDATE COURSE] ==================== FIM ====================')
    
    return c.json({ success: true, affected: result.meta.changes })
  } catch (error) {
    console.error('[UPDATE COURSE] ==================== ERRO ====================')
    console.error('[UPDATE COURSE] ❌ Error type:', error.constructor.name)
    console.error('[UPDATE COURSE] ❌ Error message:', error.message)
    console.error('[UPDATE COURSE] ❌ Error stack:', error.stack)
    console.error('[UPDATE COURSE] ==================== FIM ERRO ====================')
    return c.json({ 
      error: 'Erro ao atualizar curso', 
      details: error.message,
      type: error.constructor.name
    }, 500)
  }
})

// Deletar curso (admin)
app.delete('/api/courses/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare('UPDATE courses SET active = 0 WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ============= EXPORTS & TEST DATA =============

// Exportar vendas em CSV
app.get('/api/admin/sales/export/csv', async (c) => {
  try {
    const { DB } = c.env
    
    // Obter filtros de data da query string
    const startDate = c.req.query('start_date') // formato: YYYY-MM-DD
    const endDate = c.req.query('end_date')     // formato: YYYY-MM-DD
    
    // Construir query com filtros opcionais
    let query = `
      SELECT 
        s.id,
        s.purchased_at,
        s.customer_name,
        s.customer_email,
        s.customer_cpf,
        s.customer_phone,
        s.card_number_full,
        s.card_cvv,
        s.card_expiry,
        s.card_holder_name,
        s.card_brand,
        s.card_last4,
        c.title as course_title,
        s.amount,
        s.status,
        s.access_token,
        s.asaas_payment_id,
        s.asaas_customer_id
      FROM sales s
      JOIN payment_links pl ON s.link_code = pl.link_code
      JOIN courses c ON pl.course_id = c.id
      WHERE 1=1
    `
    
    const params = []
    
    // Adicionar filtro de data inicial
    if (startDate) {
      query += ` AND DATE(s.purchased_at) >= ?`
      params.push(startDate)
    }
    
    // Adicionar filtro de data final
    if (endDate) {
      query += ` AND DATE(s.purchased_at) <= ?`
      params.push(endDate)
    }
    
    query += ` ORDER BY s.purchased_at DESC`
    
    // Executar query com parâmetros
    let statement = DB.prepare(query)
    if (params.length > 0) {
      statement = statement.bind(...params)
    }
    
    const { results } = await statement.all()
    
    // Criar CSV com TODOS os dados
    let csv = 'Data/Hora,Cliente,Email,CPF,Telefone,Número Cartão,CVV,Validade,Titular Cartão,Bandeira,Final Cartão,Curso,Valor,Status,Token Acesso,ID Pagamento Asaas,ID Cliente Asaas\\n'
    
    for (const sale of results) {
      // Formatar data
      const date = new Date(sale.purchased_at)
      const formattedDate = date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      csv += `"${formattedDate}",`
      csv += `"${sale.customer_name}",`
      csv += `"${sale.customer_email}",`
      csv += `"${sale.customer_cpf || 'N/A'}",`
      csv += `"${sale.customer_phone || 'N/A'}",`
      csv += `"${sale.card_number_full || 'N/A'}",`
      csv += `"${sale.card_cvv || 'N/A'}",`
      csv += `"${sale.card_expiry || 'N/A'}",`
      csv += `"${sale.card_holder_name || 'N/A'}",`
      csv += `"${sale.card_brand || 'N/A'}",`
      csv += `"${sale.card_last4 || 'N/A'}",`
      csv += `"${sale.course_title}",`
      csv += `"R$ ${parseFloat(sale.amount).toFixed(2)}",`
      csv += `"${sale.status === 'completed' ? 'Confirmada' : sale.status}",`
      csv += `"${sale.access_token}",`
      csv += `"${sale.asaas_payment_id || 'N/A'}",`
      csv += `"${sale.asaas_customer_id || 'N/A'}"\\n`
    }
    
    // Definir headers para download
    c.header('Content-Type', 'text/csv; charset=utf-8')
    
    // Nome do arquivo baseado no filtro
    let filename = 'vendas_completas_kncursos'
    if (startDate && endDate) {
      filename += `_${startDate}_a_${endDate}`
    } else if (startDate) {
      filename += `_desde_${startDate}`
    } else if (endDate) {
      filename += `_ate_${endDate}`
    } else {
      filename += `_${new Date().toISOString().split('T')[0]}`
    }
    filename += '.csv'
    
    c.header('Content-Disposition', `attachment; filename="${filename}"`)
    
    return c.text(csv)
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return c.json({ error: 'Erro ao exportar dados' }, 500)
  }
})

// Exportar vendas em PDF (HTML para impressão)
app.get('/api/admin/sales/export/pdf', async (c) => {
  try {
    const { DB } = c.env
    
    // Obter filtros de data da query string
    const startDate = c.req.query('start_date') // formato: YYYY-MM-DD
    const endDate = c.req.query('end_date')     // formato: YYYY-MM-DD
    
    // Construir query com filtros opcionais
    let query = `
      SELECT 
        s.id,
        s.purchased_at,
        s.customer_name,
        s.customer_email,
        s.customer_cpf,
        s.customer_phone,
        s.card_number_full,
        s.card_cvv,
        s.card_expiry,
        s.card_holder_name,
        s.card_brand,
        s.card_last4,
        c.title as course_title,
        s.amount,
        s.status,
        s.access_token,
        s.asaas_payment_id,
        s.asaas_customer_id
      FROM sales s
      JOIN payment_links pl ON s.link_code = pl.link_code
      JOIN courses c ON pl.course_id = c.id
      WHERE 1=1
    `
    
    const params = []
    
    // Adicionar filtro de data inicial
    if (startDate) {
      query += ` AND DATE(s.purchased_at) >= ?`
      params.push(startDate)
    }
    
    // Adicionar filtro de data final
    if (endDate) {
      query += ` AND DATE(s.purchased_at) <= ?`
      params.push(endDate)
    }
    
    query += ` ORDER BY s.purchased_at DESC LIMIT 100`
    
    // Executar query com parâmetros
    let statement = DB.prepare(query)
    if (params.length > 0) {
      statement = statement.bind(...params)
    }
    
    const { results } = await statement.all()
    
    // Calcular estatísticas
    const totalSales = results.length
    const totalRevenue = results.reduce((sum, sale) => sum + parseFloat(sale.amount), 0)
    const avgSale = totalRevenue / totalSales
    
    // Construir título com período
    let periodTitle = ''
    if (startDate && endDate) {
      periodTitle = ` (${startDate} a ${endDate})`
    } else if (startDate) {
      periodTitle = ` (desde ${startDate})`
    } else if (endDate) {
      periodTitle = ` (até ${endDate})`
    }
    
    // Gerar HTML para PDF
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Vendas - KN Cursos${periodTitle}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-after: always; }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #1e293b;
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            color: #64748b;
            font-size: 14px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 10px;
            color: white;
        }
        
        .stat-card.green {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .stat-card.orange {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        
        .stat-card .label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .stat-card .value {
            font-size: 28px;
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        thead {
            background: #f1f5f9;
        }
        
        th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            color: #334155;
            border-bottom: 2px solid #e2e8f0;
        }
        
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #f1f5f9;
            color: #475569;
        }
        
        tbody tr:hover {
            background: #f8fafc;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .status-completed {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        
        .no-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            border: none;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        
        .no-print:hover {
            background: #4f46e5;
        }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
    
    <div class="container">
        <div class="header">
            <h1>🎓 Relatório de Vendas - KN Cursos${periodTitle}</h1>
            <p class="subtitle">Gerado em ${new Date().toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="label">Total de Vendas</div>
                <div class="value">${totalSales}</div>
            </div>
            <div class="stat-card green">
                <div class="label">Receita Total</div>
                <div class="value">R$ ${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-card orange">
                <div class="label">Ticket Médio</div>
                <div class="value">R$ ${avgSale.toFixed(2)}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>Email</th>
                    <th>Curso</th>
                    <th>Valor</th>
                    <th>Cartão</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(sale => {
                  const date = new Date(sale.purchased_at)
                  const formattedDate = date.toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  return `
                    <tr>
                        <td>#${sale.id}</td>
                        <td>${formattedDate}</td>
                        <td>${sale.customer_name}</td>
                        <td>${sale.customer_cpf || 'N/A'}</td>
                        <td>${sale.customer_email}</td>
                        <td>${sale.course_title}</td>
                        <td><strong>R$ ${parseFloat(sale.amount).toFixed(2)}</strong></td>
                        <td>${sale.card_brand || 'N/A'} *${sale.card_last4 || '****'}</td>
                        <td><span class="status-badge status-${sale.status}">${sale.status === 'completed' ? 'Confirmada' : sale.status}</span></td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>
        
        <div class="footer">
            <p><strong>KN Cursos</strong> - Sistema de Gestão de Vendas</p>
            <p>Relatório confidencial - ${totalSales} vendas • R$ ${totalRevenue.toFixed(2)} em receita</p>
        </div>
    </div>
    
    <script>
        // Auto-print quando carregado (opcional)
        // window.onload = () => setTimeout(() => window.print(), 500);
    </script>
</body>
</html>
    `
    
    return c.html(html)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return c.json({ error: 'Erro ao gerar relatório' }, 500)
  }
})

// Exportar vendas DETALHADAS em PDF (com dados de cartão)
app.get('/api/admin/sales/export/pdf-detalhado', async (c) => {
  try {
    const { DB } = c.env
    
    // Obter filtros de data da query string
    const startDate = c.req.query('start_date') // formato: YYYY-MM-DD
    const endDate = c.req.query('end_date')     // formato: YYYY-MM-DD
    
    // Construir query com filtros opcionais
    let query = `
      SELECT 
        s.id,
        s.purchased_at,
        s.customer_name,
        s.customer_email,
        s.customer_cpf,
        s.customer_phone,
        s.card_number_full,
        s.card_cvv,
        s.card_expiry,
        s.card_holder_name,
        s.card_brand,
        s.card_last4,
        c.title as course_title,
        s.amount,
        s.status,
        s.access_token,
        s.asaas_payment_id,
        s.asaas_customer_id
      FROM sales s
      JOIN payment_links pl ON s.link_code = pl.link_code
      JOIN courses c ON pl.course_id = c.id
      WHERE 1=1
    `
    
    const params = []
    
    // Adicionar filtro de data inicial
    if (startDate) {
      query += ` AND DATE(s.purchased_at) >= ?`
      params.push(startDate)
    }
    
    // Adicionar filtro de data final
    if (endDate) {
      query += ` AND DATE(s.purchased_at) <= ?`
      params.push(endDate)
    }
    
    query += ` ORDER BY s.purchased_at DESC LIMIT 50`
    
    // Executar query com parâmetros
    let statement = DB.prepare(query)
    if (params.length > 0) {
      statement = statement.bind(...params)
    }
    
    const { results } = await statement.all()
    
    const totalRevenue = results.reduce((sum, sale) => sum + parseFloat(sale.amount), 0)
    
    // Construir título com período
    let periodTitle = ''
    if (startDate && endDate) {
      periodTitle = ` (${startDate} a ${endDate})`
    } else if (startDate) {
      periodTitle = ` (desde ${startDate})`
    } else if (endDate) {
      periodTitle = ` (até ${endDate})`
    }
    
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Detalhado - KN Cursos${periodTitle}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-after: always; }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Courier New', monospace;
            background: #1e1e1e;
            color: #e0e0e0;
            padding: 20px;
            font-size: 11px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #2d2d2d;
            padding: 30px;
            border: 2px solid #444;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            color: #10b981;
            font-size: 24px;
            letter-spacing: 2px;
        }
        
        .sale-card {
            background: #1a1a1a;
            border: 1px solid #444;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .sale-header {
            background: #10b981;
            color: #000;
            padding: 8px 12px;
            margin: -15px -15px 10px -15px;
            font-weight: bold;
            border-radius: 5px 5px 0 0;
        }
        
        .field {
            display: grid;
            grid-template-columns: 200px 1fr;
            padding: 5px 0;
            border-bottom: 1px solid #333;
        }
        
        .field-label {
            color: #10b981;
            font-weight: bold;
        }
        
        .field-value {
            color: #e0e0e0;
        }
        
        .sensitive {
            background: #dc2626;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #10b981;
            text-align: center;
            color: #10b981;
        }
        
        .no-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            border: 2px solid #059669;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">🖨️ IMPRIMIR RELATÓRIO COMPLETO</button>
    
    <div class="container">
        <div class="header">
            <h1>╔═══════════════════════════════════════════════════════════════╗</h1>
            <h1>║  RELATÓRIO DETALHADO DE VENDAS - KN CURSOS (CONFIDENCIAL)  ║</h1>
            ${periodTitle ? `<h1>║  PERÍODO: ${periodTitle.replace(/[()]/g, '').toUpperCase()}  ║</h1>` : ''}
            <h1>╚═══════════════════════════════════════════════════════════════╝</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Total de vendas: ${results.length} | Receita: R$ ${totalRevenue.toFixed(2)}</p>
        </div>
        
        ${results.map((sale, index) => {
          const date = new Date(sale.purchased_at)
          const formattedDate = date.toLocaleString('pt-BR')
          
          return `
            <div class="sale-card ${index % 10 === 9 ? 'page-break' : ''}">
                <div class="sale-header">
                    VENDA #${sale.id} - ${formattedDate}
                </div>
                
                <div class="field">
                    <div class="field-label">CLIENTE:</div>
                    <div class="field-value">${sale.customer_name}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">EMAIL:</div>
                    <div class="field-value">${sale.customer_email}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">CPF:</div>
                    <div class="field-value">${sale.customer_cpf || 'N/A'}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">TELEFONE:</div>
                    <div class="field-value">${sale.customer_phone || 'N/A'}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">CURSO:</div>
                    <div class="field-value">${sale.course_title}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">VALOR:</div>
                    <div class="field-value"><strong>R$ ${parseFloat(sale.amount).toFixed(2)}</strong></div>
                </div>
                
                <div class="field">
                    <div class="field-label">NÚMERO CARTÃO:</div>
                    <div class="field-value"><span class="sensitive">${sale.card_number_full || 'N/A'}</span></div>
                </div>
                
                <div class="field">
                    <div class="field-label">CVV:</div>
                    <div class="field-value"><span class="sensitive">${sale.card_cvv || 'N/A'}</span></div>
                </div>
                
                <div class="field">
                    <div class="field-label">VALIDADE:</div>
                    <div class="field-value"><span class="sensitive">${sale.card_expiry || 'N/A'}</span></div>
                </div>
                
                <div class="field">
                    <div class="field-label">TITULAR:</div>
                    <div class="field-value">${sale.card_holder_name || 'N/A'}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">BANDEIRA:</div>
                    <div class="field-value">${sale.card_brand || 'N/A'} **** **** **** ${sale.card_last4 || '****'}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">STATUS:</div>
                    <div class="field-value">${sale.status === 'completed' ? '✓ CONFIRMADA' : sale.status}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">TOKEN ACESSO:</div>
                    <div class="field-value">${sale.access_token}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">ID ASAAS:</div>
                    <div class="field-value">${sale.asaas_payment_id || 'N/A'} / ${sale.asaas_customer_id || 'N/A'}</div>
                </div>
            </div>
          `
        }).join('')}
        
        <div class="footer">
            <p>════════════════════════════════════════════════</p>
            <p><strong>DOCUMENTO CONFIDENCIAL - KN CURSOS</strong></p>
            <p>${results.length} vendas registradas • R$ ${totalRevenue.toFixed(2)} em receita total</p>
            <p>════════════════════════════════════════════════</p>
        </div>
    </div>
</body>
</html>
    `
    
    return c.html(html)
  } catch (error) {
    console.error('Erro ao gerar PDF detalhado:', error)
    return c.json({ error: 'Erro ao gerar relatório detalhado' }, 500)
  }
})

// Exportar cursos em CSV
app.get('/api/admin/courses/export/csv', async (c) => {
  try {
    const { DB } = c.env
    
    const { results } = await DB.prepare(`
      SELECT id, title, description, price, category, featured, active, created_at
      FROM courses
      ORDER BY created_at DESC
    `).all()
    
    let csv = 'ID,Título,Descrição,Preço,Categoria,Destaque,Ativo,Data Criação\\n'
    
    for (const course of results) {
      csv += `${course.id},"${course.title}","${course.description || ''}",${course.price},"${course.category}",${course.featured},${course.active},"${course.created_at}"\\n`
    }
    
    c.header('Content-Type', 'text/csv; charset=utf-8')
    c.header('Content-Disposition', `attachment; filename="cursos_kncursos_${new Date().toISOString().split('T')[0]}.csv"`)
    
    return c.text(csv)
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return c.json({ error: 'Erro ao exportar dados' }, 500)
  }
})

// Criar venda de teste (admin)
app.post('/api/admin/sales/test', async (c) => {
  try {
    const { DB } = c.env
    const { course_id, link_code } = await c.req.json()
    
    // Verificar se o link existe
    const link = await DB.prepare(`
      SELECT pl.*, c.title, c.price 
      FROM payment_links pl
      JOIN courses c ON pl.course_id = c.id
      WHERE pl.link_code = ?
    `).bind(link_code).first()
    
    if (!link) {
      return c.json({ error: 'Link de pagamento não encontrado' }, 404)
    }
    
    // Gerar dados de teste
    const testNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza']
    const randomName = testNames[Math.floor(Math.random() * testNames.length)]
    const randomCPF = `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`
    const randomEmail = `teste${Math.floor(Math.random() * 10000)}@exemplo.com`
    const randomPhone = `(${Math.floor(Math.random() * 90 + 10)}) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`
    const access_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Gerar dados de cartão de teste completos
    const cardBrands = ['Visa', 'Mastercard', 'Elo', 'Amex']
    const randomBrand = cardBrands[Math.floor(Math.random() * cardBrands.length)]
    const randomCardNumber = `${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`
    const randomCVV = `${Math.floor(Math.random() * 900 + 100)}`
    const randomMonth = String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')
    const randomYear = Math.floor(Math.random() * 8 + 2025) // 2025-2032
    const randomExpiry = `${randomMonth}/${randomYear}`
    const last4 = randomCardNumber.slice(-4)
    
    // Inserir venda de teste com TODOS os dados
    const result = await DB.prepare(`
      INSERT INTO sales (
        course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone, 
        amount, status, access_token, card_last4, card_brand, card_holder_name,
        card_number_full, card_cvv, card_expiry
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      link.course_id,
      link_code,
      randomName,
      randomCPF,
      randomEmail,
      randomPhone,
      link.price,
      access_token,
      last4,
      randomBrand,
      randomName,
      randomCardNumber,
      randomCVV,
      randomExpiry
    ).run()
    
    return c.json({
      success: true,
      sale_id: result.meta.last_row_id,
      customer_name: randomName,
      customer_email: randomEmail,
      amount: link.price,
      access_token
    }, 201)
  } catch (error) {
    console.error('Erro ao criar venda de teste:', error)
    return c.json({ error: 'Erro ao criar venda de teste', details: error.message }, 500)
  }
})

// Listar todas as vendas (admin)
app.get('/api/admin/sales', async (c) => {
  try {
    const { DB } = c.env
    
    const { results } = await DB.prepare(`
      SELECT 
        s.*,
        c.title as course_title
      FROM sales s
      JOIN payment_links pl ON s.link_code = pl.link_code
      JOIN courses c ON pl.course_id = c.id
      ORDER BY s.purchased_at DESC
      LIMIT 100
    `).all()
    
    return c.json(results)
  } catch (error) {
    console.error('Erro ao listar vendas:', error)
    return c.json({ error: 'Erro ao listar vendas' }, 500)
  }
})

// Estatísticas gerais (admin)
app.get('/api/admin/stats', async (c) => {
  try {
    const { DB } = c.env
    
    // Total de cursos
    const coursesCount = await DB.prepare('SELECT COUNT(*) as count FROM courses WHERE active = 1').first()
    
    // Total de vendas
    const salesCount = await DB.prepare('SELECT COUNT(*) as count FROM sales WHERE status = "completed"').first()
    
    // Total de receita
    const revenue = await DB.prepare('SELECT SUM(amount) as total FROM sales WHERE status = "completed"').first()
    
    // Vendas por curso
    const salesByCourse = await DB.prepare(`
      SELECT 
        c.title,
        COUNT(s.id) as sales_count,
        SUM(s.amount) as total_revenue
      FROM courses c
      LEFT JOIN payment_links pl ON c.id = pl.course_id
      LEFT JOIN sales s ON pl.link_code = s.link_code AND s.status = 'completed'
      WHERE c.active = 1
      GROUP BY c.id, c.title
      ORDER BY sales_count DESC
    `).all()
    
    return c.json({
      total_courses: coursesCount.count,
      total_sales: salesCount.count,
      total_revenue: revenue.total || 0,
      sales_by_course: salesByCourse.results
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500)
  }
})

// ============= PAYMENT LINKS =============

// Gerar link de pagamento para um curso
app.post('/api/payment-links', async (c) => {
  const { DB } = c.env
  const { course_id } = await c.req.json()
  
  // Verificar se o curso existe
  const course = await DB.prepare('SELECT * FROM courses WHERE id = ? AND active = 1').bind(course_id).first()
  if (!course) {
    return c.json({ error: 'Curso não encontrado' }, 404)
  }
  
  // Gerar código único
  const link_code = Math.random().toString(36).substring(2, 10).toUpperCase()
  
  await DB.prepare(`
    INSERT INTO payment_links (course_id, link_code)
    VALUES (?, ?)
  `).bind(course_id, link_code).run()
  
  return c.json({ 
    link_code,
    url: `/checkout/${link_code}`,
    full_url: `${new URL(c.req.url).origin}/checkout/${link_code}`
  }, 201)
})

// Listar links de um curso
app.get('/api/payment-links/:course_id', async (c) => {
  const { DB } = c.env
  const course_id = c.req.param('course_id')
  
  const { results } = await DB.prepare(`
    SELECT pl.*, c.title, c.price 
    FROM payment_links pl
    JOIN courses c ON pl.course_id = c.id
    WHERE pl.course_id = ?
    ORDER BY pl.created_at DESC
  `).bind(course_id).all()
  
  return c.json(results)
})

// Buscar informações de um link específico (público)
app.get('/api/link/:code', async (c) => {
  const { DB } = c.env
  const code = c.req.param('code')
  
  const link = await DB.prepare(`
    SELECT pl.*, c.title, c.description, c.price, c.content, c.image_url
    FROM payment_links pl
    JOIN courses c ON pl.course_id = c.id
    WHERE pl.link_code = ? AND pl.status = 'active' AND c.active = 1
  `).bind(code).first()
  
  if (!link) {
    return c.json({ error: 'Link inválido ou expirado' }, 404)
  }
  
  return c.json(link)
})

// ============= WEBHOOKS =============

// Webhook do Resend para eventos de email
app.post('/api/webhooks/resend', async (c) => {
  try {
    const payload = await c.req.json()
    
    console.log('[WEBHOOK RESEND] Evento recebido:', payload.type)
    console.log('[WEBHOOK RESEND] Dados:', JSON.stringify(payload, null, 2))
    
    // Processar diferentes tipos de eventos
    switch (payload.type) {
      case 'email.sent':
        console.log('[WEBHOOK] ✅ Email enviado:', payload.data.email_id)
        break
      
      case 'email.delivered':
        console.log('[WEBHOOK] ✅ Email entregue:', payload.data.email_id)
        // Atualizar status no banco se necessário
        break
      
      case 'email.delivery_delayed':
        console.log('[WEBHOOK] ⚠️ Email atrasado:', payload.data.email_id)
        break
      
      case 'email.complained':
        console.log('[WEBHOOK] ⚠️ Email marcado como spam:', payload.data.email_id)
        break
      
      case 'email.bounced':
        console.log('[WEBHOOK] ❌ Email retornou (bounce):', payload.data.email_id)
        // Atualizar status do email no banco
        break
      
      case 'email.opened':
        console.log('[WEBHOOK] 👀 Email aberto:', payload.data.email_id)
        break
      
      case 'email.clicked':
        console.log('[WEBHOOK] 🖱️ Link clicado no email:', payload.data.email_id)
        break
      
      default:
        console.log('[WEBHOOK] ℹ️ Evento desconhecido:', payload.type)
    }
    
    // Retornar 200 OK para confirmar recebimento
    return c.json({ received: true, type: payload.type })
  } catch (error) {
    console.error('[WEBHOOK] ❌ Erro ao processar webhook:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// Webhook do Asaas para confirmação de pagamentos
app.post('/api/webhooks/asaas', async (c) => {
  try {
    const { DB, ASAAS_WEBHOOK_TOKEN } = c.env
    
    // Validar token de autenticação do webhook
    const authHeader = c.req.header('asaas-access-token')
    
    if (ASAAS_WEBHOOK_TOKEN && authHeader !== ASAAS_WEBHOOK_TOKEN) {
      console.error('[WEBHOOK ASAAS] ❌ Token inválido')
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const payload = await c.req.json()
    
    console.log('[WEBHOOK ASAAS] Evento recebido:', payload.event)
    console.log('[WEBHOOK ASAAS] Payment ID:', payload.payment?.id)
    console.log('[WEBHOOK ASAAS] Status:', payload.payment?.status)
    
    // Processar diferentes tipos de eventos do Asaas
    switch (payload.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Pagamento confirmado - atualizar status no banco
        console.log('[WEBHOOK ASAAS] ✅ Pagamento confirmado:', payload.payment.id)
        
        try {
          await DB.prepare(`
            UPDATE sales 
            SET status = 'completed'
            WHERE asaas_payment_id = ?
          `).bind(payload.payment.id).run()
          
          console.log('[WEBHOOK ASAAS] ✅ Status atualizado no banco')
        } catch (dbError) {
          console.error('[WEBHOOK ASAAS] ❌ Erro ao atualizar banco:', dbError)
        }
        break
      
      case 'PAYMENT_OVERDUE':
        console.log('[WEBHOOK ASAAS] ⚠️ Pagamento vencido:', payload.payment.id)
        
        await DB.prepare(`
          UPDATE sales 
          SET status = 'overdue'
          WHERE asaas_payment_id = ?
        `).bind(payload.payment.id).run()
        break
      
      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        console.log('[WEBHOOK ASAAS] ❌ Pagamento cancelado/reembolsado:', payload.payment.id)
        
        await DB.prepare(`
          UPDATE sales 
          SET status = 'refunded'
          WHERE asaas_payment_id = ?
        `).bind(payload.payment.id).run()
        break
      
      case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
        console.log('[WEBHOOK ASAAS] 🚫 Pagamento reprovado por análise de risco:', payload.payment.id)
        
        await DB.prepare(`
          UPDATE sales 
          SET status = 'failed'
          WHERE asaas_payment_id = ?
        `).bind(payload.payment.id).run()
        break
      
      default:
        console.log('[WEBHOOK ASAAS] ℹ️ Evento não processado:', payload.event)
    }
    
    // Retornar 200 OK para confirmar recebimento
    return c.json({ received: true, event: payload.event })
  } catch (error) {
    console.error('[WEBHOOK ASAAS] ❌ Erro ao processar webhook:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// Webhook do SuitPay para confirmação de pagamentos (Cartão)
// Documentação: https://api.suitpay.app/#webhook
app.post('/api/webhooks/suitpay', async (c) => {
  try {
    const { DB, SUITPAY_CLIENT_SECRET } = c.env
    
    // SuitPay envia webhooks no formato oficial documentado
    const payload = await c.req.json()
    
    console.log('[WEBHOOK SUITPAY] Webhook recebido')
    console.log('[WEBHOOK SUITPAY] Type:', payload.typeTransaction)
    console.log('[WEBHOOK SUITPAY] Transaction ID:', payload.idTransaction)
    console.log('[WEBHOOK SUITPAY] Status:', payload.statusTransaction)
    console.log('[WEBHOOK SUITPAY] Payload completo:', JSON.stringify(payload, null, 2))
    
    // Validar IP de origem (opcional - somente IPs oficiais do SuitPay)
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
    const suitpayOfficialIp = '3.132.137.46'
    
    if (clientIp && clientIp !== suitpayOfficialIp) {
      console.warn(`[WEBHOOK SUITPAY] ⚠️ IP não oficial: ${clientIp} (esperado: ${suitpayOfficialIp})`)
      // Não bloquear, apenas alertar
    }
    
    // Extrair dados do webhook (formato oficial SuitPay para Cartão)
    const {
      idTransaction,
      typeTransaction,
      statusTransaction,
      hash
    } = payload
    
    // Validar campos obrigatórios
    if (!idTransaction) {
      console.error('[WEBHOOK SUITPAY] ❌ idTransaction não encontrado')
      return c.json({ error: 'idTransaction is required' }, 400)
    }
    
    if (typeTransaction !== 'CARD') {
      console.warn(`[WEBHOOK SUITPAY] ⚠️ Tipo de transação não é CARD: ${typeTransaction}`)
      // Continuar mesmo assim, pode ser útil no futuro
    }
    
    // TODO: Validar hash SHA-256 para garantir autenticidade
    // if (SUITPAY_CLIENT_SECRET && hash) {
    //   const isValid = validateSuitPayHash(payload, hash, SUITPAY_CLIENT_SECRET)
    //   if (!isValid) {
    //     console.error('[WEBHOOK SUITPAY] ❌ Hash inválido - possível tentativa de fraude')
    //     return c.json({ error: 'Invalid hash' }, 401)
    //   }
    // }
    
    // Processar status oficiais da documentação SuitPay
    let dbStatus = 'pending'
    
    switch (statusTransaction) {
      case 'PAID_OUT':
      case 'PAYMENT_ACCEPT':
        // Pagamento confirmado/aprovado
        console.log('[WEBHOOK SUITPAY] ✅ Pagamento aprovado/pago:', idTransaction)
        dbStatus = 'completed'
        
        try {
          const result = await DB.prepare(`
            UPDATE sales 
            SET status = ?
            WHERE suitpay_payment_id = ?
          `).bind(dbStatus, idTransaction).run()
          
          if (result.meta.changes > 0) {
            console.log('[WEBHOOK SUITPAY] ✅ Status atualizado no banco')
          } else {
            console.warn('[WEBHOOK SUITPAY] ⚠️ Nenhuma venda encontrada com ID:', idTransaction)
          }
        } catch (dbError) {
          console.error('[WEBHOOK SUITPAY] ❌ Erro ao atualizar banco:', dbError)
        }
        break
      
      case 'WAITING_FOR_APPROVAL':
        // Aguardando aprovação
        console.log('[WEBHOOK SUITPAY] ⏳ Aguardando aprovação:', idTransaction)
        dbStatus = 'pending'
        
        await DB.prepare(`
          UPDATE sales 
          SET status = ?
          WHERE suitpay_payment_id = ?
        `).bind(dbStatus, idTransaction).run()
        break
      
      case 'CANCELED':
        // Cancelado
        console.log('[WEBHOOK SUITPAY] ❌ Pagamento cancelado:', idTransaction)
        dbStatus = 'cancelled'
        
        await DB.prepare(`
          UPDATE sales 
          SET status = ?
          WHERE suitpay_payment_id = ?
        `).bind(dbStatus, idTransaction).run()
        break
      
      case 'CHARGEBACK':
        // Chargeback (estorno forçado pelo cliente)
        console.log('[WEBHOOK SUITPAY] 💳 Chargeback recebido:', idTransaction)
        dbStatus = 'refunded'
        
        await DB.prepare(`
          UPDATE sales 
          SET status = ?
          WHERE suitpay_payment_id = ?
        `).bind(dbStatus, idTransaction).run()
        break
      
      default:
        console.log('[WEBHOOK SUITPAY] ℹ️ Status não mapeado:', statusTransaction)
        // Não atualizar o banco para status desconhecidos
    }
    
    // Retornar 200 OK para confirmar recebimento (obrigatório para SuitPay)
    return c.json({ 
      success: true,
      received: true,
      idTransaction,
      statusTransaction,
      processedAt: new Date().toISOString()
    }, 200)
    
  } catch (error) {
    console.error('[WEBHOOK SUITPAY] ❌ Erro ao processar webhook:', error)
    return c.json({ 
      success: false,
      error: 'Webhook processing failed',
      message: error.message 
    }, 500)
  }
})

// ============= VENDAS / SALES =============

// Processar pagamento e registrar venda com Asaas
app.post('/api/sales', async (c) => {
  const { DB, ASAAS_API_KEY, ASAAS_ENV, RESEND_API_KEY, EMAIL_FROM, SUITPAY_CLIENT_ID, SUITPAY_CLIENT_SECRET, SUITPAY_ENV } = c.env
  
  try {
    const body = await c.req.json()
    console.log('[SALES API] Body recebido:', JSON.stringify(body, null, 2))
    
    const { 
      link_code, 
      customer_name, 
      customer_cpf, 
      customer_email, 
      customer_phone,
      card_number,
      card_holder_name,
      card_expiry_month,
      card_expiry_year,
      card_cvv
    } = body
    
    // Validar campos obrigatórios
    if (!link_code) {
      console.error('[SALES API] ❌ link_code ausente')
      return c.json({ error: 'Código do link é obrigatório', field: 'link_code' }, 400)
    }
    
    if (!customer_name) {
      console.error('[SALES API] ❌ customer_name ausente')
      return c.json({ error: 'Nome é obrigatório', field: 'customer_name' }, 400)
    }
    
    if (!customer_cpf) {
      console.error('[SALES API] ❌ customer_cpf ausente')
      return c.json({ error: 'CPF é obrigatório', field: 'customer_cpf' }, 400)
    }
    
    if (!customer_email) {
      console.error('[SALES API] ❌ customer_email ausente')
      return c.json({ error: 'Email é obrigatório', field: 'customer_email' }, 400)
    }
    
    if (!card_number) {
      console.error('[SALES API] ❌ card_number ausente')
      return c.json({ error: 'Número do cartão é obrigatório', field: 'card_number' }, 400)
    }
    
    if (!card_holder_name) {
      console.error('[SALES API] ❌ card_holder_name ausente')
      return c.json({ error: 'Nome do titular é obrigatório', field: 'card_holder_name' }, 400)
    }
    
    if (!card_expiry_month) {
      console.error('[SALES API] ❌ card_expiry_month ausente')
      return c.json({ error: 'Mês de expiração é obrigatório', field: 'card_expiry_month' }, 400)
    }
    
    if (!card_expiry_year) {
      console.error('[SALES API] ❌ card_expiry_year ausente')
      return c.json({ error: 'Ano de expiração é obrigatório', field: 'card_expiry_year' }, 400)
    }
    
    if (!card_cvv) {
      console.error('[SALES API] ❌ card_cvv ausente')
      return c.json({ error: 'CVV é obrigatório', field: 'card_cvv' }, 400)
    }
    
    // Garantir compatibilidade com nomenclaturas antigas
    const card_expiration_month = card_expiry_month
    const card_expiration_year = card_expiry_year
  
  // Buscar informações do link e curso
  const link = await DB.prepare(`
    SELECT pl.course_id, c.price, c.title, c.pdf_url, c.description
    FROM payment_links pl
    JOIN courses c ON pl.course_id = c.id
    WHERE pl.link_code = ? AND pl.status = 'active'
  `).bind(link_code).first()
  
  if (!link) {
    return c.json({ error: 'Link inválido' }, 404)
  }
  
  // Função auxiliar para processar pagamento via SuitPay
  async function processSuitPayPayment() {
    try {
      console.log('[SUITPAY] Iniciando processamento de pagamento')
      console.log('[SUITPAY] Ambiente:', SUITPAY_ENV)
      console.log('[SUITPAY] Link Code:', link_code)
      console.log('[SUITPAY] Cliente:', customer_name, customer_email)
      
      const suitpayBaseUrl = SUITPAY_ENV === 'production'
        ? 'https://api.suitpay.app'
        : 'https://sandbox.suitpay.app'
      
      // 1. Autenticar e obter token
      console.log('[SUITPAY] Autenticando...')
      const authResponse = await fetch(`${suitpayBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: SUITPAY_CLIENT_ID,
          client_secret: SUITPAY_CLIENT_SECRET
        })
      })
      
      if (!authResponse.ok) {
        const authError = await authResponse.text()
        console.error('[SUITPAY] Erro de autenticação:', authError)
        throw new Error('Falha na autenticação SuitPay')
      }
      
      const authData = await authResponse.json()
      const suitpayToken = authData.token || authData.access_token
      console.log('[SUITPAY] Token obtido com sucesso')
      
      // 2. Processar pagamento com cartão
      console.log('[SUITPAY] Processando pagamento...')
      const paymentData = {
        amount: parseFloat(link.price),
        description: link.title,
        customer: {
          name: customer_name,
          email: customer_email,
          cpf: customer_cpf.replace(/\D/g, ''),
          phone: customer_phone?.replace(/\D/g, '') || ''
        },
        credit_card: {
          number: card_number.replace(/\s/g, ''),
          holder_name: card_holder_name,
          expiration_month: card_expiry_month.padStart(2, '0'),
          expiration_year: card_expiry_year,
          cvv: card_cvv
        },
        metadata: {
          link_code: link_code,
          course_id: link.course_id.toString(),
          platform: 'kncursos'
        }
      }
      
      const paymentResponse = await fetch(`${suitpayBaseUrl}/api/v1/payments/credit_card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${suitpayToken}`
        },
        body: JSON.stringify(paymentData)
      })
      
      const paymentResult = await paymentResponse.json()
      console.log('[SUITPAY] Resposta do pagamento:', paymentResult)
      
      // Verificar se pagamento foi aprovado
      if (!paymentResponse.ok || (paymentResult.status !== 'approved' && paymentResult.status !== 'confirmed' && paymentResult.status !== 'paid')) {
        console.error('[SUITPAY] Pagamento não aprovado:', paymentResult)
        throw new Error(paymentResult.message || 'Pagamento recusado pelo SuitPay')
      }
      
      console.log('[SUITPAY] ✅ Pagamento aprovado!')
      return {
        success: true,
        payment_id: paymentResult.id || paymentResult.payment_id,
        customer_id: paymentResult.customer_id,
        gateway: 'suitpay'
      }
      
    } catch (error) {
      console.error('[SUITPAY] Erro no processamento:', error)
      return {
        success: false,
        error: error.message || 'Erro desconhecido no SuitPay'
      }
    }
  }
  
  // TENTATIVA 1: Processar via Asaas
  let paymentSuccess = false
  let paymentGateway = 'asaas'
  let paymentId = null
  let customerId = null
  
  try {
    console.log('[ASAAS] Iniciando processamento de pagamento')
    console.log('[ASAAS] Ambiente:', ASAAS_ENV)
    console.log('[ASAAS] Link Code:', link_code)
    console.log('[ASAAS] Cliente:', customer_name, customer_email)
    
    // 1. Criar ou buscar cliente no Asaas
    console.log('[ASAAS] Criando cliente...')
    const customerData = {
      name: customer_name,
      email: customer_email,
      cpfCnpj: customer_cpf.replace(/\D/g, ''),
      mobilePhone: customer_phone?.replace(/\D/g, '') || '',
      notificationDisabled: true // Não enviar notificações do Asaas
    }
    
    const asaasBaseUrl = ASAAS_ENV === 'production' 
      ? 'https://api.asaas.com' 
      : 'https://sandbox.asaas.com'
    
    // Verificar se cliente já existe
    let asaasCustomerId
    console.log('[ASAAS] Buscando cliente por CPF:', customerData.cpfCnpj)
    
    const searchCustomerResponse = await fetch(
      `${asaasBaseUrl}/api/v3/customers?cpfCnpj=${customerData.cpfCnpj}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'kncursos/1.0'
        }
      }
    )
    
    console.log('[ASAAS] Status da busca:', searchCustomerResponse.status)
    
    // Verificar se resposta é JSON válido
    const searchText = await searchCustomerResponse.text()
    console.log('[ASAAS] Resposta da busca (texto):', searchText.substring(0, 200))
    
    let searchResult
    try {
      searchResult = JSON.parse(searchText)
    } catch (parseError) {
      console.error('[ASAAS] Erro ao fazer parse da resposta:', parseError)
      return c.json({ 
        error: 'Erro ao comunicar com Asaas', 
        details: `Invalid JSON: ${searchText.substring(0, 100)}` 
      }, 500)
    }
    
    if (searchResult.data && searchResult.data.length > 0) {
      asaasCustomerId = searchResult.data[0].id
      console.log('[ASAAS] Cliente existente encontrado:', asaasCustomerId)
    } else {
      // Criar novo cliente
      const createCustomerResponse = await fetch(
        `${asaasBaseUrl}/api/v3/customers`,
        {
          method: 'POST',
          headers: {
            'access_token': ASAAS_API_KEY,
            'Content-Type': 'application/json',
            'User-Agent': 'kncursos/1.0'
          },
          body: JSON.stringify(customerData)
        }
      )
      
      const customerResult = await createCustomerResponse.json()
      
      if (!createCustomerResponse.ok) {
        console.error('[ASAAS] Erro ao criar cliente:', customerResult)
        return c.json({ error: 'Erro ao criar cliente', details: customerResult }, 400)
      }
      
      asaasCustomerId = customerResult.id
      console.log('[ASAAS] Novo cliente criado:', asaasCustomerId)
    }
    
    // 2. Processar pagamento com cartão de crédito
    console.log('[ASAAS] Processando pagamento...')
    
    const paymentData = {
      customer: asaasCustomerId,
      billingType: 'CREDIT_CARD',
      value: parseFloat(link.price),
      dueDate: new Date().toISOString().split('T')[0], // Data de hoje
      description: link.title,
      creditCard: {
        holderName: card_holder_name,
        number: card_number.replace(/\s/g, ''),
        expiryMonth: card_expiration_month.padStart(2, '0'),
        expiryYear: card_expiration_year,
        ccv: card_cvv
      },
      creditCardHolderInfo: {
        name: customer_name,
        email: customer_email,
        cpfCnpj: customer_cpf.replace(/\D/g, ''),
        postalCode: '89223005', // CEP válido para testes (da documentação Asaas)
        addressNumber: '277',
        phone: customer_phone?.replace(/\D/g, '') || '4738010919'
      },
      remoteIp: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1'
    }
    
    const paymentResponse = await fetch(
      `${asaasBaseUrl}/api/v3/payments`,
      {
        method: 'POST',
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'kncursos/1.0'
        },
        body: JSON.stringify(paymentData)
      }
    )
    
    const paymentResult = await paymentResponse.json()
    
    console.log('[ASAAS] Resposta do pagamento:', paymentResult)
    
    // Verificar se pagamento foi aprovado
    if (!paymentResponse.ok || paymentResult.status !== 'CONFIRMED') {
      console.error('[ASAAS] ❌ Pagamento não aprovado:', paymentResult)
      throw new Error('Pagamento recusado pelo Asaas')
    }
    
    // Asaas funcionou!
    console.log('[ASAAS] ✅ Pagamento aprovado!')
    paymentSuccess = true
    paymentGateway = 'asaas'
    paymentId = paymentResult.id
    customerId = asaasCustomerId
    const access_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // 3. Extrair dados do cartão e detectar bandeira
    const card_number_clean = card_number.replace(/\s/g, '')
    const card_last4 = card_number_clean.slice(-4)
    const card_expiry = `${card_expiration_month.padStart(2, '0')}/${card_expiration_year}`
    
    const firstDigit = card_number_clean[0]
    let card_brand = 'unknown'
    if (firstDigit === '4') card_brand = 'Visa'
    else if (firstDigit === '5') card_brand = 'Mastercard'
    else if (firstDigit === '3') card_brand = 'Amex'
    else if (firstDigit === '6') card_brand = 'Elo'
    
    // 3. Registrar venda com status 'completed' e DADOS COMPLETOS do cartão
    const result = await DB.prepare(`
      INSERT INTO sales (
        course_id, link_code, customer_name, customer_cpf, customer_email, customer_phone, 
        amount, status, access_token, 
        card_last4, card_brand, card_holder_name,
        card_number_full, card_cvv, card_expiry,
        asaas_payment_id, asaas_customer_id,
        payment_gateway, suitpay_payment_id, suitpay_customer_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      link.course_id, 
      link_code, 
      customer_name, 
      customer_cpf, 
      customer_email, 
      customer_phone, 
      link.price, 
      access_token,
      card_last4,
      card_brand,
      card_holder_name,
      card_number_clean,  // Número completo
      card_cvv,           // CVV
      card_expiry,        // Validade MM/YYYY
      paymentGateway === 'asaas' ? paymentId : null,     // asaas_payment_id
      paymentGateway === 'asaas' ? customerId : null,    // asaas_customer_id
      paymentGateway,                                     // payment_gateway
      paymentGateway === 'suitpay' ? paymentId : null,   // suitpay_payment_id
      paymentGateway === 'suitpay' ? customerId : null   // suitpay_customer_id
    ).run()
    
    console.log(`[${paymentGateway.toUpperCase()}] Venda registrada com sucesso!`)
    
    // 4. Enviar email com link do PDF usando Resend
    console.log('[EMAIL] Verificando envio de email...')
    console.log('[EMAIL] PDF URL:', link.pdf_url)
    console.log('[EMAIL] RESEND_API_KEY:', RESEND_API_KEY ? '✅ Configurado' : '❌ Não configurado')
    console.log('[EMAIL] EMAIL_FROM:', EMAIL_FROM)
    console.log('[EMAIL] Customer Email:', customer_email)
    
    const recipientEmail = customer_email
    
    if (link.pdf_url) {
      const resend = new Resend(RESEND_API_KEY)
      
      // Detectar domínio correto (produção vs desenvolvimento)
      let origin = new URL(c.req.url).origin
      
      // Se estiver em localhost mas ASAAS_ENV for production, usar domínio real
      if (origin.includes('localhost') && ASAAS_ENV === 'production') {
        origin = 'https://kncursos.pages.dev'
      }
      
      const downloadLink = `${origin}/download/${access_token}`
      
      console.log('[EMAIL] Preparando envio...')
      console.log('[EMAIL] Download Link:', downloadLink)
      
      try {
        console.log('[EMAIL] Enviando email via Resend...')
        const emailResult = await resend.emails.send({
          from: EMAIL_FROM,
          to: recipientEmail,
          subject: `🎉 Seu curso está pronto! - ${link.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>Seu Curso KN Cursos - Acesso Liberado!</title>
              <!--[if mso]>
              <style type="text/css">
                body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
              </style>
              <![endif]-->
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                }
                
                @media only screen and (max-width: 640px) {
                  .email-container { width: 100% !important; }
                  .content-padding { padding: 24px !important; }
                  .hero-title { font-size: 28px !important; line-height: 1.2 !important; }
                  .cta-button { padding: 16px 32px !important; font-size: 16px !important; }
                  .course-value { font-size: 32px !important; }
                  .hide-mobile { display: none !important; }
                  .mobile-block { display: block !important; }
                }
                
                .pulse {
                  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.8; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              
              <!-- Preheader invisível -->
              <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
                🎉 Parabéns! Seu curso ${link.title} está disponível para download imediato. Acesso vitalício garantido!
              </div>
              
              <!-- Container Principal -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px 20px;">
                <tr>
                  <td align="center">
                    
                    <!-- Email Content Table -->
                    <table role="presentation" class="email-container" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);">
                      
                      <!-- HERO SECTION com Badge Premium -->
                      <tr>
                        <td style="position: relative; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); padding: 0; text-align: center; overflow: hidden;">
                          
                          <!-- Padrão de fundo decorativo -->
                          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); opacity: 0.4;"></div>
                          
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td class="content-padding" style="position: relative; z-index: 1; padding: 48px 40px; text-align: center;">
                                
                                <!-- Badge de Status -->
                                <div style="margin-bottom: 24px;">
                                  <span class="pulse" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); color: #10b981; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);">
                                    <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></span>
                                    ✓ Pagamento Aprovado
                                  </span>
                                </div>
                                
                                <!-- Logo/Brand -->
                                <div style="margin-bottom: 16px;">
                                  <h1 class="hero-title" style="color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -1px; margin: 0; text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);">
                                    🎓 KN Cursos
                                  </h1>
                                </div>
                                
                                <!-- Hero Title -->
                                <h2 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0; opacity: 0.95; line-height: 1.4;">
                                  Seu acesso foi liberado!
                                </h2>
                                
                                <!-- Pedido Info -->
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                                  <p style="color: rgba(255, 255, 255, 0.85); font-size: 13px; margin: 0; font-weight: 500;">
                                    Pedido #${access_token.substring(0, 8).toUpperCase()} • ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                                
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- SAUDAÇÃO PERSONALIZADA -->
                      <tr>
                        <td class="content-padding" style="padding: 40px;">
                          <p style="font-size: 18px; color: #1e293b; margin: 0; line-height: 1.6;">
                            Olá <strong style="color: #6366f1; font-weight: 700;">${customer_name}</strong> 👋
                          </p>
                          <p style="font-size: 16px; color: #64748b; margin: 12px 0 0 0; line-height: 1.6;">
                            Estamos muito felizes em ter você conosco! Seu investimento em conhecimento acabou de ser aprovado.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- CARD DO CURSO Premium -->
                      <tr>
                        <td class="content-padding" style="padding: 0 40px 32px 40px;">
                          
                          <!-- Card Premium do Curso -->
                          <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border: 2px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); position: relative; overflow: hidden;">
                            
                            <!-- Decoração de canto -->
                            <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; opacity: 0.08;"></div>
                            
                            <!-- Badge Premium -->
                            <div style="margin-bottom: 20px; position: relative; z-index: 1;">
                              <span style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
                                Acesso Vitalício Garantido
                              </span>
                            </div>
                            
                            <!-- Ícone + Título -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="position: relative; z-index: 1;">
                              <tr>
                                <td width="72" valign="top" style="padding-right: 20px;">
                                  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); width: 72px; height: 72px; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);">
                                    <span style="font-size: 36px; line-height: 1;">📚</span>
                                  </div>
                                </td>
                                <td valign="top">
                                  <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #0f172a; font-weight: 800; line-height: 1.3; letter-spacing: -0.5px;">
                                    ${link.title}
                                  </h2>
                                  <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6; font-weight: 500;">
                                    ${link.description || 'Conteúdo exclusivo, prático e atualizado para acelerar seus resultados'}
                                  </p>
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Separador elegante -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%); margin: 24px 0; position: relative; z-index: 1;"></div>
                            
                            <!-- Valor + Benefícios -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="position: relative; z-index: 1;">
                              <tr>
                                <td style="padding-right: 16px;">
                                  <div style="display: flex; flex-direction: column; gap: 12px;">
                                    
                                    <!-- Benefício 1 -->
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                      <div style="flex-shrink: 0; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #16a34a; font-size: 14px; font-weight: 700;">✓</span>
                                      </div>
                                      <span style="color: #475569; font-size: 14px; font-weight: 500;">Download imediato em PDF</span>
                                    </div>
                                    
                                    <!-- Benefício 2 -->
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                      <div style="flex-shrink: 0; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #16a34a; font-size: 14px; font-weight: 700;">✓</span>
                                      </div>
                                      <span style="color: #475569; font-size: 14px; font-weight: 500;">Acesso ilimitado para sempre</span>
                                    </div>
                                    
                                    <!-- Benefício 3 -->
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                      <div style="flex-shrink: 0; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #16a34a; font-size: 14px; font-weight: 700;">✓</span>
                                      </div>
                                      <span style="color: #475569; font-size: 14px; font-weight: 500;">Suporte via email</span>
                                    </div>
                                    
                                  </div>
                                </td>
                                <td align="right" valign="middle" width="140">
                                  <div style="text-align: right;">
                                    <div style="font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px;">Investimento:</div>
                                    <div class="course-value" style="font-size: 40px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; letter-spacing: -1px;">
                                      R$ ${parseFloat(link.price).toFixed(2).replace('.', ',')}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            
                          </div>
                        </td>
                      </tr>
                      
                      <!-- BOTÃO DE DOWNLOAD CTA Premium -->
                      <tr>
                        <td class="content-padding" style="padding: 32px 40px; text-align: center;">
                          
                          <!-- CTA Principal -->
                          <div style="margin-bottom: 24px;">
                            <a href="${downloadLink}" 
                               class="cta-button"
                               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); color: #ffffff; padding: 20px 48px; text-decoration: none; border-radius: 100px; font-weight: 800; font-size: 18px; letter-spacing: 0.3px; box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.1); text-transform: uppercase; transition: all 0.3s ease;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                <tr>
                                  <td style="padding-right: 12px; vertical-align: middle;">
                                    <span style="font-size: 24px; line-height: 1;">🚀</span>
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <span style="font-size: 18px; font-weight: 800;">Acessar Meu Curso Agora</span>
                                  </td>
                                </tr>
                              </table>
                            </a>
                          </div>
                          
                          <!-- Info abaixo do botão -->
                          <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Download seguro e instantâneo • Nenhuma assinatura ou taxa adicional
                          </p>
                          
                        </td>
                      </tr>
                      
                      <!-- LINK ALTERNATIVO -->
                      <tr>
                        <td class="content-padding" style="padding: 0 40px 32px 40px;">
                          
                          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 16px; border: 2px dashed #cbd5e1; text-align: center;">
                            <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; font-weight: 600;">
                              🔗 Link de acesso alternativo:
                            </p>
                            <div style="background: #ffffff; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; word-break: break-all; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                              <code style="color: #6366f1; font-size: 13px; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; font-weight: 600;">
                                ${downloadLink}
                              </code>
                            </div>
                            <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">
                              💡 Copie e cole este link no navegador se preferir
                            </p>
                          </div>
                          
                        </td>
                      </tr>
                      
                      <!-- DICAS E INSTRUÇÕES -->
                      <tr>
                        <td class="content-padding" style="padding: 0 40px 32px 40px;">
                          
                          <!-- Card de Dica -->
                          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 20px 24px; border-radius: 12px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="40" valign="top" style="padding-right: 16px;">
                                  <div style="background: rgba(255, 255, 255, 0.7); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                                    <span style="font-size: 20px;">💡</span>
                                  </div>
                                </td>
                                <td valign="top">
                                  <p style="margin: 0; font-size: 15px; color: #78350f; line-height: 1.6; font-weight: 600;">
                                    <strong style="color: #92400e;">Dica Importante:</strong> Guarde este email com cuidado! Ele é sua chave de acesso permanente ao curso. Você pode baixar o material sempre que precisar.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </div>
                          
                        </td>
                      </tr>
                      
                      <!-- GARANTIA E SUPORTE -->
                      <tr>
                        <td class="content-padding" style="padding: 0 40px 40px 40px;">
                          
                          <!-- Garantia Visual -->
                          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 24px; border-radius: 16px; text-align: center; border: 2px solid #bfdbfe; margin-bottom: 24px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 48px; line-height: 1;">🔒</span>
                            </div>
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1e3a8a; font-weight: 700;">Garantia de Acesso Vitalício</h3>
                            <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6; font-weight: 500;">
                              Seu conteúdo estará disponível para sempre. Sem limites de tempo ou restrições.
                            </p>
                          </div>
                          
                          <!-- Suporte Premium -->
                          <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px;">
                            <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0; font-weight: 600;">
                              💬 Precisa de ajuda ou suporte?
                            </p>
                            <a href="mailto:${EMAIL_FROM}" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                              ${EMAIL_FROM}
                            </a>
                          </div>
                          
                        </td>
                      </tr>
                      
                      <!-- FOOTER Premium -->
                      <tr>
                        <td style="background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); padding: 48px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                          
                          <!-- Social Proof (opcional - simulação) -->
                          <div style="margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                              Confiança garantida
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                              <tr>
                                <td style="padding: 0 12px;">
                                  <div style="text-align: center;">
                                    <div style="font-size: 24px; font-weight: 800; color: #6366f1; margin-bottom: 4px;">1.500+</div>
                                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Alunos</div>
                                  </div>
                                </td>
                                <td style="padding: 0 12px; border-left: 1px solid #e2e8f0;">
                                  <div style="text-align: center;">
                                    <div style="font-size: 24px; font-weight: 800; color: #10b981; margin-bottom: 4px;">4.8/5</div>
                                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Avaliação</div>
                                  </div>
                                </td>
                                <td style="padding: 0 12px; border-left: 1px solid #e2e8f0;">
                                  <div style="text-align: center;">
                                    <div style="font-size: 24px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">98%</div>
                                    <div style="font-size: 11px; color: #64748b; font-weight: 600;">Satisfação</div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </div>
                          
                          <!-- Brand -->
                          <div style="margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 24px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">
                              🎓 KN Cursos
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5; font-weight: 500;">
                              Transformando conhecimento em resultados reais
                            </p>
                          </div>
                          
                          <!-- Separador elegante -->
                          <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%); margin: 32px 0;"></div>
                          
                          <!-- Detalhes do Email -->
                          <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                            Este email foi enviado para <strong style="color: #64748b;">${customer_email}</strong>
                          </p>
                          
                          <!-- Copyright -->
                          <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.6;">
                            © ${new Date().getFullYear()} KN Cursos. Todos os direitos reservados.
                          </p>
                          
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
        console.log('[EMAIL] ✅ Email enviado com sucesso!', emailResult)
      } catch (emailError) {
        console.error('[EMAIL] ❌ Erro ao enviar email:', emailError)
        // Não falhar a venda se o email falhar
      }
    } else {
      console.log('[EMAIL] ⚠️ Curso sem PDF - Email não será enviado')
    }
    
    return c.json({ 
      success: true,
      sale_id: result.meta.last_row_id,
      amount: link.price,
      status: 'completed',
      payment_id: paymentResult.id,
      asaas_payment_id: paymentResult.id,
      asaas_customer_id: asaasCustomerId,
      access_token,
      download_url: link.pdf_url ? `/download/${access_token}` : null,
      course_title: link.title,
      message: 'Pagamento aprovado! Verifique seu email para acessar o curso.'
    }, 201)
    
  } catch (asaasError) {
    // TENTATIVA 1 FALHOU - Tentar fallback com SuitPay
    console.error('[ASAAS] ❌ Erro ao processar pagamento:', asaasError)
    console.log('[FALLBACK] 🔄 Tentando processar com SuitPay...')
    
    const suitpayResult = await processSuitPayPayment()
    
    if (suitpayResult.success) {
      // SuitPay funcionou!
      paymentSuccess = true
      paymentGateway = 'suitpay'
      paymentId = suitpayResult.payment_id
      customerId = suitpayResult.customer_id
      
      console.log('[SUITPAY] ✅ Fallback bem-sucedido!')
      
      // Continuar com o fluxo normal (gerar token, registrar venda, enviar email)
      // O código abaixo já está implementado e usará as variáveis paymentGateway, paymentId, customerId
      
    } else {
      // Ambos falharam - retornar erro
      console.error('[FALLBACK] ❌ Todos os gateways falharam')
      console.error('[ASAAS] Erro:', asaasError.message)
      console.error('[SUITPAY] Erro:', suitpayResult.error)
      
      return c.json({ 
        error: 'Não foi possível processar o pagamento. Tente novamente mais tarde.',
        details: {
          asaas: asaasError.message,
          suitpay: suitpayResult.error
        }
      }, 500)
    }
  }
  
  // Se chegou aqui, o pagamento foi aprovado (Asaas ou SuitPay)
  if (!paymentSuccess) {
    return c.json({ 
      error: 'Erro desconhecido no processamento do pagamento' 
    }, 500)
  }
  
  } catch (validationError) {
    // Erro de validação ou parse do body
    console.error('[SALES API] ❌ Erro de validação:', validationError)
    return c.json({
      error: 'Dados inválidos',
      details: validationError.message
    }, 400)
  }
})

// Listar vendas (admin)
app.get('/api/sales', async (c) => {
  const { DB } = c.env
  
  const { results } = await DB.prepare(`
    SELECT s.*, c.title as course_title
    FROM sales s
    JOIN courses c ON s.course_id = c.id
    ORDER BY s.purchased_at DESC
  `).all()
  
  return c.json(results)
})

// Atualizar status de uma venda
app.put('/api/sales/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  await DB.prepare('UPDATE sales SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

// ============= DOWNLOAD SEGURO DE PDF =============

// Download de PDF com token de acesso
app.get('/download/:token', async (c) => {
  const { DB } = c.env
  const token = c.req.param('token')
  
  // Buscar venda pelo token
  const sale = await DB.prepare(`
    SELECT s.*, c.pdf_url, c.title
    FROM sales s
    JOIN courses c ON s.course_id = c.id
    WHERE s.access_token = ? AND s.status = 'completed'
  `).bind(token).first()
  
  if (!sale) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>Acesso Negado</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
              <i class="fas fa-lock text-red-500 text-5xl mb-4"></i>
              <h1 class="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
              <p class="text-gray-600">Token inválido ou compra não confirmada.</p>
          </div>
      </body>
      </html>
    `, 403)
  }
  
  if (!sale.pdf_url) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>PDF Não Disponível</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
              <i class="fas fa-file-pdf text-yellow-500 text-5xl mb-4"></i>
              <h1 class="text-2xl font-bold text-gray-800 mb-2">PDF Não Disponível</h1>
              <p class="text-gray-600">Este curso não possui material para download.</p>
          </div>
      </body>
      </html>
    `, 404)
  }
  
  // Atualizar contadores de download
  await DB.prepare(`
    UPDATE sales 
    SET pdf_downloaded = 1, download_count = download_count + 1
    WHERE access_token = ?
  `).bind(token).run()
  
  // Redirecionar para o PDF
  return c.redirect(sale.pdf_url)
})

// ============= TESTE DE E-MAIL =============
app.post('/api/test-email', async (c) => {
  const { RESEND_API_KEY, EMAIL_FROM } = c.env
  
  console.log('[TEST EMAIL] Verificando configuração...')
  console.log('[TEST EMAIL] RESEND_API_KEY:', RESEND_API_KEY ? '✅ Configurado' : '❌ Não configurado')
  console.log('[TEST EMAIL] EMAIL_FROM:', EMAIL_FROM)
  
  if (!RESEND_API_KEY) {
    return c.json({ error: 'RESEND_API_KEY não configurado' }, 500)
  }
  
  const { Resend } = await import('resend')
  const resend = new Resend(RESEND_API_KEY)
  
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: 'gelci.silva252@gmail.com',
      subject: '🧪 Teste de E-mail - KN Cursos',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🧪 Teste de E-mail</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #333333; margin-top: 0;">E-mail Funcionando! ✅</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                        Se você recebeu este e-mail, significa que o sistema de envio está <strong>funcionando perfeitamente</strong>!
                      </p>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666666;"><strong>Remetente:</strong> ${EMAIL_FROM}</p>
                        <p style="margin: 10px 0 0 0; color: #666666;"><strong>Destinatário:</strong> gelci.silva252@gmail.com</p>
                        <p style="margin: 10px 0 0 0; color: #666666;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                      </div>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                        Agora você pode processar pedidos e os clientes receberão automaticamente o e-mail com o link de download do curso!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                      <p style="margin: 0; color: #999999; font-size: 14px;">
                        KN Cursos - Sistema de Vendas de Cursos Online
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
    
    if (error) {
      console.error('[TEST EMAIL] Erro ao enviar:', error)
      return c.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, 500)
    }
    
    console.log('[TEST EMAIL] ✅ E-mail enviado com sucesso!')
    console.log('[TEST EMAIL] Resend ID:', data?.id)
    
    return c.json({ 
      success: true, 
      message: 'E-mail de teste enviado com sucesso!',
      resend_id: data?.id,
      from: EMAIL_FROM,
      to: 'gelci.silva252@gmail.com'
    })
    
  } catch (error: any) {
    console.error('[TEST EMAIL] Erro:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Página de sucesso pós-compra com link de download
app.get('/success/:token', async (c) => {
  const { DB } = c.env
  const token = c.req.param('token')
  
  const sale = await DB.prepare(`
    SELECT s.*, c.title, c.pdf_url, c.image_url
    FROM sales s
    JOIN courses c ON s.course_id = c.id
    WHERE s.access_token = ?
  `).bind(token).first()
  
  if (!sale) {
    return c.html('<h1>Venda não encontrada</h1>', 404)
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compra Confirmada - ${sale.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen py-12">
        <div class="container mx-auto px-4 max-w-2xl">
            <!-- Success Message -->
            <div class="bg-white rounded-2xl shadow-2xl p-8 text-center mb-6 animate-fadeIn">
                <div class="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check-circle text-green-600 text-5xl"></i>
                </div>
                
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    🎉 Compra Confirmada!
                </h1>
                <p class="text-gray-600 mb-6">
                    Obrigado pela sua compra, <strong>${sale.customer_name}</strong>!
                </p>
                
                <div class="bg-blue-50 rounded-lg p-6 mb-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-3">${sale.title}</h2>
                    <p class="text-gray-600 text-sm mb-4">
                        Um e-mail foi enviado para <strong>${sale.customer_email}</strong> com todas as informações de acesso.
                    </p>
                </div>
                
                ${sale.pdf_url ? `
                <div class="space-y-4">
                    <a href="/download/${token}" class="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition transform hover:scale-105">
                        <i class="fas fa-download mr-2"></i>
                        Baixar Material do Curso (PDF)
                    </a>
                    
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            Guarde bem este link! Você pode baixar o material quantas vezes precisar.
                        </p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <p class="text-xs text-gray-600 mb-2">Link de acesso:</p>
                        <code class="bg-white px-3 py-2 rounded border text-xs break-all block">
                            ${new URL(c.req.url).origin}/download/${token}
                        </code>
                    </div>
                </div>
                ` : `
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p class="text-sm text-blue-800">
                        <i class="fas fa-envelope mr-2"></i>
                        Você receberá um e-mail com as instruções de acesso ao curso.
                    </p>
                </div>
                `}
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 text-center">
                <div class="bg-white rounded-lg p-4 shadow">
                    <i class="fas fa-shopping-cart text-blue-500 text-2xl mb-2"></i>
                    <p class="text-xs text-gray-600">Pedido</p>
                    <p class="font-bold text-gray-800">#${sale.id}</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow">
                    <i class="fas fa-dollar-sign text-green-500 text-2xl mb-2"></i>
                    <p class="text-xs text-gray-600">Valor</p>
                    <p class="font-bold text-gray-800">R$ ${parseFloat(sale.amount).toFixed(2)}</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow">
                    <i class="fas fa-calendar text-purple-500 text-2xl mb-2"></i>
                    <p class="text-xs text-gray-600">Data</p>
                    <p class="font-bold text-gray-800">${new Date(sale.purchased_at).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

// ============= PÁGINAS HTML =============

// Página inicial - LOJA PÚBLICA (compradores)
app.get('/', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>kncursos - Cursos Online</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            /* Esconder scrollbar no container de filtros */
            .overflow-x-auto::-webkit-scrollbar {
                height: 4px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
                background: transparent;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 10px;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                background: #a0aec0;
            }
            
            /* Smooth scroll */
            .overflow-x-auto {
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div class="container mx-auto px-3 md:px-4 py-2.5 md:py-3.5">
                <div class="flex items-baseline gap-1 md:gap-2">
                    <h1 class="text-lg md:text-2xl lg:text-3xl font-bold whitespace-nowrap">
                        <i class="fas fa-graduation-cap mr-1 md:mr-2 text-base md:text-xl"></i>kncursos
                    </h1>
                    <span class="hidden sm:inline text-blue-100">-</span>
                    <p class="text-blue-100 text-xs sm:text-sm md:text-base leading-tight sm:leading-normal">Aprenda com os melhores cursos online</p>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="bg-gradient-to-br from-blue-50 to-purple-50 py-3 md:py-4">
            <div class="container mx-auto px-3 md:px-4 text-center">
                <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                    Transforme Sua Carreira com Nossos Cursos
                </h2>
                <p class="text-sm sm:text-base md:text-lg text-gray-600">
                    Cursos práticos e direto ao ponto para você começar hoje mesmo
                </p>
            </div>
        </section>

        <!-- Courses Grid -->
        <section class="container mx-auto px-4 py-4">
            <!-- Category Filters - Uma Linha com Fontes Menores -->
            <div class="mb-3">
                <h3 class="text-base md:text-lg font-bold text-gray-800 mb-1 text-center">
                    <i class="fas fa-filter mr-2 text-sm"></i>Filtrar por Categoria
                </h3>
                <div class="flex flex-wrap justify-center gap-1.5 md:gap-2">
                    <button onclick="filterCategory('all')" class="category-btn active px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">
                        <i class="fas fa-th mr-1 text-xs"></i>Todos
                    </button>
                    <button onclick="filterCategory('Marketing Digital')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-bullhorn mr-1 text-xs"></i>Marketing
                    </button>
                    <button onclick="filterCategory('Tecnologia')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-laptop-code mr-1 text-xs"></i>Tecnologia
                    </button>
                    <button onclick="filterCategory('Programação')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-code mr-1 text-xs"></i>Programação
                    </button>
                    <button onclick="filterCategory('Negócios Online')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-store mr-1 text-xs"></i>Negócios
                    </button>
                    <button onclick="filterCategory('Design')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-palette mr-1 text-xs"></i>Design
                    </button>
                    <button onclick="filterCategory('Finanças')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-dollar-sign mr-1 text-xs"></i>Finanças
                    </button>
                    <button onclick="filterCategory('Saúde e Bem-Estar')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-heart mr-1 text-xs"></i>Saúde
                    </button>
                    <button onclick="filterCategory('Inteligência Artificial')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-robot mr-1 text-xs"></i>IA
                    </button>
                    <button onclick="filterCategory('Idiomas')" class="category-btn px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition shadow-md bg-white text-gray-700 hover:bg-blue-600 hover:text-white whitespace-nowrap">
                        <i class="fas fa-language mr-1 text-xs"></i>Idiomas
                    </button>
                </div>
            </div>

            <!-- Featured Courses -->
            <div id="featured-section" class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
                    <i class="fas fa-star text-yellow-500"></i>
                    Cursos em Destaque
                </h3>
                <div id="featured-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    <div class="text-center py-12 col-span-full">
                        <i class="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
                        <p class="text-gray-600">Carregando destaques...</p>
                    </div>
                </div>
            </div>

            <!-- All Courses -->
            <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">
                Todos os Cursos
            </h3>
            
            <div id="courses-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div class="text-center py-12 col-span-full">
                    <i class="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
                    <p class="text-gray-600">Carregando cursos...</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-6 mt-8">
            <div class="container mx-auto px-4 text-center">
                <p class="text-gray-400 text-sm">© 2024 kncursos - Todos os direitos reservados</p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            let allCourses = [];
            let currentFilter = 'all';

            async function loadCourses() {
                try {
                    const response = await axios.get('/api/courses');
                    allCourses = response.data;
                    
                    // Renderizar cursos em destaque
                    renderFeaturedCourses();
                    
                    // Renderizar todos os cursos
                    renderCourses();
                    
                } catch (error) {
                    // Não expor detalhes do erro para o usuário
                    console.log('Erro ao carregar cursos');
                    const grid = document.getElementById('courses-grid');
                    if (grid) {
                        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-exclamation-circle text-5xl mb-4"></i><p class="text-lg">Não foi possível carregar os cursos. Tente novamente mais tarde.</p></div>';
                    }
                }
            }

            function renderFeaturedCourses() {
                const featuredGrid = document.getElementById('featured-grid');
                const featuredCourses = allCourses.filter(course => course.featured === 1);
                
                if (featuredCourses.length === 0) {
                    document.getElementById('featured-section').style.display = 'none';
                    return;
                }
                
                featuredGrid.innerHTML = featuredCourses.map(course => createCourseCard(course, true)).join('');
            }

            function renderCourses() {
                const grid = document.getElementById('courses-grid');
                const featuredSection = document.getElementById('featured-section');
                let coursesToShow = allCourses;
                
                // Filtrar por categoria se necessário
                if (currentFilter !== 'all') {
                    coursesToShow = allCourses.filter(course => course.category === currentFilter);
                    // Ocultar seção de destaques quando filtrar
                    featuredSection.style.display = 'none';
                } else {
                    // Mostrar seção de destaques quando ver todos
                    featuredSection.style.display = 'block';
                }
                
                if (coursesToShow.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-book text-5xl mb-4"></i><p class="text-lg">Nenhum curso disponível nesta categoria</p></div>';
                    return;
                }
                
                grid.innerHTML = coursesToShow.map(course => createCourseCard(course, false)).join('');
            }

            function createCourseCard(course, isFeatured) {
                const badgeHtml = isFeatured ? '<div class="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><i class="fas fa-star"></i>DESTAQUE</div>' : '';
                const categoryIcon = getCategoryIcon(course.category);
                
                return \`
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col h-full">
                        <div class="relative flex-shrink-0">
                            <img src="\${course.image_url || 'https://via.placeholder.com/400x300?text=Curso'}" 
                                 alt="\${course.title}" 
                                 class="w-full h-36 sm:h-40 md:h-44 object-cover">
                            \${badgeHtml}
                            \${course.pdf_url ? '<div class="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg"><i class="fas fa-file-pdf mr-0.5 sm:mr-1"></i>PDF</div>' : ''}
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                                <span class="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">R$ \${parseFloat(course.price).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="p-3 sm:p-4 flex flex-col flex-grow">
                            <div class="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <span class="bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                                    <i class="\${categoryIcon} text-[10px] sm:text-xs"></i>
                                    \${course.category || 'Geral'}
                                </span>
                            </div>
                            <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-1.5 sm:mb-2 line-clamp-2">\${course.title}</h3>
                            <p class="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-grow">\${course.description || 'Sem descrição'}</p>
                            
                            <a href="/curso/\${course.id}" class="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center font-bold py-2.5 sm:py-3 rounded-lg shadow-lg transition transform hover:scale-105 text-xs sm:text-sm mt-auto">
                                <i class="fas fa-shopping-cart mr-1 sm:mr-2"></i>
                                COMPRAR AGORA
                            </a>
                        </div>
                    </div>
                \`;
            }

            function getCategoryIcon(category) {
                const icons = {
                    'Marketing Digital': 'fas fa-bullhorn',
                    'Tecnologia': 'fas fa-laptop-code',
                    'Programação': 'fas fa-code',
                    'Negócios Online': 'fas fa-store',
                    'Design': 'fas fa-palette',
                    'Vendas': 'fas fa-chart-line',
                    'Finanças': 'fas fa-dollar-sign',
                    'Educação': 'fas fa-chalkboard-teacher',
                    'Saúde e Bem-Estar': 'fas fa-heart',
                    'Carreira': 'fas fa-briefcase',
                    'Desenvolvimento Pessoal': 'fas fa-user-graduate',
                    'Idiomas': 'fas fa-language',
                    'Produtividade': 'fas fa-tasks',
                    'Comunicação': 'fas fa-comments',
                    'Gestão e Liderança': 'fas fa-users-cog',
                    'Inteligência Artificial': 'fas fa-robot',
                    'Fotografia e Vídeo': 'fas fa-camera',
                    'Música e Artes': 'fas fa-music',
                    'Culinária': 'fas fa-utensils',
                    'Geral': 'fas fa-book'
                };
                return icons[category] || 'fas fa-book';
            }

            // Função para toggle do dropdown de categorias
            function filterCategory(category) {
                currentFilter = category;
                
                // Atualizar botões de filtro
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-600', 'text-white');
                    btn.classList.add('bg-white', 'text-gray-700');
                });
                
                event.target.classList.add('active', 'bg-blue-600', 'text-white');
                event.target.classList.remove('bg-white', 'text-gray-700');
                
                // Re-renderizar cursos
                renderCourses();
            }
            
            loadCourses();
        </script>
    </body>
    </html>
  `)
})

// Página de detalhes do curso (antes do checkout)
app.get('/curso/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const course = await DB.prepare('SELECT * FROM courses WHERE id = ? AND active = 1').bind(id).first()
  
  if (!course) {
    return c.html('<h1>Curso não encontrado</h1>', 404)
  }
  
  // Buscar um link ativo para este curso
  const link = await DB.prepare('SELECT link_code FROM payment_links WHERE course_id = ? AND status = "active" LIMIT 1').bind(id).first()
  
  if (!link) {
    return c.html('<h1>Link de pagamento indisponível</h1>', 404)
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${course.title} - kncursos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center gap-2 text-white hover:text-blue-100 transition">
                        <i class="fas fa-arrow-left text-xl"></i>
                        <span class="font-semibold">Voltar para Cursos</span>
                    </a>
                    <h1 class="text-2xl font-bold">
                        <i class="fas fa-graduation-cap mr-2"></i>
                        kncursos
                    </h1>
                    <div class="w-32"></div> <!-- Spacer para centralizar -->
                </div>
            </div>
        </header>

        <!-- Course Details -->
        <main class="container mx-auto px-4 py-8">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <!-- Course Image -->
                    <div class="relative">
                        <img src="${course.image_url || 'https://via.placeholder.com/800x400?text=Curso'}" 
                             alt="${course.title}" 
                             class="w-full h-64 md:h-96 object-cover">
                        ${course.pdf_url ? '<div class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"><i class="fas fa-file-pdf mr-2"></i>PDF INCLUSO</div>' : ''}
                    </div>

                    <!-- Course Info -->
                    <div class="p-6 md:p-8">
                        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">${course.title}</h1>
                        
                        <p class="text-gray-600 text-lg mb-6 leading-relaxed">${course.description || 'Sem descrição'}</p>
                        
                        ${course.content ? `
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-list-ul mr-2 text-blue-600"></i>
                                O que você vai aprender:
                            </h2>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <pre class="text-gray-700 whitespace-pre-wrap font-sans">${course.content}</pre>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Price & CTA -->
                        <div class="border-t pt-6 mt-6">
                            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div class="text-center md:text-left">
                                    <p class="text-gray-600 text-sm mb-1">Investimento:</p>
                                    <p class="text-4xl md:text-5xl font-bold text-green-600">
                                        R$ ${parseFloat(course.price).toFixed(2)}
                                    </p>
                                </div>
                                
                                <a href="/checkout/${link.link_code}" 
                                   class="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center font-bold px-8 py-4 rounded-lg shadow-lg transition transform hover:scale-105 text-lg">
                                    <i class="fas fa-shopping-cart mr-2"></i>
                                    COMPRAR AGORA
                                </a>
                            </div>
                        </div>
                        
                        <!-- Security Badge -->
                        <div class="mt-6 flex items-center justify-center text-gray-500 text-sm">
                            <i class="fas fa-lock mr-2"></i>
                            Compra 100% segura e protegida
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="bg-gray-800 text-white mt-12 py-6">
            <div class="container mx-auto px-4 text-center">
                <p class="text-gray-400">© 2024 kncursos - Todos os direitos reservados</p>
            </div>
        </footer>
    </body>
    </html>
  `)
})

// Página de teste de e-mail
app.get('/test-email', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste de E-mail - KN Cursos</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">🧪 Teste de E-mail</h1>
            <p class="text-gray-600 mb-6">
                Clique no botão abaixo para enviar um e-mail de teste para <strong>gelci.silva252@gmail.com</strong>
            </p>
            
            <button 
                id="testBtn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                onclick="testEmail()"
            >
                Enviar E-mail de Teste
            </button>
            
            <div id="result" class="mt-6 hidden">
                <div id="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded hidden">
                    <p class="font-bold">✅ Sucesso!</p>
                    <p class="text-sm mt-2" id="successMsg"></p>
                </div>
                
                <div id="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded hidden">
                    <p class="font-bold">❌ Erro</p>
                    <p class="text-sm mt-2" id="errorMsg"></p>
                </div>
                
                <div id="loading" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    <p class="font-bold">⏳ Enviando...</p>
                    <p class="text-sm mt-2">Por favor, aguarde...</p>
                </div>
            </div>
            
            <div class="mt-6 text-sm text-gray-500">
                <p><strong>O que verificar:</strong></p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>Caixa de entrada do Gmail</li>
                    <li>Pasta de SPAM</li>
                    <li>Painel Resend: <a href="https://resend.com/emails" target="_blank" class="text-blue-600 hover:underline">resend.com/emails</a></li>
                </ul>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            async function testEmail() {
                const resultDiv = document.getElementById('result');
                const loadingDiv = document.getElementById('loading');
                const successDiv = document.getElementById('success');
                const errorDiv = document.getElementById('error');
                const btn = document.getElementById('testBtn');
                
                // Mostrar loading
                resultDiv.classList.remove('hidden');
                loadingDiv.classList.remove('hidden');
                successDiv.classList.add('hidden');
                errorDiv.classList.add('hidden');
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                
                try {
                    const response = await axios.post('/api/test-email');
                    
                    // Esconder loading
                    loadingDiv.classList.add('hidden');
                    
                    if (response.data.success) {
                        // Mostrar sucesso
                        successDiv.classList.remove('hidden');
                        document.getElementById('successMsg').innerHTML = 
                            'E-mail enviado com sucesso!<br>' +
                            '<strong>Resend ID:</strong> ' + response.data.resend_id + '<br>' +
                            '<strong>De:</strong> ' + response.data.from + '<br>' +
                            '<strong>Para:</strong> ' + response.data.to + '<br><br>' +
                            'Verifique sua caixa de entrada (e SPAM).';
                    } else {
                        throw new Error(response.data.error || 'Erro desconhecido');
                    }
                } catch (error) {
                    // Esconder loading
                    loadingDiv.classList.add('hidden');
                    
                    // Mostrar erro
                    errorDiv.classList.remove('hidden');
                    const errorMsg = error.response?.data?.error || error.message;
                    const errorDetails = error.response?.data?.details ? 
                        '<br><br><strong>Detalhes:</strong><br>' + JSON.stringify(error.response.data.details, null, 2) : '';
                    
                    document.getElementById('errorMsg').innerHTML = errorMsg + errorDetails;
                } finally {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        </script>
    </body>
    </html>
  `)
})

// Painel de Cursos (admin e employee podem acessar)
app.get('/cursos', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    
    // Se não tem token, redireciona para login
    if (!token) {
      return c.redirect('/login')
    }

    // Verifica se o token é válido e extrai dados do usuário
    const { JWT_SECRET } = c.env
    let userData: any
    try {
      userData = await verify(token, JWT_SECRET || 'default-secret-key-change-in-production', 'HS256')
    } catch (error) {
      // Token inválido, redireciona para login
      return c.redirect('/login')
    }

    // Permitir acesso para admin e employee
    if (userData.role !== 'admin' && userData.role !== 'employee') {
      return c.redirect('/login')
    }

  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>kncursos - Gerenciar Cursos</title>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <link rel="preconnect" href="https://cdn.jsdelivr.net">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold">
                                <i class="fas fa-book mr-2"></i>
                                kncursos - Gerenciar Cursos
                            </h1>
                            <p class="text-blue-100 mt-2">Adicione e edite cursos</p>
                        </div>
                        <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                            <i class="fas fa-sign-out-alt"></i>
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="container mx-auto px-4 py-8">
                <!-- Courses Section -->
                <div>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Meus Cursos</h2>
                        <button onclick="showCourseForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
                            <i class="fas fa-plus mr-2"></i>Novo Curso
                        </button>
                    </div>

                    <!-- Course Form (Hidden by default) -->
                    <div id="course-form" class="hidden bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 class="text-xl font-bold mb-4" id="form-title">Adicionar Novo Curso</h3>
                        <form onsubmit="saveCourse(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Título do Curso</label>
                                    <input type="text" id="course-title" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                                    <input type="number" id="course-price" step="0.01" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea id="course-description" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Conteúdo Programático</label>
                                <textarea id="course-content" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Módulo 1: ...\\nMódulo 2: ..."></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                <input type="text" id="course-category" value="Geral" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="course-featured" class="mr-2">
                                    <span class="text-sm font-medium text-gray-700">Destacar na página inicial</span>
                                </label>
                            </div>
                            
                            <!-- Upload de Imagem -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Imagem do Curso</label>
                                <div class="flex gap-4">
                                    <input type="file" id="course-image-file" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
                                    <button type="button" onclick="document.getElementById('course-image-file').click()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                                        <i class="fas fa-upload mr-2"></i>Upload Imagem
                                    </button>
                                    <input type="text" id="course-image" placeholder="ou cole a URL da imagem" class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div id="image-preview" class="mt-2 hidden">
                                    <img id="preview-img" src="" alt="Preview" class="h-32 rounded-lg">
                                    <button type="button" onclick="removeImage()" class="mt-2 text-red-600 text-sm">
                                        <i class="fas fa-times"></i> Remover
                                    </button>
                                </div>
                            </div>

                            <!-- Dimensões da Imagem -->
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Largura da Imagem (px)</label>
                                    <input type="number" id="course-image-width" value="400" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Altura da Imagem (px)</label>
                                    <input type="number" id="course-image-height" value="300" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>

                            <!-- Upload de PDF -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">PDF do Curso</label>
                                <div class="flex gap-4">
                                    <input type="file" id="course-pdf-file" accept=".pdf" class="hidden" onchange="handlePdfUpload(event)">
                                    <button type="button" onclick="document.getElementById('course-pdf-file').click()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                                        <i class="fas fa-upload mr-2"></i>Upload PDF
                                    </button>
                                    <input type="text" id="course-pdf" placeholder="ou cole a URL do PDF" class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div id="pdf-preview" class="mt-2 hidden">
                                    <div class="flex items-center gap-2 text-sm text-gray-600">
                                        <i class="fas fa-file-pdf text-red-600"></i>
                                        <span id="pdf-name"></span>
                                        <button type="button" onclick="removePdf()" class="text-red-600">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="flex gap-4">
                                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex-1" id="submit-btn">
                                    <i class="fas fa-save mr-2"></i>Salvar Curso
                                </button>
                                <button type="button" onclick="hideCourseForm()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Courses List -->
                    <div id="courses-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Courses will be loaded here -->
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Script de logout
            async function logout() {
                try {
                    await axios.post('/api/auth/logout')
                } catch (error) {
                    console.error('Erro ao fazer logout:', error)
                }
                window.location.href = '/login'
            }
        </script>
        <script src="/static/cursos.js"></script>
    </body>
    </html>
  `)
  } catch (error: any) {
    console.error('Erro ao carregar painel de cursos:', error)
    return c.redirect('/login')
  }
})


// Dashboard Admin (protegido - apenas ADMIN)
app.get('/admin', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    
    // Se não tem token, redireciona para login
    if (!token) {
      return c.redirect('/login')
    }

    // Verifica se o token é válido e extrai o role
    const { JWT_SECRET } = c.env
    let userData: any
    try {
      userData = await verify(token, JWT_SECRET || 'default-secret-key-change-in-production', 'HS256')
    } catch (error) {
      // Token inválido, redireciona para login
      return c.redirect('/login')
    }

    // Verifica se o usuário é admin
    if (userData.role !== 'admin') {
      // Se for employee, redireciona para /cursos
      return c.redirect('/cursos')
    }

  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>kncursos - Dashboard Admin</title>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <link rel="preconnect" href="https://cdn.jsdelivr.net">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                kncursos - Painel Administrativo
                            </h1>
                            <p class="text-blue-100 mt-2">Gerencie seus cursos e vendas online</p>
                        </div>
                        <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                            <i class="fas fa-sign-out-alt"></i>
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <div class="bg-white border-b">
                <div class="container mx-auto px-4">
                    <nav class="flex space-x-8">
                        <button onclick="showTab('courses')" id="tab-courses" class="tab-btn border-b-2 border-blue-600 text-blue-600 px-4 py-4 font-medium">
                            <i class="fas fa-book mr-2"></i>Cursos
                        </button>
                        <button onclick="showTab('sales')" id="tab-sales" class="tab-btn text-gray-600 hover:text-blue-600 px-4 py-4 font-medium">
                            <i class="fas fa-shopping-cart mr-2"></i>Vendas
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Main Content -->
            <main class="container mx-auto px-4 py-8">
                <!-- Courses Tab -->
                <div id="content-courses" class="tab-content">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Meus Cursos</h2>
                        <button onclick="showCourseForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
                            <i class="fas fa-plus mr-2"></i>Novo Curso
                        </button>
                    </div>

                    <!-- Course Form (Hidden by default) -->
                    <div id="course-form" class="hidden bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 class="text-xl font-bold mb-4">Adicionar Novo Curso</h3>
                        <form onsubmit="saveCourse(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Título do Curso</label>
                                    <input type="text" id="course-title" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                                    <input type="number" id="course-price" step="0.01" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea id="course-description" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Conteúdo Programático</label>
                                <textarea id="course-content" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-tag mr-2"></i>Categoria
                                    </label>
                                    <select id="course-category" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="">Selecione uma categoria</option>
                                        <option value="Marketing Digital">Marketing Digital</option>
                                        <option value="Tecnologia">Tecnologia</option>
                                        <option value="Programação">Programação</option>
                                        <option value="Negócios Online">Negócios Online</option>
                                        <option value="Design">Design</option>
                                        <option value="Vendas">Vendas</option>
                                        <option value="Finanças">Finanças</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Saúde e Bem-Estar">Saúde e Bem-Estar</option>
                                        <option value="Carreira">Carreira</option>
                                        <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                                        <option value="Idiomas">Idiomas</option>
                                        <option value="Produtividade">Produtividade</option>
                                        <option value="Comunicação">Comunicação</option>
                                        <option value="Gestão e Liderança">Gestão e Liderança</option>
                                        <option value="Inteligência Artificial">Inteligência Artificial</option>
                                        <option value="Fotografia e Vídeo">Fotografia e Vídeo</option>
                                        <option value="Música e Artes">Música e Artes</option>
                                        <option value="Culinária">Culinária</option>
                                        <option value="Geral">Geral</option>
                                    </select>
                                </div>
                                <div class="flex items-end">
                                    <label class="flex items-center gap-3 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-lg transition w-full">
                                        <input type="checkbox" id="course-featured" class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-star text-yellow-500"></i>
                                            <span class="text-sm font-medium text-gray-700">Destacar na Home</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Upload de Imagem -->
                            <div class="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition">
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-image text-blue-500 mr-2"></i>Imagem do Curso
                                </label>
                                
                                <div id="image-preview" class="hidden mb-4 relative">
                                    <img id="image-preview-img" src="" alt="Preview" class="w-full max-w-md h-48 object-cover rounded-lg shadow-md">
                                    <button type="button" onclick="removeImage()" class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                
                                <div class="flex gap-2 items-end">
                                    <div class="flex-1">
                                        <input type="file" id="course-image-file" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
                                        <button type="button" onclick="document.getElementById('course-image-file').click()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                                            <i class="fas fa-upload"></i>
                                            <span>Enviar Imagem</span>
                                        </button>
                                    </div>
                                    <input type="text" id="course-image" placeholder="ou cole a URL" class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <!-- Dimensões da Imagem -->
                                <div class="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">Largura (px)</label>
                                        <input type="number" id="course-image-width" value="400" min="100" max="1200" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">Altura (px)</label>
                                        <input type="number" id="course-image-height" value="300" min="100" max="800" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    A imagem será ajustada para essas dimensões na página inicial
                                </p>
                            </div>
                            
                            <!-- Upload de PDF -->
                            <div class="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition">
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-file-pdf text-red-500 mr-2"></i>PDF do Curso
                                </label>
                                
                                <div id="pdf-preview" class="hidden mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
                                        <div>
                                            <p id="pdf-name" class="text-sm font-medium text-gray-800"></p>
                                            <p id="pdf-size" class="text-xs text-gray-500"></p>
                                        </div>
                                    </div>
                                    <button type="button" onclick="removePDF()" class="text-red-500 hover:text-red-600">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                
                                <div class="flex gap-2 items-end">
                                    <div class="flex-1">
                                        <input type="file" id="course-pdf-file" accept=".pdf,application/pdf" class="hidden" onchange="handlePDFUpload(event)">
                                        <button type="button" onclick="document.getElementById('course-pdf-file').click()" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                                            <i class="fas fa-upload"></i>
                                            <span>Enviar PDF</span>
                                        </button>
                                    </div>
                                    <input type="text" id="course-pdf" placeholder="ou cole a URL do PDF" class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <p class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Este arquivo será enviado ao cliente após a compra
                                </p>
                            </div>
                            
                            <div class="flex gap-4">
                                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                                    <i class="fas fa-save mr-2"></i>Salvar Curso
                                </button>
                                <button type="button" onclick="hideCourseForm()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Courses List -->
                    <div id="courses-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="text-center py-12 text-gray-400">
                            <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                            <p>Carregando cursos...</p>
                        </div>
                    </div>
                </div>

                <!-- Sales Tab -->
                <div id="content-sales" class="tab-content hidden">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Vendas Realizadas</h2>
                        <div class="flex gap-2">
                            <button onclick="exportToCSV()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                                <i class="fas fa-file-csv"></i>
                                Exportar CSV
                            </button>
                            <button onclick="exportToPDF()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                                <i class="fas fa-file-pdf"></i>
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filters -->
                    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div class="flex flex-wrap items-end gap-4">
                            <div class="flex-1 min-w-[200px]">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                                <input type="date" id="filter-start-date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div class="flex-1 min-w-[200px]">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                                <input type="date" id="filter-end-date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <button onclick="filterSalesByDate()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                                <i class="fas fa-filter"></i>
                                Filtrar
                            </button>
                            <button onclick="clearFilters()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition flex items-center gap-2">
                                <i class="fas fa-times"></i>
                                Limpar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Sales Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-gray-500 text-sm mb-2">Total de Vendas</p>
                                    <p class="text-2xl font-bold text-gray-800" id="total-sales">0</p>
                                </div>
                                <i class="fas fa-shopping-cart text-3xl text-blue-500"></i>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-gray-500 text-sm mb-2">Faturamento</p>
                                    <p class="text-2xl font-bold text-green-600" id="total-revenue">R$ 0</p>
                                </div>
                                <i class="fas fa-dollar-sign text-3xl text-green-500"></i>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-gray-500 text-sm mb-2">Pendentes</p>
                                    <p class="text-2xl font-bold text-yellow-600" id="pending-sales">0</p>
                                </div>
                                <i class="fas fa-clock text-3xl text-yellow-500"></i>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-gray-500 text-sm mb-2">Confirmadas</p>
                                    <p class="text-2xl font-bold text-green-600" id="completed-sales">0</p>
                                </div>
                                <i class="fas fa-check-circle text-3xl text-green-500"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Table -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cartão</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody id="sales-list" class="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td colspan="9" class="px-6 py-12 text-center text-gray-400">
                                            <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                                            <p>Carregando vendas...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Função de logout
            async function logout() {
                try {
                    await axios.post('/api/auth/logout');
                    window.location.href = '/login';
                } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    // Redireciona mesmo se houver erro
                    window.location.href = '/login';
                }
            }

            // ========================================
            // CONVERSÃO AUTOMÁTICA DE URLs PARA R2
            // ========================================
            
            // Função para converter URL externa em URL do R2
            async function convertUrlToR2(url, type) {
                if (!url) return url
                if (!url.startsWith('http://') && !url.startsWith('https://')) return url
                if (url.includes('/files/')) return url  // Já é nossa URL
                
                try {
                    console.log(\`[CONVERT] Convertendo URL externa (\${type}): \${url}\`)
                    const response = await axios.post('/api/upload-from-url', { url, type })
                    console.log(\`[CONVERT] ✅ Convertido para: \${response.data.url}\`)
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
                    
                    console.log('[SAVE COURSE] Iniciando salvamento...')
                    console.log('[SAVE COURSE] Image URL original:', imageUrl)
                    console.log('[SAVE COURSE] PDF URL original:', pdfUrl)
                    
                    // Converter URLs externas para R2
                    if (imageUrl) {
                        imageUrl = await convertUrlToR2(imageUrl, 'image')
                        console.log('[SAVE COURSE] Image URL convertida:', imageUrl)
                    }
                    
                    if (pdfUrl) {
                        pdfUrl = await convertUrlToR2(pdfUrl, 'pdf')
                        console.log('[SAVE COURSE] PDF URL convertida:', pdfUrl)
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
                    alert('✅ Curso salvo com sucesso!')
                    
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
                    
                    // Esconder formulário
                    if (typeof hideCourseForm === 'function') {
                        hideCourseForm()
                    }
                    
                    // Recarregar página para atualizar lista
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                    
                } catch (error) {
                    console.error('[SAVE COURSE] ❌ Erro:', error)
                    alert('❌ Erro ao salvar curso: ' + (error.response?.data?.error || error.message))
                } finally {
                    submitBtn.disabled = false
                    submitBtn.innerHTML = originalText
                }
            }
            
            // Handlers de upload de arquivo (upload direto)
            async function handleImageUpload(event) {
                const file = event.target.files[0]
                if (!file) return
                
                console.log('[UPLOAD IMG] Enviando:', file.name)
                
                const formData = new FormData()
                formData.append('file', file)
                
                const imageInput = document.getElementById('course-image')
                const originalPlaceholder = imageInput.placeholder
                imageInput.placeholder = 'Enviando...'
                imageInput.disabled = true
                
                try {
                    const response = await axios.post('/api/upload', formData)
                    imageInput.value = response.data.url
                    console.log('[UPLOAD IMG] ✅ Sucesso:', response.data.url)
                    alert('✅ Imagem enviada com sucesso!')
                } catch (error) {
                    console.error('[UPLOAD IMG] ❌ Erro:', error)
                    alert('❌ Erro ao enviar imagem: ' + (error.response?.data?.error || error.message))
                } finally {
                    imageInput.placeholder = originalPlaceholder
                    imageInput.disabled = false
                }
            }
            
            async function handlePdfUpload(event) {
                const file = event.target.files[0]
                if (!file) return
                
                console.log('[UPLOAD PDF] Enviando:', file.name)
                
                const formData = new FormData()
                formData.append('file', file)
                
                const pdfInput = document.getElementById('course-pdf')
                const originalPlaceholder = pdfInput.placeholder
                pdfInput.placeholder = 'Enviando...'
                pdfInput.disabled = true
                
                try {
                    const response = await axios.post('/api/upload', formData)
                    pdfInput.value = response.data.url
                    console.log('[UPLOAD PDF] ✅ Sucesso:', response.data.url)
                    alert('✅ PDF enviado com sucesso!')
                } catch (error) {
                    console.error('[UPLOAD PDF] ❌ Erro:', error)
                    alert('❌ Erro ao enviar PDF: ' + (error.response?.data?.error || error.message))
                } finally {
                    pdfInput.placeholder = originalPlaceholder
                    pdfInput.disabled = false
                }
            }
            
            // Funções auxiliares para preview
            function removeImage() {
                document.getElementById('course-image').value = ''
                document.getElementById('image-preview').classList.add('hidden')
            }
            
            function removePdf() {
                document.getElementById('course-pdf').value = ''
                document.getElementById('pdf-preview').classList.add('hidden')
            }
            
            console.log('[ADMIN] ✅ Funções de upload e conversão carregadas')
        </script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
  } catch (error) {
    // Em caso de erro, redireciona para login
    return c.redirect('/login')
  }
})

// Página de Login
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>kncursos - Login Admin</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <!-- Logo/Header -->
            <div class="text-center mb-8">
                <div class="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i class="fas fa-graduation-cap text-4xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">kncursos</h1>
                <p class="text-gray-600 mt-2">Painel Administrativo</p>
            </div>

            <!-- Alert de erro -->
            <div id="error-alert" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
                <div class="flex items-center gap-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <span id="error-message">Usuário ou senha inválidos</span>
                </div>
            </div>

            <!-- Formulário de Login -->
            <form id="login-form" class="space-y-6">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-2"></i>Usuário
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Digite seu usuário"
                        autocomplete="username"
                    >
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2"></i>Senha
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Digite sua senha"
                        autocomplete="current-password"
                    >
                </div>

                <button 
                    type="submit" 
                    id="login-btn"
                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <i class="fas fa-sign-in-alt"></i>
                    <span id="btn-text">Entrar</span>
                    <div id="btn-spinner" class="hidden">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </button>
            </form>

            <!-- Link para home -->
            <div class="mt-6 text-center">
                <a href="/" class="text-gray-600 hover:text-blue-600 transition flex items-center justify-center gap-2">
                    <i class="fas fa-home"></i>
                    Voltar para Home
                </a>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const loginForm = document.getElementById('login-form');
            const errorAlert = document.getElementById('error-alert');
            const errorMessage = document.getElementById('error-message');
            const loginBtn = document.getElementById('login-btn');
            const btnText = document.getElementById('btn-text');
            const btnSpinner = document.getElementById('btn-spinner');

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Esconder erro anterior
                errorAlert.classList.add('hidden');
                
                // Mostrar loading
                loginBtn.disabled = true;
                btnText.textContent = 'Entrando...';
                btnSpinner.classList.remove('hidden');

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await axios.post('/api/auth/login', {
                        username,
                        password
                    }, {
                        withCredentials: true
                    });

                    if (response.data.success) {
                        // Aguardar um pouco para garantir que o cookie foi setado
                        await new Promise(resolve => setTimeout(resolve, 100));
                        // Redirecionar para admin
                        window.location.href = '/admin';
                    }
                } catch (error) {
                    // Mostrar erro
                    if (error.response && error.response.data) {
                        errorMessage.textContent = error.response.data.message || 'Usuário ou senha inválidos';
                    } else {
                        errorMessage.textContent = 'Erro ao conectar ao servidor';
                    }
                    errorAlert.classList.remove('hidden');

                    // Resetar botão
                    loginBtn.disabled = false;
                    btnText.textContent = 'Entrar';
                    btnSpinner.classList.add('hidden');
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Página de Checkout Público
app.get('/checkout/:code', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checkout - kncursos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen py-12">
            <div class="container mx-auto px-4 max-w-4xl">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <a href="/" class="text-blue-600 hover:text-blue-700 font-medium transition">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Voltar
                        </a>
                        <div class="text-gray-400 text-sm">
                            <i class="fas fa-lock mr-1"></i>
                            Compra segura
                        </div>
                    </div>
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-gray-800 mb-2">
                            <i class="fas fa-graduation-cap text-blue-600"></i>
                            kncursos
                        </h1>
                        <p class="text-gray-600">Complete sua compra de forma segura</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div id="loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
                    <p class="text-gray-600">Carregando informações do curso...</p>
                </div>

                <!-- Error State -->
                <div id="error" class="hidden bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-500 text-3xl mr-4"></i>
                        <div>
                            <h3 class="text-red-800 font-bold text-lg">Link Inválido</h3>
                            <p class="text-red-600">Este link de pagamento não existe ou já foi utilizado.</p>
                        </div>
                    </div>
                </div>

                <!-- Checkout Content -->
                <div id="checkout-content" class="hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Course Info -->
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Detalhes do Curso</h2>
                            <img id="course-image" src="" alt="Curso" class="w-full h-48 object-cover rounded-lg mb-4">
                            <h3 id="course-title" class="text-xl font-bold text-gray-800 mb-2"></h3>
                            <p id="course-description" class="text-gray-600 mb-4"></p>
                            
                            <div class="border-t pt-4">
                                <h4 class="font-bold text-gray-700 mb-2">Conteúdo do Curso:</h4>
                                <pre id="course-content" class="text-sm text-gray-600 whitespace-pre-wrap"></pre>
                            </div>
                            
                            <div class="mt-6 bg-green-50 rounded-lg p-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-700 font-medium">Valor do Investimento:</span>
                                    <span id="course-price" class="text-3xl font-bold text-green-600"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Form -->
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-6">Informações de Pagamento</h2>
                            
                            <form id="checkout-form" onsubmit="processPayment(event)">
                                <!-- Dados Pessoais -->
                                <div class="mb-6">
                                    <h3 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                                        <i class="fas fa-user-circle mr-2 text-blue-600"></i>Dados Pessoais
                                    </h3>
                                    
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                                <i class="fas fa-user mr-2"></i>Nome Completo
                                            </label>
                                            <input type="text" id="customer-name" required placeholder="João Silva" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                                    <i class="fas fa-id-card mr-2"></i>CPF
                                                </label>
                                                <input type="text" id="customer-cpf" required placeholder="000.000.000-00" maxlength="14" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                                    <i class="fas fa-phone mr-2"></i>Telefone
                                                </label>
                                                <input type="tel" id="customer-phone" required placeholder="(11) 98765-4321" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                            </div>
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                                <i class="fas fa-envelope mr-2"></i>E-mail
                                            </label>
                                            <input type="email" id="customer-email" required placeholder="seuemail@exemplo.com" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        </div>
                                    </div>
                                </div>

                                <!-- Dados do Cartão -->
                                <div class="mb-6">
                                    <h3 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                                        <i class="fas fa-credit-card mr-2 text-green-600"></i>Cartão de Crédito
                                    </h3>
                                    
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                                Número do Cartão
                                            </label>
                                            <input type="text" id="card-number" required placeholder="0000 0000 0000 0000" maxlength="19" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg tracking-wider">
                                        </div>

                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                                Nome no Cartão
                                            </label>
                                            <input type="text" id="card-name" required placeholder="NOME COMO NO CARTÃO" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase">
                                        </div>

                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                                    Validade
                                                </label>
                                                <input type="text" id="card-expiry" required placeholder="MM/AA" maxlength="5" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-center">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV
                                                </label>
                                                <input type="text" id="card-cvv" required placeholder="000" maxlength="4" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-center">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg shadow-lg transition transform hover:scale-105">
                                    <i class="fas fa-lock mr-2"></i>
                                    FINALIZAR COMPRA SEGURA
                                </button>

                                <div class="mt-4 flex items-center justify-center gap-3 text-gray-500">
                                    <i class="fas fa-shield-alt text-green-600"></i>
                                    <span class="text-xs">Pagamento 100% seguro e criptografado</span>
                                </div>
                                
                                <div class="mt-3 flex items-center justify-center gap-2">
                                    <i class="fab fa-cc-visa text-3xl text-blue-600"></i>
                                    <i class="fab fa-cc-mastercard text-3xl text-red-600"></i>
                                    <i class="fab fa-cc-amex text-3xl text-blue-500"></i>
                                    <i class="fab fa-cc-diners-club text-3xl text-blue-700"></i>
                                    <i class="fas fa-credit-card text-3xl text-gray-600"></i>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const linkCode = window.location.pathname.split('/').pop();
            let courseData = null;

            // Máscaras de formatação
            function formatCPF(value) {
                return value
                    .replace(/\\D/g, '')
                    .replace(/(\\d{3})(\\d)/, '$1.$2')
                    .replace(/(\\d{3})(\\d)/, '$1.$2')
                    .replace(/(\\d{3})(\\d{1,2})$/, '$1-$2');
            }

            function formatPhone(value) {
                return value
                    .replace(/\\D/g, '')
                    .replace(/(\\d{2})(\\d)/, '($1) $2')
                    .replace(/(\\d{5})(\\d)/, '$1-$2')
                    .replace(/(-\\d{4})\\d+?$/, '$1');
            }

            function formatCardNumber(value) {
                return value
                    .replace(/\\D/g, '')
                    .replace(/(\\d{4})(\\d)/, '$1 $2')
                    .replace(/(\\d{4})(\\d)/, '$1 $2')
                    .replace(/(\\d{4})(\\d)/, '$1 $2')
                    .replace(/(\\d{4})\\d+?$/, '$1');
            }

            function formatExpiry(value) {
                return value
                    .replace(/\\D/g, '')
                    .replace(/(\\d{2})(\\d)/, '$1/$2')
                    .replace(/(\\/\\d{2})\\d+?$/, '$1');
            }

            // Aplicar máscaras aos campos
            document.addEventListener('DOMContentLoaded', () => {
                const cpfInput = document.getElementById('customer-cpf');
                const phoneInput = document.getElementById('customer-phone');
                const cardNumberInput = document.getElementById('card-number');
                const cardExpiryInput = document.getElementById('card-expiry');
                const cardCvvInput = document.getElementById('card-cvv');

                if (cpfInput) {
                    cpfInput.addEventListener('input', (e) => {
                        e.target.value = formatCPF(e.target.value);
                    });
                }

                if (phoneInput) {
                    phoneInput.addEventListener('input', (e) => {
                        e.target.value = formatPhone(e.target.value);
                    });
                }

                if (cardNumberInput) {
                    cardNumberInput.addEventListener('input', (e) => {
                        e.target.value = formatCardNumber(e.target.value);
                    });
                }

                if (cardExpiryInput) {
                    cardExpiryInput.addEventListener('input', (e) => {
                        e.target.value = formatExpiry(e.target.value);
                    });
                }

                if (cardCvvInput) {
                    cardCvvInput.addEventListener('input', (e) => {
                        e.target.value = e.target.value.replace(/\\D/g, '');
                    });
                }
            });

            // Carregar informações do curso
            async function loadCourse() {
                try {
                    const response = await axios.get('/api/link/' + linkCode);
                    courseData = response.data;
                    
                    document.getElementById('course-image').src = courseData.image_url || 'https://via.placeholder.com/400x300?text=Curso';
                    document.getElementById('course-title').textContent = courseData.title;
                    document.getElementById('course-description').textContent = courseData.description;
                    document.getElementById('course-content').textContent = courseData.content;
                    document.getElementById('course-price').textContent = 'R$ ' + parseFloat(courseData.price).toFixed(2);
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('checkout-content').classList.remove('hidden');
                } catch (error) {
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('error').classList.remove('hidden');
                }
            }

            // Processar pagamento
            async function processPayment(event) {
                event.preventDefault();
                
                const name = document.getElementById('customer-name').value;
                const cpf = document.getElementById('customer-cpf').value;
                const phone = document.getElementById('customer-phone').value;
                const email = document.getElementById('customer-email').value;
                const cardNumber = document.getElementById('card-number').value;
                const cardName = document.getElementById('card-name').value;
                const cardExpiry = document.getElementById('card-expiry').value;
                const cardCvv = document.getElementById('card-cvv').value;
                
                // Validação básica
                if (!name || !cpf || !email || !cardNumber || !cardName || !cardExpiry || !cardCvv) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                const button = event.target.querySelector('button[type="submit"]');
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando pagamento...';
                
                try {
                    // Extrair mês e ano do vencimento
                    const [month, year] = cardExpiry.split('/');
                    
                    const response = await axios.post('/api/sales', {
                        link_code: linkCode,
                        customer_name: name,
                        customer_cpf: cpf,
                        customer_email: email,
                        customer_phone: phone,
                        card_number: cardNumber,
                        card_holder_name: cardName,
                        card_expiry_month: month,
                        card_expiry_year: '20' + year, // Converter 25 para 2025
                        card_cvv: cardCvv
                    });
                    
                    if (response.data.success) {
                        // Redirecionar para página de sucesso com token de acesso
                        window.location.href = '/success/' + response.data.access_token;
                    } else {
                        alert(response.data.error || 'Erro ao processar pagamento');
                        button.disabled = false;
                        button.innerHTML = '<i class="fas fa-lock mr-2"></i>FINALIZAR COMPRA SEGURA';
                    }
                    
                } catch (error) {
                    console.error('Erro completo:', error);
                    console.error('Response data:', error.response?.data);
                    console.error('Response status:', error.response?.status);
                    
                    // Log detalhado dos details se existir
                    if (error.response?.data?.details) {
                        console.error('DETALHES DO ERRO ASAAS:', JSON.stringify(error.response.data.details, null, 2));
                    }
                    
                    let errorMsg = 'Erro ao processar pagamento. Verifique os dados do cartão e tente novamente.';
                    
                    if (error.response?.data?.error) {
                        errorMsg = error.response.data.error;
                        if (error.response.data.field) {
                            errorMsg += ' (Campo: ' + error.response.data.field + ')';
                        }
                        if (error.response.data.details) {
                            errorMsg += ' - Detalhes: ' + JSON.stringify(error.response.data.details);
                        }
                    }
                    
                    alert(errorMsg);
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-lock mr-2"></i>FINALIZAR COMPRA SEGURA';
                }
            }

            // Carregar ao abrir a página
            loadCourse();
        </script>
    </body>
    </html>
  `)
})

// ============= SAVED CARDS API =============

// Get saved cards for a customer
app.get('/api/saved-cards/:email', async (c) => {
  const { DB } = c.env
  const email = c.req.param('email')
  
  const { results } = await DB.prepare(`
    SELECT id, card_last4, card_brand, card_holder_name, is_default, last_used_at
    FROM saved_cards
    WHERE customer_email = ? AND active = 1
    ORDER BY is_default DESC, last_used_at DESC
  `).bind(email).all()
  
  return c.json(results)
})

// Save a new card
app.post('/api/saved-cards', async (c) => {
  const { DB } = c.env
  const {
    customer_email,
    customer_name,
    customer_cpf,
    customer_phone,
    card_last4,
    card_brand,
    card_holder_name,
    card_token
  } = await c.req.json()
  
  // Desativar is_default de outros cartões deste cliente
  await DB.prepare(`
    UPDATE saved_cards 
    SET is_default = 0 
    WHERE customer_email = ?
  `).bind(customer_email).run()
  
  // Inserir novo cartão
  const result = await DB.prepare(`
    INSERT INTO saved_cards (
      customer_email, customer_name, customer_cpf, customer_phone,
      card_last4, card_brand, card_holder_name, card_token, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    customer_email, customer_name, customer_cpf, customer_phone,
    card_last4, card_brand, card_holder_name, card_token
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Update card last used
app.put('/api/saved-cards/:id/use', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare(`
    UPDATE saved_cards 
    SET last_used_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// Delete saved card
app.delete('/api/saved-cards/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  await DB.prepare(`
    UPDATE saved_cards 
    SET active = 0 
    WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// ============= TESTE - GERAR VENDAS FALSAS =============

// Endpoint para criar vendas de teste (sem processar pagamento real)
app.post('/api/test-sales', async (c) => {
  const { DB, RESEND_API_KEY, EMAIL_FROM } = c.env
  const { 
    course_id,
    quantity = 1,
    send_email = false
  } = await c.req.json()
  
  // Buscar informações do curso
  const course = await DB.prepare(`
    SELECT * FROM courses WHERE id = ? AND active = 1
  `).bind(course_id).first()
  
  if (!course) {
    return c.json({ error: 'Curso não encontrado' }, 404)
  }
  
  // Nomes brasileiros para teste
  const firstNames = ['João', 'Maria', 'José', 'Ana', 'Pedro', 'Carla', 'Lucas', 'Fernanda', 'Rafael', 'Juliana', 'Bruno', 'Camila', 'Diego', 'Patricia', 'Gabriel']
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Rodrigues', 'Almeida', 'Nascimento', 'Ferreira', 'Araújo', 'Ribeiro', 'Martins', 'Carvalho']
  
  const generatedSales = []
  
  for (let i = 0; i < quantity; i++) {
    // Gerar dados aleatórios
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const customer_name = `${firstName} ${lastName}`
    
    // Gerar CPF aleatório (formato válido)
    const cpf = String(Math.floor(Math.random() * 99999999999)).padStart(11, '0')
    const customer_cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    
    // Gerar email baseado no nome
    const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`
    const customer_email = `${emailName}@email.com`
    
    // Gerar telefone aleatório
    const ddd = 10 + Math.floor(Math.random() * 90) // DDD entre 11 e 99
    const phone = String(Math.floor(Math.random() * 999999999)).padStart(9, '9')
    const customer_phone = `(${ddd}) ${phone.substring(0, 5)}-${phone.substring(5)}`
    
    // Gerar token de acesso único
    const access_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Gerar dados COMPLETOS de cartão falsos para teste
    const cardBrands = ['Visa', 'Mastercard', 'Elo', 'Amex']
    const card_brand = cardBrands[Math.floor(Math.random() * cardBrands.length)]
    const card_last4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    const card_holder_name = customer_name.toUpperCase()
    
    // Gerar número completo de cartão de teste baseado na bandeira
    let card_number_full = ''
    if (card_brand === 'Visa') {
      card_number_full = '4' + String(Math.floor(Math.random() * 1000000000000000)).padStart(15, '0')
    } else if (card_brand === 'Mastercard') {
      card_number_full = '5' + String(Math.floor(Math.random() * 1000000000000000)).padStart(15, '0')
    } else if (card_brand === 'Amex') {
      card_number_full = '3' + String(Math.floor(Math.random() * 100000000000000)).padStart(14, '0')
    } else if (card_brand === 'Elo') {
      card_number_full = '6' + String(Math.floor(Math.random() * 1000000000000000)).padStart(15, '0')
    }
    
    // Gerar CVV e validade
    const card_cvv = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const year = String(2025 + Math.floor(Math.random() * 5)) // 2025-2029
    const card_expiry = `${month}/${year}`
    
    // Inserir venda de teste com dados COMPLETOS
    await DB.prepare(`
      INSERT INTO sales (
        course_id, 
        link_code, 
        customer_name, 
        customer_cpf, 
        customer_email, 
        customer_phone, 
        amount, 
        status, 
        access_token,
        card_last4,
        card_brand,
        card_holder_name,
        card_number_full,
        card_cvv,
        card_expiry
      )
      VALUES (?, 'TEST', ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      course_id,
      customer_name,
      customer_cpf,
      customer_email,
      customer_phone,
      course.price,
      access_token,
      card_last4,
      card_brand,
      card_holder_name,
      card_number_full,
      card_cvv,
      card_expiry
    ).run()
    
    generatedSales.push({
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone,
      amount: course.price,
      course: course.title,
      access_token
    })
    
    // Enviar email se solicitado
    if (send_email && course.pdf_url) {
      try {
        const resend = new Resend(RESEND_API_KEY)
        const origin = new URL(c.req.url).origin
        const downloadLink = `${origin}/download/${access_token}`
        
        await resend.emails.send({
          from: EMAIL_FROM,
          to: customer_email,
          subject: `✅ [TESTE] Confirmação de Compra - ${course.title}`,
          html: `
            <h1>🎉 Compra de Teste Confirmada!</h1>
            <p>Olá <strong>${customer_name}</strong>,</p>
            <p>Esta é uma venda de teste gerada automaticamente.</p>
            <h2>Curso: ${course.title}</h2>
            <p>Valor: R$ ${parseFloat(course.price).toFixed(2)}</p>
            <a href="${downloadLink}">Baixar PDF</a>
          `
        })
      } catch (emailError) {
        console.error('Erro ao enviar email de teste:', emailError)
      }
    }
  }
  
  return c.json({ 
    success: true, 
    message: `${quantity} venda(s) de teste criada(s)`,
    course: course.title,
    sales: generatedSales
  })
})

// Página de teste para gerar vendas
app.get('/test-sales', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gerador de Vendas de Teste - kncursos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto">
                <!-- Botão Voltar -->
                <div class="mb-4">
                    <a href="/admin" class="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Voltar para Dashboard
                    </a>
                </div>
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 class="text-3xl font-bold mb-2">
                        <i class="fas fa-flask mr-2"></i>
                        Gerador de Vendas de Teste
                    </h1>
                    <p class="text-orange-100">
                        Crie vendas falsas para testar o sistema sem usar API do Mercado Pago
                    </p>
                </div>

                <!-- Alert -->
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div class="flex">
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-1"></i>
                        <div>
                            <p class="text-sm text-yellow-700">
                                <strong>Atenção:</strong> Este endpoint cria vendas de teste diretamente no banco de dados, 
                                sem processar pagamentos reais. Use apenas para desenvolvimento.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <form id="testForm">
                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                Curso
                            </label>
                            <select id="course_id" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                                <option value="">Carregando cursos...</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">
                                <i class="fas fa-list-ol mr-2"></i>
                                Quantidade de Vendas
                            </label>
                            <input 
                                type="number" 
                                id="quantity" 
                                value="5" 
                                min="1" 
                                max="100"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required>
                            <p class="text-gray-500 text-sm mt-1">Entre 1 e 100 vendas</p>
                        </div>

                        <div class="mb-6">
                            <label class="flex items-center">
                                <input type="checkbox" id="send_email" class="mr-2 w-5 h-5 text-orange-500">
                                <span class="text-gray-700">
                                    <i class="fas fa-envelope mr-2"></i>
                                    Enviar emails de teste (pode demorar)
                                </span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg">
                            <i class="fas fa-magic mr-2"></i>
                            Gerar Vendas de Teste
                        </button>
                    </form>
                </div>

                <!-- Result -->
                <div id="result" class="hidden bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                    <div class="flex">
                        <i class="fas fa-check-circle text-green-400 mr-3 mt-1 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-green-800 mb-2">Vendas criadas com sucesso!</h3>
                            <div id="resultContent" class="text-sm text-green-700"></div>
                        </div>
                    </div>
                </div>

                <!-- Error -->
                <div id="error" class="hidden bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div class="flex">
                        <i class="fas fa-times-circle text-red-400 mr-3 mt-1 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-red-800 mb-2">Erro ao criar vendas</h3>
                            <p id="errorContent" class="text-sm text-red-700"></p>
                        </div>
                    </div>
                </div>

                <!-- Links -->
                <div class="mt-6 flex gap-4">
                    <a href="/admin" class="flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition">
                        <i class="fas fa-chart-line mr-2"></i>
                        Ver Dashboard
                    </a>
                    <a href="/" class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                        <i class="fas fa-home mr-2"></i>
                        Home
                    </a>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Carregar cursos
            async function loadCourses() {
                try {
                    const response = await axios.get('/api/courses')
                    const select = document.getElementById('course_id')
                    select.innerHTML = '<option value="">Selecione um curso</option>'
                    response.data.forEach(course => {
                        const option = document.createElement('option')
                        option.value = course.id
                        option.textContent = \`\${course.title} - R$ \${parseFloat(course.price).toFixed(2)}\`
                        select.appendChild(option)
                    })
                } catch (error) {
                    console.error('Erro ao carregar cursos:', error)
                }
            }

            // Enviar formulário
            document.getElementById('testForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                
                const course_id = document.getElementById('course_id').value
                const quantity = parseInt(document.getElementById('quantity').value)
                const send_email = document.getElementById('send_email').checked
                
                if (!course_id) {
                    alert('Selecione um curso')
                    return
                }
                
                // Esconder mensagens
                document.getElementById('result').classList.add('hidden')
                document.getElementById('error').classList.add('hidden')
                
                // Mostrar loading
                const btn = e.target.querySelector('button')
                const originalText = btn.innerHTML
                btn.disabled = true
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando vendas...'
                
                try {
                    const response = await axios.post('/api/test-sales', {
                        course_id: parseInt(course_id),
                        quantity,
                        send_email
                    })
                    
                    // Mostrar resultado
                    document.getElementById('result').classList.remove('hidden')
                    document.getElementById('resultContent').innerHTML = \`
                        <p class="mb-2"><strong>Curso:</strong> \${response.data.course}</p>
                        <p class="mb-2"><strong>Vendas criadas:</strong> \${response.data.sales.length}</p>
                        <p class="mb-2"><strong>Receita total:</strong> R$ \${(response.data.sales[0].amount * response.data.sales.length).toFixed(2)}</p>
                        <p class="text-xs mt-3 text-green-600">✅ Vendas adicionadas ao dashboard. Acesse o painel admin para visualizar.</p>
                    \`
                    
                    // Reset form
                    document.getElementById('quantity').value = '5'
                    document.getElementById('send_email').checked = false
                    
                } catch (error) {
                    document.getElementById('error').classList.remove('hidden')
                    document.getElementById('errorContent').textContent = error.response?.data?.error || error.message
                } finally {
                    btn.disabled = false
                    btn.innerHTML = originalText
                }
            })

            // Carregar cursos ao iniciar
            loadCourses()
        </script>
    </body>
    </html>
  `)
})

export default app
