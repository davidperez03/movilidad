// =====================================================
// EXPORTACIÓN A PDF
// Función para generar archivos PDF usando @react-pdf/renderer
// =====================================================

import { pdf } from '@react-pdf/renderer'
import type { TipoReporte } from './tipos'

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

export async function generarPDFReporte(
  componentePDF: React.ReactElement,
  nombreArchivo: string
): Promise<void> {
  try {
    // Generar blob del PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(componentePDF as any).toBlob()

    // Crear URL y descargar
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${nombreArchivo}.pdf`
    link.click()

    // Limpiar URL
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error('Error al generar el archivo PDF')
  }
}

// =====================================================
// UTILIDADES PARA COMPONENTES PDF
// =====================================================

export function obtenerTituloPDF(tipo: TipoReporte): string {
  const titulos: Record<TipoReporte, string> = {
    activos: 'Reporte de Procesos Activos',
    completados: 'Reporte de Procesos Completados',
    'por-vencer': 'Reporte de Procesos por Vencer',
    auditoria: 'Reporte de Auditoría Completa',
  }

  return titulos[tipo]
}

export function formatearFechaPDF(fecha: string | null | undefined): string {
  if (!fecha) return ''

  try {
    const date = new Date(fecha)
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()
    return `${dia}/${mes}/${anio}`
  } catch {
    return fecha || ''
  }
}

export function formatearFechaHoraPDF(fecha: string | null | undefined): string {
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
    return fecha || ''
  }
}

export function obtenerFechaGeneracion(): string {
  const ahora = new Date()
  return formatearFechaHoraPDF(ahora.toISOString())
}
