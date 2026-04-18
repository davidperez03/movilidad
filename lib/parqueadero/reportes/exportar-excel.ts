import ExcelJS from 'exceljs'
import type { FilaStock, FilaCierre, TipoReporteInv } from './tipos'

const COLOR = {
  headerBg: 'FF1E3A5F',
  headerFg: 'FFFFFFFF',
  altRow:   'FFF8FAFC',
  border:   'FFE2E8F0',
  rojo:     'FFDC2626',
  naranja:  'FFEA580C',
  verde:    'FF16A34A',
  label:    'FF64748B',
} as const

export async function generarExcelInventario(
  datos: FilaStock[] | FilaCierre[],
  tipo: TipoReporteInv,
  nombreArchivo: string
): Promise<void> {
  if (!datos.length) throw new Error('No hay datos para exportar')

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema Movilidad'
  wb.created = new Date()

  if (tipo === 'stock') {
    agregarHojaStock(wb, datos as FilaStock[])
  } else {
    agregarHojaCierres(wb, datos as FilaCierre[])
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.xlsx`; a.click()
  URL.revokeObjectURL(url)
}

function agregarHojaStock(wb: ExcelJS.Workbook, datos: FilaStock[]) {
  const ws = wb.addWorksheet('Stock Actual')
  const gruasKeys = datos.length > 0 ? Object.keys(datos[0].gruas) : []

  const cols = ['Ítem', 'Categoría', 'Unidad', 'Stock Mínimo', 'Bodega', ...gruasKeys, 'Total', 'Estado']
  ws.addRow(cols)
  ws.getRow(1).eachCell(c => {
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } }
    c.font   = { color: { argb: COLOR.headerFg }, bold: true, size: 11 }
    c.border = celBorder()
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  ws.getRow(1).height = 28

  datos.forEach((d, i) => {
    const estado = d.total === 0 ? 'Sin stock' : d.total <= d.stock_minimo ? 'Stock bajo' : 'Normal'
    const estadoColor = d.total === 0 ? COLOR.rojo : d.total <= d.stock_minimo ? COLOR.naranja : COLOR.verde
    const row = ws.addRow([
      d.nombre, d.categoria, d.unidad, d.stock_minimo, d.bodega,
      ...gruasKeys.map(k => d.gruas[k] ?? 0), d.total, estado,
    ])
    if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.altRow } }
    row.eachCell(c => { c.border = celBorder() })
    const estadoCell = row.getCell(cols.length)
    estadoCell.font = { color: { argb: estadoColor }, bold: true }
  })

  ws.columns.forEach((col, i) => {
    col.width = i === 0 ? 28 : i < 4 ? 14 : 12
  })
}

function agregarHojaCierres(wb: ExcelJS.Workbook, datos: FilaCierre[]) {
  const ws = wb.addWorksheet('Cierres de Turno')
  const cols = ['Fecha', 'Grúa', 'Ítem', 'Unidad', 'Inicial', 'Final', 'Consumido', 'Registrado por']
  ws.addRow(cols)
  ws.getRow(1).eachCell(c => {
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } }
    c.font   = { color: { argb: COLOR.headerFg }, bold: true, size: 11 }
    c.border = celBorder()
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  ws.getRow(1).height = 28

  datos.forEach((d, i) => {
    const row = ws.addRow([
      formatFecha(d.fecha), d.grua_placa, d.item_nombre, d.unidad,
      d.cantidad_inicial, d.cantidad_final, d.cantidad_consumida, d.registrado_por ?? '',
    ])
    if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.altRow } }
    row.eachCell(c => { c.border = celBorder() })
    if (d.cantidad_consumida > 0) {
      row.getCell(7).font = { color: { argb: COLOR.naranja }, bold: true }
    }
  })

  ws.columns.forEach((col, i) => {
    col.width = [12, 12, 28, 10, 10, 10, 12, 24][i] ?? 14
  })
}

function celBorder(): Partial<ExcelJS.Borders> {
  const s: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: COLOR.border } }
  return { top: s, left: s, bottom: s, right: s }
}

function formatFecha(f: string): string {
  try {
    const d = new Date(f + 'T00:00:00')
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  } catch { return f }
}
