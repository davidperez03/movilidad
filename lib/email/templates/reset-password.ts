import { baseLayout, credentialBox, alertBox, divider } from './base'

export function resetPasswordTemplate(nombre: string, email: string, tempCred: string): string {
  return baseLayout(`
    <p style="color:#111827;font-size:15px;margin:0 0 4px;">Hola ${nombre},</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0;">El administrador restablecio la clave de tu cuenta.</p>
    ${divider()}
    ${credentialBox('Correo', email)}
    ${credentialBox('Nueva clave temporal', tempCred)}
    ${alertBox('warning', 'Deberas cambiar esta clave en tu proximo inicio de sesion.')}
    ${alertBox('info', 'Si no solicitaste este cambio, contacta al administrador.')}
  `)
}
