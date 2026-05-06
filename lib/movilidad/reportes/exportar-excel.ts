import ExcelJS from 'exceljs'
import { excelBorder as sharedBorder, formatFecha as sharedFecha, formatFechaHora as sharedFechaHora, descargarExcel } from '@/lib/shared/excel-base'
import type {
  TipoReporte,
  FiltrosReporte,
  DatosReporteActivos,
  DatosReporteCompletados,
  DatosReportePorVencer,
  DatosReporteVencidos,
} from './tipos'
import { obtenerEtiquetaUrgenciaPorVencer } from './urgencia'

interface DatosAuditoria {
  creado_en: string
  modulo: string
  accion: string
  entidad_tipo: string
  usuario_nombre: string
  usuario_correo: string
  valor_anterior: string | null
  valor_nuevo: string | null
}

// =====================================================
// PALETA DE COLORES
// =====================================================
const COLOR = {
  headerBg: 'FF1E3A5F',   // Azul marino — fondo cabecera
  headerFg: 'FFFFFFFF',   // Blanco — texto cabecera
  resumenBg: 'FF1E40AF',  // Azul profundo — título hoja resumen
  resumenFg: 'FFFFFFFF',  // Blanco — texto título resumen
  sectionFg: 'FF1E3A5F',  // Azul marino — texto sección
  altRow: 'FFF8FAFC',     // Gris muy suave — filas alternas
  border: 'FFE2E8F0',     // Gris claro — bordes
  vencidoFg: 'FFDC2626',  // Rojo — texto vencido
  urgenteFg: 'FFEA580C',  // Naranja — texto urgente
  labelFg: 'FF64748B',    // Gris — texto etiqueta resumen
} as const

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generarExcelReporte(
  datos: any[],
  tipoReporte: TipoReporte,
  filtros: FiltrosReporte,
  nombreArchivo: string
): Promise<void> {
  if (!datos || datos.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistema de Movilidad'
  wb.created = new Date()
  wb.modified = new Date()

  switch (tipoReporte) {
    case 'activos':
      generarHojaActivos(wb, datos as unknown as DatosReporteActivos[])
      break
    case 'completados':
      generarHojaCompletados(wb, datos as unknown as DatosReporteCompletados[])
      break
    case 'por-vencer':
      generarHojaPorVencer(wb, datos as unknown as DatosReportePorVencer[])
      break
    case 'vencidos':
      generarHojaVencidos(wb, datos as unknown as DatosReporteVencidos[])
      break
    case 'auditoria':
      generarHojaAuditoria(wb, datos as unknown as DatosAuditoria[])
      break
    default:
      throw new Error(`Tipo de reporte no soportado: ${tipoReporte}`)
  }

  generarHojaResumen(wb, tipoReporte, filtros, datos.length)
  await descargarExcel(wb, nombreArchivo)
}

// =====================================================
// HOJAS DE DATOS POR TIPO DE REPORTE
// =====================================================

function generarHojaActivos(wb: ExcelJS.Workbook, datos: DatosReporteActivos[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 12 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 16 },
    { header: 'Tipo Servicio', key: 'tipo_servicio', width: 16 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 16 },
    { header: 'Estado', key: 'proceso_estado', width: 22 },
    { header: 'Organismo', key: 'ciudad', width: 32 },
    { header: 'Fecha Trámite', key: 'fecha_tramite', width: 16 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 20 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 16 },
  ]
  ws.addRows(
    datos.map((d) => ({
      placa: d.placa,
      numero_cuenta: d.numero_cuenta,
      tipo_servicio: d.tipo_servicio,
      proceso_tipo: d.proceso_tipo,
      proceso_estado: d.proceso_estado,
      ciudad: d.ciudad,
      fecha_tramite: formatearFecha(d.fecha_tramite),
      fecha_vencimiento: formatearFecha(d.fecha_vencimiento),
      dias_restantes: d.dias_restantes !== null ? d.dias_restantes : '',
    }))
  )
  aplicarEstilosHoja(ws)
}

function generarHojaCompletados(wb: ExcelJS.Workbook, datos: DatosReporteCompletados[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 12 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 16 },
    { header: 'Tipo Servicio', key: 'tipo_servicio', width: 16 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 16 },
    { header: 'Estado Final', key: 'estado', width: 16 },
    { header: 'Organismo', key: 'organismo', width: 32 },
    { header: 'Fecha Completado', key: 'fecha_completado', width: 20 },
    { header: 'Duración (días)', key: 'duracion_dias', width: 16 },
    { header: 'Responsable', key: 'responsable', width: 28 },
  ]
  ws.addRows(
    datos.map((d) => ({
      placa: d.placa,
      numero_cuenta: d.numero_cuenta,
      tipo_servicio: d.tipo_servicio,
      proceso_tipo: d.proceso_tipo,
      estado: d.estado,
      organismo: d.organismo,
      fecha_completado: formatearFecha(d.fecha_completado),
      duracion_dias: d.duracion_dias,
      responsable: d.responsable,
    }))
  )
  aplicarEstilosHoja(ws)
}

