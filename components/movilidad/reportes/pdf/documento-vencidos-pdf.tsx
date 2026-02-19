import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatearFechaPDF, obtenerFechaGeneracion } from '@/lib/movilidad/reportes/exportar-pdf'
import type { DatosReporteVencidos } from '@/lib/movilidad/reportes/tipos'
import { basePdfStyles } from './base-pdf-styles'
import { PdfHeader } from './pdf-header'
import { PdfTableHeader } from './pdf-table-header'

interface DocumentoVencidosPDFProps {
  datos: DatosReporteVencidos[]
}

const columnas = [
  { texto: 'Placa', ancho: '11%' },
  { texto: 'N° Cuenta', ancho: '13%' },
  { texto: 'Tipo Proceso', ancho: '15%' },
  { texto: 'Estado', ancho: '17%' },
  { texto: 'Organismo', ancho: '21%' },
  { texto: 'F. Vencimiento', ancho: '12%' },
  { texto: 'Días Venc.', ancho: '11%' },
]

export function DocumentoVencidosPDF({ datos }: DocumentoVencidosPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos Vencidos"
          subtitulo="Procesos con Fecha de Vencimiento Superada"
          badge="VENCIDOS"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
            { label: 'Sistema', value: 'Movilidad' },
          ]}
        />

        <View style={basePdfStyles.tableWrapper}>
          <View style={basePdfStyles.table}>
            <PdfTableHeader columnas={columnas} />

            {datos.map((dato, index) => (
              <View
                key={index}
                style={[basePdfStyles.tableRow, basePdfStyles.tableRowVencido]}
              >
                <Text style={[basePdfStyles.tableCellBold, { width: columnas[0].ancho }]}>{dato.placa}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[1].ancho }]}>{dato.numero_cuenta}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[2].ancho }]}>{dato.proceso_tipo}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[3].ancho }]}>{dato.estado}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[4].ancho }]}>{dato.ciudad}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[5].ancho }]}>
                  {formatearFechaPDF(dato.fecha_vencimiento)}
                </Text>
                <Text style={[basePdfStyles.tableCellVencido, { width: columnas[6].ancho }]}>
                  {dato.dias_vencidos} días
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
