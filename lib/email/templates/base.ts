export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;max-width:480px;width:100%;">
  <tr><td style="background-color:#171717;padding:20px 28px;">
    <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Movilidad</h1>
  </td></tr>
  <tr><td style="padding:28px;">
    ${content}
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;color:#a1a1aa;font-size:11px;text-align:center;">Mensaje automatico — No responder a este correo.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export function credentialBox(label: string, value: string): string {
  const safeLabel = escapeHtml(label)
  const safeValue = escapeHtml(value)
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:6px 0;">
    <tr>
      <td style="padding:10px 14px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
        <p style="margin:0 0 2px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${safeLabel}</p>
        <p style="margin:0;color:#111827;font-size:14px;font-weight:600;font-family:'Courier New',monospace;">${safeValue}</p>
      </td>
    </tr>
  </table>`
}

export function alertBox(type: 'warning' | 'info', text: string): string {
  const colors = {
    warning: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  }
  const c = colors[type]
  const safeText = escapeHtml(text)
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
    <tr><td style="background-color:${c.bg};border-left:3px solid ${c.border};padding:10px 14px;border-radius:0 6px 6px 0;">
      <p style="margin:0;color:${c.text};font-size:12px;line-height:1.5;">${safeText}</p>
    </td></tr>
  </table>`
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">`
}