function generarHojaPorVencer(wb: ExcelJS.Workbook, datos: DatosReportePorVencer[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 12 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 16 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 16 },
    { header: 'Estado', key: 'estado', width: 22 },
    { header: 'Organismo', key: 'ciudad', width: 32 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 20 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 16 },
    { header: 'Urgencia', key: 'urgencia', width: 14 },
    { header: 'Responsable', key: 'responsable', width: 28 },
  ]
  ws.addRows(
    datos.map((d) => ({
      placa: d.placa,
      numero_cuenta: d.numero_cuenta,
      proceso_tipo: d.proceso_tipo,
      estado: d.estado,
      ciudad: d.ciudad,
      fecha_vencimiento: formatearFecha(d.fecha_vencimiento),
      dias_restantes: d.dias_restantes,
      urgencia: obtenerEtiquetaUrgenciaPorVencer(d.dias_restantes),
      responsable: d.responsable,
    }))
  )
  aplicarEstilosHoja(ws)

  // Resaltar filas urgentes
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return
    const dias = row.getCell('dias_restantes').value
    if (typeof dias === 'number') {
      if (dias <= 0) aplicarColorFila(row, 'FFFEF2F2', COLOR.vencidoFg)
      else if (dias <= 5) aplicarColorFila(row, 'FFFFF7ED', COLOR.urgenteFg)
    }
  })
}

function generarHojaAuditoria(wb: ExcelJS.Workbook, datos: DatosAuditoria[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Fecha/Hora', key: 'creado_en', width: 20 },
    { header: 'Módulo', key: 'modulo', width: 14 },
    { header: 'Acción', key: 'accion', width: 22 },
    { header: 'Entidad', key: 'entidad_tipo', width: 16 },
    { header: 'Usuario', key: 'usuario_nombre', width: 28 },
    { header: 'Correo', key: 'usuario_correo', width: 32 },
    { header: 'Estado Anterior', key: 'valor_anterior', width: 20 },
    { header: 'Estado Nuevo', key: 'valor_nuevo', width: 20 },
  ]
  ws.addRows(
    datos.map((d) => ({
      creado_en: formatearFechaHora(d.creado_en),
      modulo: d.modulo,
      accion: d.accion,
      entidad_tipo: d.entidad_tipo,
      usuario_nombre: d.usuario_nombre,
      usuario_correo: d.usuario_correo,
      valor_anterior: d.valor_anterior || '',
      valor_nuevo: d.valor_nuevo || '',
    }))
  )
  aplicarEstilosHoja(ws)
}

function generarHojaVencidos(wb: ExcelJS.Workbook, datos: DatosReporteVencidos[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 12 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 16 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 16 },
    { header: 'Estado', key: 'estado', width: 22 },
    { header: 'Organismo', key: 'ciudad', width: 32 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 20 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 16 },
    { header: 'Días Vencidos', key: 'dias_vencidos', width: 16 },
    { header: 'Responsable', key: 'responsable', width: 28 },
  ]
  ws.addRows(
    datos.map((d) => ({
      placa: d.placa,
      numero_cuenta: d.numero_cuenta,
      proceso_tipo: d.proceso_tipo,
      estado: d.estado,
      ciudad: d.ciudad,
      fecha_vencimiento: formatearFecha(d.fecha_vencimiento),
      dias_restantes: d.dias_restantes,
      dias_vencidos: d.dias_vencidos,
      responsable: d.responsable,
    }))
  )
  aplicarEstilosHoja(ws)

  // Todas las filas en rojo tenue
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return
    aplicarColorFila(row, 'FFFEF2F2', COLOR.vencidoFg)
  })
}

// =====================================================
// HOJA DE RESUMEN
// =====================================================

