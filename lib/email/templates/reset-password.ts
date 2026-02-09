import { baseLayout, credentialBox, alertBox, stepsList, divider } from './base'

export function resetPasswordTemplate(nombre: string, email: string, tempCred: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">Restablecimiento de clave</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0;">Hola <strong>${nombre}</strong>, el administrador ha restablecido la clave de su cuenta en <strong>Movilidad</strong>.</p>
    ${divider()}
    <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 8px;">Nuevas credenciales</p>
    ${credentialBox('Correo electronico', email)}
    ${credentialBox('Nueva clave temporal', tempCred)}
    ${alertBox('warning', 'Debera cambiar esta clave en su proximo inicio de sesion.')}
    ${alertBox('info', 'Si usted no solicito este cambio, contacte al administrador del sistema inmediatamente.')}
    ${divider()}
    <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 4px;">Pasos para acceder</p>
    ${stepsList([
      'Ingrese al sistema con su correo y la nueva clave temporal',
      'El sistema le pedira establecer una clave personal',
      'Cree una clave segura y continue usando el sistema',
    ])}
  `)
}
