import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatearFechaPDF, obtenerFechaGeneracion } from '@/lib/movilidad/reportes/exportar-pdf'
import type { DatosReportePorVencer } from '@/lib/movilidad/reportes/tipos'
import {
  formatearUrgenciaPorVencer,
  obtenerNivelUrgenciaPorVencer,
} from '@/lib/movilidad/reportes/urgencia'
import { basePdfStyles } from './base-pdf-styles'
import { PdfHeader } from './pdf-header'
import { PdfTableHeader } from './pdf-table-header'

interface DocumentoPorVencerPDFProps {
  datos: DatosReportePorVencer[]
}

const columnas = [
  { texto: 'Placa', ancho: '12%' },
  { texto: 'N° Cuenta', ancho: '14%' },
  { texto: 'Tipo Proc.', ancho: '14%' },
  { texto: 'Estado', ancho: '16%' },
  { texto: 'Organismo', ancho: '22%' },
  { texto: 'F. Vencimiento', ancho: '12%' },
  { texto: 'Días Rest.', ancho: '10%' },
]

export function DocumentoPorVencerPDF({ datos }: DocumentoPorVencerPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos por Vencer"
          subtitulo="Alertas de Vencimientos Próximos"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
          ]}
        />

        {/* Tabla */}
        <View style={basePdfStyles.table}>
          <PdfTableHeader columnas={columnas} />

          {/* Filas de datos */}
          {datos.map((d, index) => {
            const nivelUrgencia = obtenerNivelUrgenciaPorVencer(d.dias_restantes)
            const estiloUrgencia =
              nivelUrgencia === 'vencido'
                ? basePdfStyles.vencido
                : nivelUrgencia === 'vence_hoy' || nivelUrgencia === 'alta'
                  ? basePdfStyles.urgente
                  : {}

            return (
              <View key={index} style={basePdfStyles.tableRow}>
                <Text style={{ width: columnas[0].ancho }}>{d.placa}</Text>
                <Text style={{ width: columnas[1].ancho }}>{d.numero_cuenta}</Text>
                <Text style={{ width: columnas[2].ancho }}>{d.proceso_tipo}</Text>
                <Text style={{ width: columnas[3].ancho }}>{d.estado}</Text>
                <Text style={{ width: columnas[4].ancho }}>{d.ciudad}</Text>
                <Text style={{ width: columnas[5].ancho }}>{formatearFechaPDF(d.fecha_vencimiento)}</Text>
                <Text style={[{ width: columnas[6].ancho }, estiloUrgencia]}>
                  {formatearUrgenciaPorVencer(d.dias_restantes)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <Text style={basePdfStyles.footer}>
          Reporte generado por Movilidad - Página 1 de 1
        </Text>
      </Page>
    </Document>
  )
}
