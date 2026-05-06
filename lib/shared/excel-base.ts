import ExcelJS from 'exceljs'

export const EXCEL_COLORS = {
  headerBg: 'FF1E3A5F',
  headerFg: 'FFFFFFFF',
  altRow:   'FFF8FAFC',
  border:   'FFE2E8F0',
  labelFg:  'FF64748B',
  text:     'FF1E293B',
} as const

export function excelBorder(color: string = EXCEL_COLORS.border): Partial<ExcelJS.Borders> {
  const s: Partial<ExcelJS.Border> = { style: 'hair', color: { argb: color } }
  return { top: s, left: s, bottom: s, right: s }
}

export function aplicarEstilosTabla(ws: ExcelJS.Worksheet): void {
  const totalColumnas = ws.columnCount
  const headerRow = ws.getRow(1)
  headerRow.height = 24
  headerRow.eachCell(c => {
    c.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBg } },
      font: { bold: true, color: { argb: EXCEL_COLORS.headerFg }, size: 9 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: excelBorder(EXCEL_COLORS.headerBg),
    }
  })
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: totalColumnas } }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.eachRow((row, n) => {
    if (n <= 1) return
    row.height = 18
    row.eachCell({ includeEmpty: true }, c => {
      c.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: n % 2 === 0 ? EXCEL_COLORS.altRow : 'FFFFFFFF' } },
        font: { size: 9, color: { argb: EXCEL_COLORS.text } },
        alignment: { vertical: 'middle' },
        border: excelBorder(),
      }
    })
  })
}

export function formatFecha(f: string | null | undefined): string {
  if (!f) return ''
  try {
    const d = new Date(f)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  } catch { return f ?? '' }
}

export function formatFechaHora(f: string | null | undefined): string {
  if (!f) return ''
  try {
    const d = new Date(f)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  } catch { return f ?? '' }
}

export async function descargarExcel(wb: ExcelJS.Workbook, nombreArchivo: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.xlsx`; a.click()
  URL.revokeObjectURL(url)
}
