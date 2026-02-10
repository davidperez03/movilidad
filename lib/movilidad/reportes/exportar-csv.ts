// =====================================================
// EXPORTACIÓN A CSV
// Función para generar archivos CSV con encoding UTF-8
// =====================================================

import type { TipoReporte, DatosReporteActivos, DatosReporteCompletados, DatosReportePorVencer } from './tipos'

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
export function generarCSVReporte(datos: any[], tipoReporte: TipoReporte, nombreArchivo: string): void {
  if (!datos || datos.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Generar CSV según tipo de reporte
  let csvContent: string

  switch (tipoReporte) {
    case 'activos':
      csvContent = generarCSVActivos(datos as unknown as DatosReporteActivos[])
      break
    case 'completados':
      csvContent = generarCSVCompletados(datos as unknown as DatosReporteCompletados[])
      break
    case 'por-vencer':
      csvContent = generarCSVPorVencer(datos as unknown as DatosReportePorVencer[])
      break
    case 'auditoria':
      csvContent = generarCSVAuditoria(datos as unknown as DatosAuditoria[])
      break
    default:
      throw new Error(`Tipo de reporte no soportado: ${tipoReporte}`)
  }

  // Agregar BOM UTF-8 para compatibilidad con Excel
  const BOM = '\uFEFF'
  const csvConBOM = BOM + csvContent

  // Crear blob y descargar
  const blob = new Blob([csvConBOM], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// =====================================================
// FUNCIONES ESPECÍFICAS POR TIPO DE REPORTE
// =====================================================

function generarCSVActivos(datos: DatosReporteActivos[]): string {
  const headers = [
    'Placa',
    'N° Cuenta',
    'Tipo Servicio',
    'Tipo Proceso',
    'Estado',
    'Organismo',
    'Fecha Trámite',
    'Fecha Vencimiento',
    'Días Restantes',
  ]

  const rows = datos.map((d) => [
    d.placa,
    d.numero_cuenta,
    d.tipo_servicio,
    d.proceso_tipo,
    d.proceso_estado,
    d.ciudad,
    formatearFecha(d.fecha_tramite),
    formatearFecha(d.fecha_vencimiento),
    d.dias_restantes !== null ? d.dias_restantes.toString() : '',
  ])

  return convertirACSV(headers, rows)
}

function generarCSVCompletados(datos: DatosReporteCompletados[]): string {
  const headers = [
    'Placa',
    'N° Cuenta',
    'Tipo Servicio',
    'Tipo Proceso',
    'Estado Final',
    'Organismo',
    'Fecha Completado',
    'Duración (días)',
    'Responsable',
  ]

  const rows = datos.map((d) => [
    d.placa,
    d.numero_cuenta,
    d.tipo_servicio,
    d.proceso_tipo,
    d.estado,
    d.organismo,
    formatearFecha(d.fecha_completado),
    d.duracion_dias.toString(),
    d.responsable,
  ])

  return convertirACSV(headers, rows)
}

function generarCSVPorVencer(datos: DatosReportePorVencer[]): string {
  const headers = [
    'Placa',
    'N° Cuenta',
    'Tipo Proceso',
    'Estado',
    'Organismo',
    'Fecha Vencimiento',
    'Días Restantes',
    'Responsable',
  ]

  const rows = datos.map((d) => [
    d.placa,
    d.numero_cuenta,
    d.proceso_tipo,
    d.estado,
    d.ciudad,
    formatearFecha(d.fecha_vencimiento),
    d.dias_restantes.toString(),
    d.responsable,
  ])

  return convertirACSV(headers, rows)
}

function generarCSVAuditoria(datos: DatosAuditoria[]): string {
  const headers = [
    'Fecha/Hora',
    'Módulo',
    'Acción',
    'Entidad',
    'Usuario',
    'Correo',
    'Estado Anterior',
    'Estado Nuevo',
  ]

  const rows = datos.map((d) => [
    formatearFechaHora(d.creado_en),
    d.modulo,
    d.accion,
    d.entidad_tipo,
    d.usuario_nombre,
    d.usuario_correo,
    d.valor_anterior || '',
    d.valor_nuevo || '',
  ])

  return convertirACSV(headers, rows)
}

// =====================================================
// UTILIDADES
// =====================================================

function convertirACSV(headers: string[], rows: string[][]): string {
  const escaparCampo = (campo: string): string => {
    // Escapar comillas dobles y envolver en comillas si contiene comas, comillas o saltos de línea
    if (campo === null || campo === undefined) {
      return ''
    }

    const campoStr = String(campo)

    if (campoStr.includes(',') || campoStr.includes('"') || campoStr.includes('\n')) {
      return `"${campoStr.replace(/"/g, '""')}"`
    }

    return campoStr
  }

  const lineas: string[] = []

  // Agregar headers
  lineas.push(headers.map(escaparCampo).join(','))

  // Agregar filas
  rows.forEach((row) => {
    lineas.push(row.map(escaparCampo).join(','))
  })

  return lineas.join('\n')
}

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
