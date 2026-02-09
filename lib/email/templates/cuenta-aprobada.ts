import { baseLayout, credentialBox, alertBox, stepsList, divider } from './base'

export function cuentaAprobadaTemplate(nombre: string, email: string, tempCred: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">Bienvenido/a, ${nombre}</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0;">Su cuenta en <strong>Movilidad</strong> ha sido aprobada exitosamente. A continuacion encontrara sus credenciales de acceso.</p>
    ${divider()}
    <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 8px;">Credenciales de acceso</p>
    ${credentialBox('Correo electronico', email)}
    ${credentialBox('Clave temporal', tempCred)}
    ${alertBox('warning', 'Por seguridad, debera cambiar esta clave en su primer inicio de sesion. La clave temporal dejara de funcionar despues del cambio.')}
    ${divider()}
    <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 4px;">Pasos para acceder</p>
    ${stepsList([
      'Ingrese al sistema con su correo y la clave temporal',
      'El sistema le pedira establecer una nueva clave',
      'Cree una clave segura (minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial)',
      'Listo, ya puede usar el sistema normalmente',
    ])}
  `)
}
