import { baseLayout, credentialBox, alertBox, divider, escapeHtml } from './base'

export function cuentaAprobadaTemplate(nombre: string, email: string, tempCred: string): string {
  const safeNombre = escapeHtml(nombre)
  return baseLayout(`
    <p style="color:#111827;font-size:15px;margin:0 0 4px;">Hola ${safeNombre},</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0;">Tu cuenta fue aprobada. Estas son tus credenciales:</p>
    ${divider()}
    ${credentialBox('Correo', email)}
    ${credentialBox('Clave temporal', tempCred)}
    ${alertBox('warning', 'Deberas cambiar esta clave en tu primer inicio de sesion.')}
    ${divider()}
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">
      1. Ingresa con tu correo y la clave temporal<br>
      2. El sistema te pedira crear una nueva clave<br>
      3. Listo
    </p>
  `)
}
