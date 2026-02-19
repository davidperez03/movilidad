import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatearFechaPDF, obtenerFechaGeneracion } from '@/lib/movilidad/reportes/exportar-pdf'
import type { DatosReporteCompletados } from '@/lib/movilidad/reportes/tipos'
import { basePdfStyles } from './base-pdf-styles'
import { PdfHeader } from './pdf-header'
import { PdfTableHeader } from './pdf-table-header'

interface DocumentoCompletadosPDFProps {
  datos: DatosReporteCompletados[]
}

const columnas = [
  { texto: 'Placa', ancho: '10%' },
  { texto: 'N° Cuenta', ancho: '12%' },
  { texto: 'Tipo Servicio', ancho: '12%' },
  { texto: 'Tipo Proceso', ancho: '13%' },
  { texto: 'Estado Final', ancho: '14%' },
  { texto: 'Organismo', ancho: '19%' },
  { texto: 'F. Completado', ancho: '11%' },
  { texto: 'Duración', ancho: '9%' },
]

export function DocumentoCompletadosPDF({ datos }: DocumentoCompletadosPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos Completados"
          subtitulo="Histórico de Procesos Finalizados"
          badge="COMPLETADOS"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
            { label: 'Sistema', value: 'Movilidad' },
          ]}
        />

        <View style={basePdfStyles.tableWrapper}>
          <View style={basePdfStyles.table}>
            <PdfTableHeader columnas={columnas} />

            {datos.map((d, index) => (
              <View
                key={index}
                style={[basePdfStyles.tableRow, index % 2 === 1 ? basePdfStyles.tableRowAlternate : {}]}
              >
                <Text style={[basePdfStyles.tableCellBold, { width: columnas[0].ancho }]}>{d.placa}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[1].ancho }]}>{d.numero_cuenta}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[2].ancho }]}>{d.tipo_servicio}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[3].ancho }]}>{d.proceso_tipo}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[4].ancho }]}>{d.estado}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[5].ancho }]}>{d.organismo}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[6].ancho }]}>
                  {formatearFechaPDF(d.fecha_completado)}
                </Text>
                <Text style={[basePdfStyles.tableCellBold, { width: columnas[7].ancho }]}>
                  {d.duracion_dias} días
                </Text>
              </View>
            ))}
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