function generarHojaResumen(
  wb: ExcelJS.Workbook,
  tipoReporte: TipoReporte,
  filtros: FiltrosReporte,
  totalRegistros: number
): void {
  const ws = wb.addWorksheet('Resumen')
  ws.getColumn(1).width = 28
  ws.getColumn(2).width = 44

  const ahora = new Date()
  const fechaGeneracion = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()} ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`

  // Título principal
  const tituloRow = ws.addRow(['REPORTE DE MOVILIDAD', ''])
  ws.mergeCells(`A${tituloRow.number}:B${tituloRow.number}`)
  tituloRow.height = 28
  tituloRow.getCell(1).style = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.resumenBg } },
    font: { bold: true, color: { argb: COLOR.resumenFg }, size: 13 },
    alignment: { vertical: 'middle', horizontal: 'center' },
  }

  ws.addRow([''])

  // Datos generales
  agregarFilaResumen(ws, 'Tipo de Reporte', obtenerTituloReporte(tipoReporte), true)
  agregarFilaResumen(ws, 'Fecha de Generación', fechaGeneracion, false, true)
  agregarFilaResumen(ws, 'Total de Registros', totalRegistros.toString(), true)

  ws.addRow([''])

  // Sección filtros
  const filtrosTituloRow = ws.addRow(['FILTROS APLICADOS', ''])
  ws.mergeCells(`A${filtrosTituloRow.number}:B${filtrosTituloRow.number}`)
  filtrosTituloRow.height = 18
  filtrosTituloRow.getCell(1).style = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } },
    font: { bold: true, color: { argb: COLOR.sectionFg }, size: 9 },
    alignment: { vertical: 'middle', horizontal: 'left' },
    border: bordesDelgados(),
  }

  agregarFilaResumen(ws, 'Fecha Inicio', filtros.fechaInicio || 'Todos')
  agregarFilaResumen(ws, 'Fecha Fin', filtros.fechaFin || 'Todos', false, true)
  agregarFilaResumen(ws, 'Estado', filtros.estado === 'todos' ? 'Todos' : filtros.estado)
  agregarFilaResumen(ws, 'Organismo', filtros.organismoId === 'todos' ? 'Todos' : filtros.organismoId, false, true)
  agregarFilaResumen(ws, 'Tipo de Proceso', filtros.tipoProceso === 'todos' ? 'Todos' : filtros.tipoProceso)
  agregarFilaResumen(ws, 'Responsable', filtros.responsable === 'todos' ? 'Todos' : filtros.responsable, false, true)
}

// =====================================================
// HELPERS DE ESTILO
// =====================================================

function aplicarEstilosHoja(ws: ExcelJS.Worksheet): void {
  const totalColumnas = ws.columnCount

  // Cabecera
  const headerRow = ws.getRow(1)
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.style = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } },
      font: { bold: true, color: { argb: COLOR.headerFg }, size: 9 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: bordesDelgados(COLOR.headerBg),
    }
  })

  // Autofilter y freeze
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: totalColumnas } }
  ws.views = [{ state: 'frozen', ySplit: 1 }]

  // Filas de datos
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return
    const isAlt = rowNumber % 2 === 0
    row.height = 18
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? COLOR.altRow : 'FFFFFFFF' } },
        font: { size: 9, color: { argb: 'FF1E293B' } },
        alignment: { vertical: 'middle' },
        border: bordesDelgados(),
      }
    })
  })
}

function aplicarColorFila(row: ExcelJS.Row, bgArgb: string, fgArgb: string): void {
  row.eachCell({ includeEmpty: true }, (cell) => {
    const fontActual = (cell.style.font as ExcelJS.Font) ?? {}
    cell.style = {
      ...cell.style,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } },
      font: { ...fontActual, size: 9, color: { argb: fgArgb } },
    }
  })
}

function agregarFilaResumen(
  ws: ExcelJS.Worksheet,
  label: string,
  value: string,
  boldValue = false,
  altBg = false
): void {
  const row = ws.addRow([label, value])
  row.height = 17
  const bg = altBg ? COLOR.altRow : 'FFFFFFFF'
  row.getCell(1).style = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    font: { bold: true, size: 9, color: { argb: COLOR.labelFg } },
    alignment: { vertical: 'middle' },
    border: bordesDelgados(),
  }
  row.getCell(2).style = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    font: { bold: boldValue, size: 9, color: { argb: 'FF1E293B' } },
    alignment: { vertical: 'middle' },
    border: bordesDelgados(),
  }
}

const bordesDelgados = (colorArgb: string = COLOR.border) => sharedBorder(colorArgb)
const formatearFecha = sharedFecha
const formatearFechaHora = sharedFechaHora

function obtenerTituloReporte(tipo: TipoReporte): string {
  const titulos: Record<TipoReporte, string> = {
    activos: 'Procesos Activos',
    completados: 'Procesos Completados',
    'por-vencer': 'Procesos por Vencer',
    vencidos: 'Procesos Vencidos',
    auditoria: 'Auditoría Completa',
  }
  return titulos[tipo]
}
