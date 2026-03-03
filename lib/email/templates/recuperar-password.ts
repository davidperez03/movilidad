import { baseLayout, alertBox, divider, escapeHtml } from './base'

export function recuperarPasswordTemplate(nombre: string, resetUrl: string): string {
  const safeNombre = escapeHtml(nombre)
  const safeUrl = escapeHtml(resetUrl)
  return baseLayout(`
    <p style="color:#111827;font-size:15px;margin:0 0 4px;">Hola ${safeNombre},</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0;">Recibimos una solicitud para restablecer tu contraseña.</p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="padding:4px 0 8px;">
        <a href="${safeUrl}" style="display:inline-block;background-color:#171717;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">Restablecer contraseña</a>
      </td></tr>
    </table>
    ${alertBox('info', 'Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.')}
    ${divider()}
    <p style="color:#9ca3af;font-size:11px;line-height:1.4;margin:0;">Si el boton no funciona, copia este enlace en tu navegador:<br>
    <span style="color:#6b7280;word-break:break-all;">${safeUrl}</span></p>
  `)
}
