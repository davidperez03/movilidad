import ExcelJS from 'exceljs'
import { excelBorder, formatFecha, descargarExcel, EXCEL_COLORS } from '@/lib/shared/excel-base'
import type { FilaStock, FilaCierre, TipoReporteInv } from './tipos'

const COLOR_ROJO   = 'FFDC2626'
const COLOR_NARANJA = 'FFEA580C'
const COLOR_VERDE  = 'FF16A34A'

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

  await descargarExcel(wb, nombreArchivo)
}

function agregarHojaStock(wb: ExcelJS.Workbook, datos: FilaStock[]) {
  const ws = wb.addWorksheet('Stock Actual')
  const gruasKeys = datos.length > 0 ? Object.keys(datos[0].gruas) : []

  const cols = ['Ítem', 'Categoría', 'Unidad', 'Stock Mínimo', 'Bodega', ...gruasKeys, 'Total', 'Estado']
  ws.addRow(cols)
  ws.getRow(1).eachCell(c => {
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBg } }
    c.font   = { color: { argb: EXCEL_COLORS.headerFg }, bold: true, size: 11 }
    c.border = excelBorder()
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  ws.getRow(1).height = 28

  datos.forEach((d, i) => {
    const estado = d.total === 0 ? 'Sin stock' : d.total <= d.stock_minimo ? 'Stock bajo' : 'Normal'
    const estadoColor = d.total === 0 ? COLOR_ROJO : d.total <= d.stock_minimo ? COLOR_NARANJA : COLOR_VERDE
    const row = ws.addRow([
      d.nombre, d.categoria, d.unidad, d.stock_minimo, d.bodega,
      ...gruasKeys.map(k => d.gruas[k] ?? 0), d.total, estado,
    ])
    if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.altRow } }
    row.eachCell(c => { c.border = excelBorder() })
    row.getCell(cols.length).font = { color: { argb: estadoColor }, bold: true }
  })

  ws.columns.forEach((col, i) => { col.width = i === 0 ? 28 : i < 4 ? 14 : 12 })
}

function agregarHojaCierres(wb: ExcelJS.Workbook, datos: FilaCierre[]) {
  const ws = wb.addWorksheet('Cierres de Turno')
  const cols = ['Fecha', 'Grúa', 'Ítem', 'Unidad', 'Inicial', 'Final', 'Consumido', 'Registrado por']
  ws.addRow(cols)
  ws.getRow(1).eachCell(c => {
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBg } }
    c.font   = { color: { argb: EXCEL_COLORS.headerFg }, bold: true, size: 11 }
    c.border = excelBorder()
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  ws.getRow(1).height = 28

  datos.forEach((d, i) => {
    const row = ws.addRow([
      formatFecha(d.fecha), d.grua_placa, d.item_nombre, d.unidad,
      d.cantidad_inicial, d.cantidad_final, d.cantidad_consumida, d.registrado_por ?? '',
    ])
    if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.altRow } }
    row.eachCell(c => { c.border = excelBorder() })
    if (d.cantidad_consumida > 0) row.getCell(7).font = { color: { argb: COLOR_NARANJA }, bold: true }
  })

  ws.columns.forEach((col, i) => { col.width = [12, 12, 28, 10, 10, 10, 12, 24][i] ?? 14 })
}
