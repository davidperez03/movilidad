import ExcelJS from 'exceljs'
import type { FilaSesionNunc, FilaRegistroNunc, FiltrosNunc } from './tipos'

const COLOR = {
  headerBg: 'FF78350F',
  headerFg: 'FFFFFFFF',
  resumenBg: 'FF92400E',
  resumenFg: 'FFFFFFFF',
  altRow:    'FFFFFFED',
  border:    'FFE2E8F0',
  labelFg:   'FF64748B',
  verde:     'FF16A34A',
  gris:      'FF6B7280',
  rojo:      'FFDC2626',
} as const

function celBorder(): Partial<ExcelJS.Borders> {
  const s: Partial<ExcelJS.Border> = { style: 'hair', color: { argb: COLOR.border } }
  return { top: s, left: s, bottom: s, right: s }
}

function aplicarEstilosHoja(ws: ExcelJS.Worksheet): void {
  const totalColumnas = ws.columnCount
  const headerRow = ws.getRow(1)
  headerRow.height = 24
  headerRow.eachCell(c => {
    c.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } },
      font: { bold: true, color: { argb: COLOR.headerFg }, size: 9 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: celBorder(),
    }
  })
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: totalColumnas } }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return
    row.height = 18
    row.eachCell({ includeEmpty: true }, c => {
      c.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: rowNumber % 2 === 0 ? COLOR.altRow : 'FFFFFFFF' } },
        font: { size: 9, color: { argb: 'FF1E293B' } },
        alignment: { vertical: 'middle' },
        border: celBorder(),
      }
    })
  })
}

function formatFecha(f: string | null | undefined): string {
  if (!f) return ''
  try {
    const d = new Date(f)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  } catch { return f ?? '' }
}

function formatFechaHora(f: string | null | undefined): string {
  if (!f) return ''
  try {
    const d = new Date(f)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  } catch { return f ?? '' }
}

function labelEstado(estado: string): string {
  if (estado === 'activa') return 'Activa'
  if (estado === 'cerrada') return 'Cerrada'
  return 'Expirada'
}

function agregarResumen(
  wb: ExcelJS.Workbook,
  titulo: string,
  total: number,
  filtros?: FiltrosNunc,
  subtitulo?: string
) {
  const ws = wb.addWorksheet('Resumen')
  ws.getColumn(1).width = 28
  ws.getColumn(2).width = 44

  const ahora = new Date()
  const fechaGen = `${ahora.getDate()}/${ahora.getMonth()+1}/${ahora.getFullYear()} ${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`

  const tituloRow = ws.addRow([titulo, ''])
  ws.mergeCells(`A${tituloRow.number}:B${tituloRow.number}`)
  tituloRow.height = 28
  tituloRow.getCell(1).style = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.resumenBg } },
    font: { bold: true, color: { argb: COLOR.resumenFg }, size: 13 },
    alignment: { vertical: 'middle', horizontal: 'center' },
  }
  if (subtitulo) {
    const subRow = ws.addRow([subtitulo, ''])
    ws.mergeCells(`A${subRow.number}:B${subRow.number}`)
    subRow.getCell(1).style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
      font: { size: 9, color: { argb: COLOR.labelFg } },
      alignment: { vertical: 'middle', horizontal: 'center' },
    }
  }
  ws.addRow([''])

  const addFila = (label: string, value: string, bold = false, alt = false) => {
    const row = ws.addRow([label, value])
    row.height = 17
    const bg = alt ? COLOR.altRow : 'FFFFFFFF'
    row.getCell(1).style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, font: { bold: true, size: 9, color: { argb: COLOR.labelFg } }, alignment: { vertical: 'middle' }, border: celBorder() }
    row.getCell(2).style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, font: { bold, size: 9, color: { argb: 'FF1E293B' } }, alignment: { vertical: 'middle' }, border: celBorder() }
  }

  addFila('Módulo', 'Estudios NUNC', true)
  addFila('Fecha de Generación', fechaGen, false, true)
  addFila('Total de Registros', total.toString(), true)

  if (filtros) {
    ws.addRow([''])
    const filtTitulo = ws.addRow(['FILTROS APLICADOS', ''])
    ws.mergeCells(`A${filtTitulo.number}:B${filtTitulo.number}`)
    filtTitulo.getCell(1).style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } },
      font: { bold: true, size: 9, color: { argb: COLOR.resumenBg } },
      alignment: { vertical: 'middle', horizontal: 'left' },
      border: celBorder(),
    }
    addFila('Fecha Inicio', filtros.fechaInicio || 'Todas')
    addFila('Fecha Fin', filtros.fechaFin || 'Todas', false, true)
  }
}

