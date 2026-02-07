function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <tr><td style="background-color:#171717;padding:24px 32px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Movilidad</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    ${content}
  </td></tr>
  <tr><td style="padding:16px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
    <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">Este es un mensaje automático, no responda a este correo.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function passwordBox(password: string): string {
  return `<div style="background-color:#fafafa;border:2px dashed #d4d4d8;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
    <p style="margin:0 0 4px;color:#71717a;font-size:13px;">Contraseña temporal</p>
    <p style="margin:0;font-size:20px;font-weight:700;font-family:monospace;color:#171717;letter-spacing:1px;">${password}</p>
  </div>`
}

function warningBar(text: string): string {
  return `<div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin:16px 0;">
    <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;">${text}</p>
  </div>`
}

export function cuentaAprobadaTemplate(nombre: string, email: string, password: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#171717;font-size:18px;">Bienvenido/a, ${nombre}</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">Su cuenta en el sistema <strong>Movilidad</strong> ha sido aprobada. A continuación encontrará sus credenciales de acceso:</p>
    <table width="100%" style="margin:12px 0;">
      <tr><td style="padding:8px 0;color:#71717a;font-size:13px;">Correo:</td><td style="padding:8px 0;font-weight:600;color:#171717;font-size:14px;">${email}</td></tr>
    </table>
    ${passwordBox(password)}
    ${warningBar('Debe cambiar esta contraseña en su primer inicio de sesión.')}
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin-top:20px;">Si tiene alguna pregunta, contacte al administrador del sistema.</p>
  `)
}

export function resetPasswordTemplate(nombre: string, email: string, password: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#171717;font-size:18px;">Restablecimiento de contraseña</h2>
    <p style="color:#52525b;font-size:14px;line-height:1.6;">Hola <strong>${nombre}</strong>, se ha restablecido la contraseña de su cuenta en el sistema <strong>Movilidad</strong>.</p>
    <table width="100%" style="margin:12px 0;">
      <tr><td style="padding:8px 0;color:#71717a;font-size:13px;">Correo:</td><td style="padding:8px 0;font-weight:600;color:#171717;font-size:14px;">${email}</td></tr>
    </table>
    ${passwordBox(password)}
    ${warningBar('Debe cambiar esta contraseña en su próximo inicio de sesión.')}
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin-top:20px;">Si usted no solicitó este cambio, contacte al administrador inmediatamente.</p>
  `)
}
