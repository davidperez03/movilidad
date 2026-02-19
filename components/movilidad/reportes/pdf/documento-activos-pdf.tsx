import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatearFechaPDF, obtenerFechaGeneracion } from '@/lib/movilidad/reportes/exportar-pdf'
import type { DatosReporteActivos } from '@/lib/movilidad/reportes/tipos'
import { basePdfStyles } from './base-pdf-styles'
import { PdfHeader } from './pdf-header'
import { PdfTableHeader } from './pdf-table-header'

interface DocumentoActivosPDFProps {
  datos: DatosReporteActivos[]
}

const columnas = [
  { texto: 'Placa', ancho: '10%' },
  { texto: 'N° Cuenta', ancho: '12%' },
  { texto: 'Tipo Servicio', ancho: '12%' },
  { texto: 'Tipo Proceso', ancho: '13%' },
  { texto: 'Estado', ancho: '16%' },
  { texto: 'Organismo', ancho: '20%' },
  { texto: 'F. Trámite', ancho: '10%' },
  { texto: 'Días Rest.', ancho: '7%' },
]

export function DocumentoActivosPDF({ datos }: DocumentoActivosPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos Activos"
          subtitulo="Traslados y Radicaciones en Curso"
          badge="ACTIVOS"
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
                <Text style={[basePdfStyles.tableCell, { width: columnas[4].ancho }]}>{d.proceso_estado}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[5].ancho }]}>{d.ciudad}</Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[6].ancho }]}>
                  {formatearFechaPDF(d.fecha_tramite)}
                </Text>
                <Text style={[basePdfStyles.tableCell, { width: columnas[7].ancho }]}>
                  {d.dias_restantes !== null ? d.dias_restantes : '—'}
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
