function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;padding:40px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.07),0 2px 4px -2px rgba(0,0,0,0.05);max-width:520px;width:100%;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#171717 0%,#262626 100%);padding:28px 36px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Sistema de Movilidad</h1>
          <p style="margin:4px 0 0;color:#a3a3a3;font-size:13px;">Gestion de Transito y Transporte</p>
        </td>
        <td align="right" valign="middle">
          <div style="width:40px;height:40px;background-color:rgba(255,255,255,0.1);border-radius:10px;text-align:center;line-height:40px;">
            <span style="font-size:20px;">&#128663;</span>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:36px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 36px;background-color:#fafafa;border-top:1px solid #e5e5e5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td>
        <p style="margin:0 0 4px;color:#a1a1aa;font-size:11px;text-align:center;">Este es un mensaje automatico del Sistema de Movilidad. No responda a este correo.</p>
        <p style="margin:0;color:#a1a1aa;font-size:11px;text-align:center;">Si tiene dudas, contacte al administrador del sistema.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function credentialBox(label: string, value: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0;">
    <tr>
      <td style="padding:12px 16px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <p style="margin:0 0 2px;color:#6b7280;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
        <p style="margin:0;color:#111827;font-size:15px;font-weight:600;font-family:'Courier New',monospace;letter-spacing:0.5px;">${value}</p>
      </td>
    </tr>
  </table>`
}

function alertBox(type: 'warning' | 'info', text: string): string {
  const colors = {
    warning: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '&#9888;&#65039;' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '&#8505;&#65039;' },
  }
  const c = colors[type]
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr><td style="background-color:${c.bg};border-left:4px solid ${c.border};padding:14px 18px;border-radius:0 8px 8px 0;">
      <p style="margin:0;color:${c.text};font-size:13px;font-weight:500;line-height:1.5;">${c.icon} ${text}</p>
    </td></tr>
  </table>`
}

function stepsList(steps: string[]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    ${steps.map((step, i) => `<tr>
      <td width="32" valign="top" style="padding:8px 0;">
        <div style="width:26px;height:26px;background-color:#171717;border-radius:50%;text-align:center;line-height:26px;">
          <span style="color:#ffffff;font-size:13px;font-weight:700;">${i + 1}</span>
        </div>
      </td>
      <td style="padding:10px 0 10px 12px;color:#374151;font-size:14px;line-height:1.5;border-bottom:${i < steps.length - 1 ? '1px solid #f3f4f6' : 'none'};">${step}</td>
    </tr>`).join('')}
  </table>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`
}

export function cuentaAprobadaTemplate(nombre: string, email: string, tempCred: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">Bienvenido/a, ${nombre}</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0;">Su cuenta en el <strong>Sistema de Movilidad</strong> ha sido aprobada exitosamente. A continuacion encontrara sus credenciales de acceso.</p>
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
      'Cree una clave segura (minimo 8 caracteres, una mayuscula, una minuscula y un numero)',
      'Listo, ya puede usar el sistema normalmente',
    ])}
  `)
}

export function resetPasswordTemplate(nombre: string, email: string, tempCred: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">Restablecimiento de clave</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0;">Hola <strong>${nombre}</strong>, el administrador ha restablecido la clave de su cuenta en el <strong>Sistema de Movilidad</strong>.</p>
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
