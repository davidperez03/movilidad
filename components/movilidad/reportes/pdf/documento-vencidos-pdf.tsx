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
  { texto: 'Placa', ancho: '12%' },
  { texto: 'N° Cuenta', ancho: '14%' },
  { texto: 'Tipo Proc.', ancho: '14%' },
  { texto: 'Estado', ancho: '16%' },
  { texto: 'Organismo', ancho: '22%' },
  { texto: 'F. Vencimiento', ancho: '12%' },
  { texto: 'Días Venc.', ancho: '10%' },
]

export function DocumentoVencidosPDF({ datos }: DocumentoVencidosPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos Vencidos"
          subtitulo="Procesos con fecha de vencimiento superada"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
          ]}
        />

        <View style={basePdfStyles.table}>
          <PdfTableHeader columnas={columnas} />

          {datos.map((dato, index) => (
            <View key={index} style={basePdfStyles.tableRow}>
              <Text style={{ width: columnas[0].ancho }}>{dato.placa}</Text>
              <Text style={{ width: columnas[1].ancho }}>{dato.numero_cuenta}</Text>
              <Text style={{ width: columnas[2].ancho }}>{dato.proceso_tipo}</Text>
              <Text style={{ width: columnas[3].ancho }}>{dato.estado}</Text>
              <Text style={{ width: columnas[4].ancho }}>{dato.ciudad}</Text>
              <Text style={{ width: columnas[5].ancho }}>{formatearFechaPDF(dato.fecha_vencimiento)}</Text>
              <Text style={[{ width: columnas[6].ancho }, basePdfStyles.vencido]}>
                {dato.dias_vencidos}
              </Text>
            </View>
          ))}
        </View>

        <Text style={basePdfStyles.footer}>
          Reporte generado por Movilidad - Página 1 de 1
        </Text>
      </Page>
    </Document>
  )
}
