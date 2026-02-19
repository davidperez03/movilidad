// =====================================================
// EXPORTACIÓN A EXCEL
// Función para generar archivos Excel (.xlsx) usando exceljs
// =====================================================

import ExcelJS from 'exceljs'
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

  // Generar hoja de datos según tipo de reporte
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

  // Generar hoja de resumen
  generarHojaResumen(wb, tipoReporte, filtros, datos.length)

  // Descargar archivo en el navegador
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

// =====================================================
// HOJAS DE DATOS POR TIPO DE REPORTE
// =====================================================

function generarHojaActivos(wb: ExcelJS.Workbook, datos: DatosReporteActivos[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 10 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 15 },
    { header: 'Tipo Servicio', key: 'tipo_servicio', width: 15 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 15 },
    { header: 'Estado', key: 'proceso_estado', width: 20 },
    { header: 'Organismo', key: 'ciudad', width: 30 },
    { header: 'Fecha Trámite', key: 'fecha_tramite', width: 15 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 18 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 15 },
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
}

function generarHojaCompletados(wb: ExcelJS.Workbook, datos: DatosReporteCompletados[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 10 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 15 },
    { header: 'Tipo Servicio', key: 'tipo_servicio', width: 15 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 15 },
    { header: 'Estado Final', key: 'estado', width: 15 },
    { header: 'Organismo', key: 'organismo', width: 30 },
    { header: 'Fecha Completado', key: 'fecha_completado', width: 18 },
    { header: 'Duración (días)', key: 'duracion_dias', width: 15 },
    { header: 'Responsable', key: 'responsable', width: 25 },
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
}

function generarHojaPorVencer(wb: ExcelJS.Workbook, datos: DatosReportePorVencer[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 10 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 15 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 15 },
    { header: 'Estado', key: 'estado', width: 20 },
    { header: 'Organismo', key: 'ciudad', width: 30 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 18 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 15 },
    { header: 'Urgencia', key: 'urgencia', width: 12 },
    { header: 'Responsable', key: 'responsable', width: 25 },
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
}

function generarHojaAuditoria(wb: ExcelJS.Workbook, datos: DatosAuditoria[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Fecha/Hora', key: 'creado_en', width: 18 },
    { header: 'Módulo', key: 'modulo', width: 12 },
    { header: 'Acción', key: 'accion', width: 20 },
    { header: 'Entidad', key: 'entidad_tipo', width: 15 },
    { header: 'Usuario', key: 'usuario_nombre', width: 25 },
    { header: 'Correo', key: 'usuario_correo', width: 30 },
    { header: 'Estado Anterior', key: 'valor_anterior', width: 18 },
    { header: 'Estado Nuevo', key: 'valor_nuevo', width: 18 },
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
}

function generarHojaVencidos(wb: ExcelJS.Workbook, datos: DatosReporteVencidos[]): void {
  const ws = wb.addWorksheet('Datos')
  ws.columns = [
    { header: 'Placa', key: 'placa', width: 10 },
    { header: 'N° Cuenta', key: 'numero_cuenta', width: 15 },
    { header: 'Tipo Proceso', key: 'proceso_tipo', width: 15 },
    { header: 'Estado', key: 'estado', width: 20 },
    { header: 'Organismo', key: 'ciudad', width: 30 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 18 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 15 },
    { header: 'Días Vencidos', key: 'dias_vencidos', width: 15 },
    { header: 'Responsable', key: 'responsable', width: 25 },
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
  const ahora = new Date()
  const fechaGeneracion = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()} ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`

  const filas = [
    ['REPORTE DE MOVILIDAD'],
    [''],
    ['Tipo de Reporte:', obtenerTituloReporte(tipoReporte)],
    ['Fecha de Generación:', fechaGeneracion],
    ['Total de Registros:', totalRegistros],
    [''],
    ['FILTROS APLICADOS:'],
    ['Fecha Inicio:', filtros.fechaInicio || 'Todos'],
    ['Fecha Fin:', filtros.fechaFin || 'Todos'],
    ['Estado:', filtros.estado === 'todos' ? 'Todos' : filtros.estado],
    ['Organismo:', filtros.organismoId === 'todos' ? 'Todos' : filtros.organismoId],
    ['Tipo de Proceso:', filtros.tipoProceso === 'todos' ? 'Todos' : filtros.tipoProceso],
    ['Responsable:', filtros.responsable === 'todos' ? 'Todos' : filtros.responsable],
  ]

  filas.forEach((fila) => ws.addRow(fila))

  ws.getColumn(1).width = 25
  ws.getColumn(2).width = 40
}

// =====================================================
// UTILIDADES
// =====================================================

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return ''

  try {
    const date = new Date(fecha)
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()
    return `${dia}/${mes}/${anio}`
  } catch {
    return fecha
  }
}

function formatearFechaHora(fecha: string | null | undefined): string {
  if (!fecha) return ''

  try {
    const date = new Date(fecha)
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()
    const horas = String(date.getHours()).padStart(2, '0')
    const minutos = String(date.getMinutes()).padStart(2, '0')
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`
  } catch {
    return fecha
  }
}

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
