import { baseLayout, alertBox, divider } from './base'

export function recuperarPasswordTemplate(nombre: string, resetUrl: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">Recuperacion de contraseña</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0;">Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer la contraseña de su cuenta en <strong>Movilidad</strong>.</p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
      <tr><td align="center">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#171717 0%,#262626 100%);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">Restablecer contraseña</a>
      </td></tr>
    </table>
    ${alertBox('info', 'Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.')}
    ${divider()}
    <p style="color:#6b7280;font-size:12px;line-height:1.5;margin:0;">Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
    <p style="color:#3b82f6;font-size:12px;word-break:break-all;margin:6px 0 0;">${resetUrl}</p>
  `)
}
