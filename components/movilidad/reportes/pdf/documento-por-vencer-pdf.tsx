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
  { texto: 'Tipo Proceso', ancho: '15%' },
  { texto: 'Estado', ancho: '17%' },
  { texto: 'Organismo', ancho: '22%' },
  { texto: 'F. Vencimiento', ancho: '12%' },
  { texto: 'Días Rest.', ancho: '8%' },
]

export function DocumentoPorVencerPDF({ datos }: DocumentoPorVencerPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos por Vencer"
          subtitulo="Alertas de Vencimientos Próximos"
          badge="POR VENCER"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
            { label: 'Sistema', value: 'Movilidad' },
          ]}
        />

        <View style={basePdfStyles.tableWrapper}>
          <View style={basePdfStyles.table}>
            <PdfTableHeader columnas={columnas} />

            {datos.map((d, index) => {
              const nivel = obtenerNivelUrgenciaPorVencer(d.dias_restantes)
              const esVencido = nivel === 'vencido'
              const esUrgente = nivel === 'vence_hoy' || nivel === 'alta'

              const rowStyle = esVencido
                ? basePdfStyles.tableRowVencido
                : esUrgente
                  ? basePdfStyles.tableRowUrgente
                  : index % 2 === 1
                    ? basePdfStyles.tableRowAlternate
                    : {}

              const diasStyle = esVencido
                ? basePdfStyles.tableCellVencido
                : esUrgente
                  ? basePdfStyles.tableCellUrgente
                  : basePdfStyles.tableCellBold

              return (
                <View key={index} style={[basePdfStyles.tableRow, rowStyle]}>
                  <Text style={[basePdfStyles.tableCellBold, { width: columnas[0].ancho }]}>{d.placa}</Text>
                  <Text style={[basePdfStyles.tableCell, { width: columnas[1].ancho }]}>{d.numero_cuenta}</Text>
                  <Text style={[basePdfStyles.tableCell, { width: columnas[2].ancho }]}>{d.proceso_tipo}</Text>
                  <Text style={[basePdfStyles.tableCell, { width: columnas[3].ancho }]}>{d.estado}</Text>
                  <Text style={[basePdfStyles.tableCell, { width: columnas[4].ancho }]}>{d.ciudad}</Text>
                  <Text style={[basePdfStyles.tableCell, { width: columnas[5].ancho }]}>
                    {formatearFechaPDF(d.fecha_vencimiento)}
                  </Text>
                  <Text style={[diasStyle, { width: columnas[6].ancho }]}>
                    {formatearUrgenciaPorVencer(d.dias_restantes)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <Text
          style={basePdfStyles.footer}
          render={({ pageNumber, totalPages }) =>
            `Sistema de Movilidad  ·  Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
