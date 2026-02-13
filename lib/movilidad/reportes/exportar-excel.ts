// =====================================================
// EXPORTACIÓN A EXCEL
// Función para generar archivos Excel (.xlsx) usando xlsx
// =====================================================

import * as XLSX from 'xlsx'
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
export function generarExcelReporte(
  datos: any[],
  tipoReporte: TipoReporte,
  filtros: FiltrosReporte,
  nombreArchivo: string
): void {
  if (!datos || datos.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Crear workbook
  const wb = XLSX.utils.book_new()

  // Generar hoja de datos según tipo de reporte
  let wsDatos: XLSX.WorkSheet

  switch (tipoReporte) {
    case 'activos':
      wsDatos = generarHojaActivos(datos as unknown as DatosReporteActivos[])
      break
    case 'completados':
      wsDatos = generarHojaCompletados(datos as unknown as DatosReporteCompletados[])
      break
    case 'por-vencer':
      wsDatos = generarHojaPorVencer(datos as unknown as DatosReportePorVencer[])
      break
    case 'vencidos':
      wsDatos = generarHojaVencidos(datos as unknown as DatosReporteVencidos[])
      break
    case 'auditoria':
      wsDatos = generarHojaAuditoria(datos as unknown as DatosAuditoria[])
      break
    default:
      throw new Error(`Tipo de reporte no soportado: ${tipoReporte}`)
  }

  // Agregar hoja de datos
  XLSX.utils.book_append_sheet(wb, wsDatos, 'Datos')

  // Generar hoja de resumen
  const wsResumen = generarHojaResumen(tipoReporte, filtros, datos.length)
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // Descargar archivo
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}

// =====================================================
// HOJAS DE DATOS POR TIPO DE REPORTE
// =====================================================

function generarHojaActivos(datos: DatosReporteActivos[]): XLSX.WorkSheet {
  const datosFormateados = datos.map((d) => ({
    Placa: d.placa,
    'N° Cuenta': d.numero_cuenta,
    'Tipo Servicio': d.tipo_servicio,
    'Tipo Proceso': d.proceso_tipo,
    Estado: d.proceso_estado,
    Organismo: d.ciudad,
    'Fecha Trámite': formatearFecha(d.fecha_tramite),
    'Fecha Vencimiento': formatearFecha(d.fecha_vencimiento),
    'Días Restantes': d.dias_restantes !== null ? d.dias_restantes : '',
  }))

  const ws = XLSX.utils.json_to_sheet(datosFormateados)

  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 10 }, // Placa
    { wch: 15 }, // N° Cuenta
    { wch: 15 }, // Tipo Servicio
    { wch: 15 }, // Tipo Proceso
    { wch: 20 }, // Estado
    { wch: 30 }, // Organismo
    { wch: 15 }, // Fecha Trámite
    { wch: 18 }, // Fecha Vencimiento
    { wch: 15 }, // Días Restantes
  ]

  return ws
}

function generarHojaCompletados(datos: DatosReporteCompletados[]): XLSX.WorkSheet {
  const datosFormateados = datos.map((d) => ({
    Placa: d.placa,
    'N° Cuenta': d.numero_cuenta,
    'Tipo Servicio': d.tipo_servicio,
    'Tipo Proceso': d.proceso_tipo,
    'Estado Final': d.estado,
    Organismo: d.organismo,
    'Fecha Completado': formatearFecha(d.fecha_completado),
    'Duración (días)': d.duracion_dias,
    Responsable: d.responsable,
  }))

  const ws = XLSX.utils.json_to_sheet(datosFormateados)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 25 },
  ]

  return ws
}

function generarHojaPorVencer(datos: DatosReportePorVencer[]): XLSX.WorkSheet {
  const datosFormateados = datos.map((d) => ({
    Placa: d.placa,
    'N° Cuenta': d.numero_cuenta,
    'Tipo Proceso': d.proceso_tipo,
    Estado: d.estado,
    Organismo: d.ciudad,
    'Fecha Vencimiento': formatearFecha(d.fecha_vencimiento),
    'Días Restantes': d.dias_restantes,
    Urgencia: obtenerEtiquetaUrgenciaPorVencer(d.dias_restantes),
    Responsable: d.responsable,
  }))

  const ws = XLSX.utils.json_to_sheet(datosFormateados)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ]

  return ws
}

function generarHojaAuditoria(datos: DatosAuditoria[]): XLSX.WorkSheet {
  const datosFormateados = datos.map((d) => ({
    'Fecha/Hora': formatearFechaHora(d.creado_en),
    Módulo: d.modulo,
    Acción: d.accion,
    Entidad: d.entidad_tipo,
    Usuario: d.usuario_nombre,
    Correo: d.usuario_correo,
    'Estado Anterior': d.valor_anterior || '',
    'Estado Nuevo': d.valor_nuevo || '',
  }))

  const ws = XLSX.utils.json_to_sheet(datosFormateados)

  ws['!cols'] = [
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
  ]

  return ws
}

function generarHojaVencidos(datos: DatosReporteVencidos[]): XLSX.WorkSheet {
  const datosFormateados = datos.map((d) => ({
    Placa: d.placa,
    'N° Cuenta': d.numero_cuenta,
    'Tipo Proceso': d.proceso_tipo,
    Estado: d.estado,
    Organismo: d.ciudad,
    'Fecha Vencimiento': formatearFecha(d.fecha_vencimiento),
    'Días Restantes': d.dias_restantes,
    'Días Vencidos': d.dias_vencidos,
    Responsable: d.responsable,
  }))

  const ws = XLSX.utils.json_to_sheet(datosFormateados)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
  ]

  return ws
}

// =====================================================
// HOJA DE RESUMEN
// =====================================================

function generarHojaResumen(
  tipoReporte: TipoReporte,
  filtros: FiltrosReporte,
  totalRegistros: number
): XLSX.WorkSheet {
  const ahora = new Date()
  const fechaGeneracion = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()} ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`

  const resumen = [
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

  const ws = XLSX.utils.aoa_to_sheet(resumen)

  // Ajustar anchos
  ws['!cols'] = [{ wch: 25 }, { wch: 40 }]

  return ws
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
