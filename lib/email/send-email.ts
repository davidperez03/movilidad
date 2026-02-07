import { createTransporter } from './transporter'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@movilidad.com'

    await transporter.sendMail({
      from: `"No-Reply – Movilidad" <${from}>`,
      to,
      subject,
      html,
    })

    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error enviando email:', error)
    }
    return false
  }
}