export async function generarExcelSesiones(
  datos: FilaSesionNunc[],
  filtros: FiltrosNunc,
  nombreArchivo: string
): Promise<void> {
  if (!datos.length) throw new Error('No hay datos para exportar')

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema Movilidad'
  wb.created = new Date()

  const ws = wb.addWorksheet('Sesiones NUNC')
  ws.columns = [
    { header: 'Código',        key: 'codigo',          width: 10 },
    { header: 'Entidad',       key: 'entidad_nombre',  width: 30 },
    { header: 'Peritos',       key: 'nombre_peritos',  width: 30 },
    { header: 'Estado',        key: 'estado',          width: 12 },
    { header: 'Vehículos',     key: 'total_registros', width: 12 },
    { header: 'Generada por',  key: 'generado_por',    width: 28 },
    { header: 'Fecha Creación',key: 'creado_en',       width: 18 },
    { header: 'Expira',        key: 'expira_en',       width: 18 },
  ]
  ws.addRows(datos.map(d => ({
    codigo:          d.codigo,
    entidad_nombre:  d.entidad_nombre,
    nombre_peritos:  d.nombre_peritos,
    estado:          labelEstado(d.estado),
    total_registros: d.total_registros,
    generado_por:    d.generado_por || '',
    creado_en:       formatFechaHora(d.creado_en),
    expira_en:       formatFecha(d.expira_en),
  })))
  aplicarEstilosHoja(ws)

  // Color por estado
  ws.eachRow((row, n) => {
    if (n <= 1) return
    const estadoCell = row.getCell('estado')
    const val = String(estadoCell.value)
    const color = val === 'Activa' ? COLOR.verde : val === 'Cerrada' ? COLOR.gris : COLOR.rojo
    estadoCell.font = { ...estadoCell.font as ExcelJS.Font, color: { argb: color }, bold: true }
  })

  agregarResumen(wb, 'REPORTE ESTUDIOS NUNC — Sesiones', datos.length, filtros)

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.xlsx`; a.click()
  URL.revokeObjectURL(url)
}

export async function generarExcelRegistros(
  datos: FilaRegistroNunc[],
  codigoSesion: string,
  entidad: string,
  nombreArchivo: string
): Promise<void> {
  if (!datos.length) throw new Error('No hay registros para exportar')

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema Movilidad'
  wb.created = new Date()

  const ws = wb.addWorksheet('Registros')
  ws.columns = [
    { header: '#',             key: 'num',             width: 6  },
    { header: 'Placa',         key: 'placa',           width: 12 },
    { header: 'NUNC Completo', key: 'nunc_completo',   width: 32 },
    { header: 'Departamento',  key: 'nunc_dpto',       width: 14 },
    { header: 'Municipio',     key: 'nunc_municipio',  width: 14 },
    { header: 'Entidad',       key: 'nunc_entidad',    width: 12 },
    { header: 'Unidad',        key: 'nunc_unidad',     width: 12 },
    { header: 'Año',           key: 'nunc_anio',       width: 8  },
    { header: 'Consecutivo',   key: 'nunc_consecutivo',width: 14 },
    { header: 'Observaciones', key: 'observaciones',   width: 30 },
    { header: 'Hora Registro', key: 'registrado_en',   width: 16 },
  ]
  ws.addRows(datos.map((d, i) => ({
    num:             i + 1,
    placa:           d.placa,
    nunc_completo:   d.nunc_completo,
    nunc_dpto:       d.nunc_dpto,
    nunc_municipio:  d.nunc_municipio,
    nunc_entidad:    d.nunc_entidad,
    nunc_unidad:     d.nunc_unidad,
    nunc_anio:       d.nunc_anio,
    nunc_consecutivo:d.nunc_consecutivo,
    observaciones:   d.observaciones || '',
    registrado_en:   formatFechaHora(d.registrado_en),
  })))
  aplicarEstilosHoja(ws)

  agregarResumen(
    wb,
    'REPORTE ESTUDIOS NUNC — Registros',
    datos.length,
    undefined,
    `Sesión: ${codigoSesion} | ${entidad}`
  )

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.xlsx`; a.click()
  URL.revokeObjectURL(url)
}
