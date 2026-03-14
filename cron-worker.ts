// Worker separado para o cronjob de verificação de pagamentos pendentes
// Este worker será deployado separadamente e configurado com um cron trigger

interface Bindings {
  DB: D1Database;
  MERCADOPAGO_ACCESS_TOKEN: string;
  MERCADOPAGO_TEST_ACCESS_TOKEN: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('[CRONJOB] 🔄 Iniciando verificação de pagamentos pendentes...')
    
    try {
      const DB = env.DB
      const MERCADOPAGO_ACCESS_TOKEN = env.MERCADOPAGO_ACCESS_TOKEN
      const RESEND_API_KEY = env.RESEND_API_KEY
      const EMAIL_FROM = env.EMAIL_FROM
      
      // Buscar vendas pendentes dos últimos 30 minutos
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      
      const pendingSales = await DB.prepare(`
        SELECT 
          s.id,
          s.customer_name,
          s.customer_email,
          s.amount,
          s.payment_id,
          s.access_token,
          s.status,
          s.purchased_at,
          c.title as course_title,
          c.pdf_url
        FROM sales s
        JOIN courses c ON s.course_id = c.id
        WHERE s.status = 'pending'
          AND s.payment_id IS NOT NULL
          AND s.purchased_at >= ?
        ORDER BY s.purchased_at DESC
      `).bind(thirtyMinutesAgo).all()
      
      console.log(`[CRONJOB] 📋 Encontradas ${pendingSales.results.length} vendas pendentes`)
      
      if (pendingSales.results.length === 0) {
        console.log('[CRONJOB] ✅ Nenhuma venda pendente. Tudo certo!')
        return
      }
      
      let approvedCount = 0
      let rejectedCount = 0
      let stillPendingCount = 0
      
      // Processar cada venda pendente
      for (const sale of pendingSales.results as any[]) {
        try {
          console.log(`[CRONJOB] 🔍 Verificando pagamento ${sale.payment_id}...`)
          
          // Consultar status no Mercado Pago
          const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${sale.payment_id}`, {
            headers: {
              'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (!mpResponse.ok) {
            console.error(`[CRONJOB] ⚠️ Erro ao consultar MP: ${mpResponse.status}`)
            continue
          }
          
          const paymentData = await mpResponse.json()
          const mpStatus = paymentData.status
          
          console.log(`[CRONJOB] 📊 Payment ${sale.payment_id} - Status: ${mpStatus}`)
          
          // Mapear status
          let newStatus = 'pending'
          
          if (mpStatus === 'approved' || mpStatus === 'authorized') {
            newStatus = 'completed'
            approvedCount++
          } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
            newStatus = 'failed'
            rejectedCount++
          } else if (mpStatus === 'pending' || mpStatus === 'in_process') {
            stillPendingCount++
            continue
          } else if (mpStatus === 'refunded' || mpStatus === 'charged_back') {
            newStatus = 'refunded'
          }
          
          // Atualizar status no banco
          console.log(`[CRONJOB] 💾 Atualizando venda ${sale.id} para '${newStatus}'`)
          
          await DB.prepare(`
            UPDATE sales 
            SET status = ?
            WHERE id = ?
          `).bind(newStatus, sale.id).run()
          
          // Se aprovado, enviar email
          if (newStatus === 'completed') {
            console.log(`[CRONJOB] 📧 Enviando email para ${sale.customer_email}...`)
            
            const downloadLink = sale.pdf_url 
              ? `https://kncursos.com.br/download/${sale.access_token}`
              : null
            
            const emailHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .header h1 { margin: 0; font-size: 28px; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                  .info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
                  .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🎉 Pagamento Confirmado!</h1>
                </div>
                <div class="content">
                  <p>Olá <strong>${sale.customer_name}</strong>,</p>
                  <p>Seu pagamento foi aprovado com sucesso!</p>
                  <div class="info">
                    <p><strong>Curso:</strong> ${sale.course_title}</p>
                    <p><strong>Valor:</strong> R$ ${parseFloat(sale.amount).toFixed(2)}</p>
                    <p><strong>ID Pagamento:</strong> ${sale.payment_id}</p>
                  </div>
                  ${downloadLink ? `
                    <p>Clique no botão abaixo para fazer o download:</p>
                    <a href="${downloadLink}" class="button">📥 Baixar Curso Agora</a>
                  ` : `
                    <p>O acesso será liberado em breve.</p>
                  `}
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} KN Cursos</p>
                  </div>
                </div>
              </body>
              </html>
            `
            
            try {
              const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: EMAIL_FROM,
                  to: sale.customer_email,
                  subject: `Seu acesso ao curso: ${sale.course_title}`,
                  html: emailHtml
                })
              })
              
              if (response.ok) {
                console.log(`[CRONJOB] ✅ Email enviado`)
              } else {
                console.error(`[CRONJOB] ⚠️ Erro ao enviar email: ${response.status}`)
              }
            } catch (emailError) {
              console.error(`[CRONJOB] ⚠️ Erro no email:`, emailError)
            }
          }
          
        } catch (error) {
          console.error(`[CRONJOB] ❌ Erro ao processar venda ${sale.id}:`, error)
        }
      }
      
      console.log('[CRONJOB] ✅ Verificação concluída!')
      console.log(`[CRONJOB] 📊 Resumo: ${approvedCount} aprovados | ${rejectedCount} rejeitados | ${stillPendingCount} pendentes`)
      
    } catch (error) {
      console.error('[CRONJOB] ❌ Erro geral:', error)
    }
  }
}
