import { createTransporter } from './transporter'
import { logger } from '@/lib/logger'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()
    const smtpUser = process.env.SMTP_USER || 'noreply@movilidad.com'

    await transporter.sendMail({
      from: `"Do Not Reply - Movilidad" <${smtpUser}>`,
      to,
      subject,
      html,
    })

    return true
  } catch (error) {
    logger.error('Error enviando email', { to, subject, error: String(error) })
    return false
  }
}
