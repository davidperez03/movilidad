'use client'

// =====================================================
// BOTONES DE EXPORTACIÓN
// Botones para exportar reportes en PDF, Excel y CSV
// =====================================================

import { useState } from 'react'
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generarCSVReporte } from '@/lib/movilidad/reportes/exportar-csv'
import { generarExcelReporte } from '@/lib/movilidad/reportes/exportar-excel'
import { generarPDFReporte } from '@/lib/movilidad/reportes/exportar-pdf'
import { DocumentoActivosPDF } from './pdf/documento-activos-pdf'
import { DocumentoCompletadosPDF } from './pdf/documento-completados-pdf'
import { DocumentoPorVencerPDF } from './pdf/documento-por-vencer-pdf'
import { DocumentoVencidosPDF } from './pdf/documento-vencidos-pdf'
import type {
  TipoReporte,
  FiltrosReporte,
  DatosReporteActivos,
  DatosReporteCompletados,
  DatosReportePorVencer,
  DatosReporteVencidos,
} from '@/lib/movilidad/reportes/tipos'

interface BotonesExportacionProps<TDato = unknown> {
  datos: TDato[]
  tipoReporte: TipoReporte
  filtros: FiltrosReporte
  nombreArchivo: string
}

export function BotonesExportacion<TDato = unknown>({
  datos,
  tipoReporte,
  filtros,
  nombreArchivo,
}: BotonesExportacionProps<TDato>) {
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingCSV, setLoadingCSV] = useState(false)

  const handleExportarPDF = async () => {
    if (!datos || datos.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      setLoadingPDF(true)

      let componentePDF
      switch (tipoReporte) {
        case 'activos':
          componentePDF = <DocumentoActivosPDF datos={datos as unknown as DatosReporteActivos[]} />
          break
        case 'completados':
          componentePDF = <DocumentoCompletadosPDF datos={datos as unknown as DatosReporteCompletados[]} />
          break
        case 'por-vencer':
          componentePDF = <DocumentoPorVencerPDF datos={datos as unknown as DatosReportePorVencer[]} />
          break
        case 'vencidos':
          componentePDF = <DocumentoVencidosPDF datos={datos as unknown as DatosReporteVencidos[]} />
          break
        default:
          toast.error('Tipo de reporte no soportado')
          return
      }

      await generarPDFReporte(componentePDF, nombreArchivo)
      toast.success('PDF generado exitosamente')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setLoadingPDF(false)
    }
  }

  const handleExportarExcel = () => {
    if (!datos || datos.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      setLoadingExcel(true)
      generarExcelReporte(datos, tipoReporte, filtros, nombreArchivo)
      toast.success('Excel generado exitosamente')
    } catch {
      toast.error('Error al generar el archivo Excel')
    } finally {
      setLoadingExcel(false)
    }
  }

  const handleExportarCSV = () => {
    if (!datos || datos.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      setLoadingCSV(true)
      generarCSVReporte(datos, tipoReporte, nombreArchivo)
      toast.success('CSV generado exitosamente')
    } catch {
      toast.error('Error al generar el archivo CSV')
    } finally {
      setLoadingCSV(false)
    }
  }

  const sinDatos = !datos || datos.length === 0

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botón PDF */}
      <Button
        onClick={handleExportarPDF}
        disabled={loadingPDF || sinDatos}
        variant="outline"
        size="sm"
      >
        {loadingPDF ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </>
        )}
      </Button>

      {/* Botón Excel */}
      <Button onClick={handleExportarExcel} disabled={loadingExcel || sinDatos} variant="outline" size="sm">
        {loadingExcel ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Table className="h-4 w-4 mr-2" />
            Exportar Excel
          </>
        )}
      </Button>

      {/* Botón CSV */}
      <Button onClick={handleExportarCSV} disabled={loadingCSV || sinDatos} variant="outline" size="sm">
        {loadingCSV ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </>
        )}
      </Button>
    </div>
  )
}
