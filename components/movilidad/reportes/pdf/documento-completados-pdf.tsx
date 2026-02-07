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
  { texto: 'Tipo Serv.', ancho: '12%' },
  { texto: 'Tipo Proc.', ancho: '12%' },
  { texto: 'Estado Final', ancho: '13%' },
  { texto: 'Organismo', ancho: '18%' },
  { texto: 'F. Completado', ancho: '13%' },
  { texto: 'Duración', ancho: '10%' },
]

export function DocumentoCompletadosPDF({ datos }: DocumentoCompletadosPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Procesos Completados"
          subtitulo="Histórico de Procesos Finalizados"
          metadata={[
            { label: 'Fecha de generación', value: obtenerFechaGeneracion() },
            { label: 'Total de registros', value: datos.length },
          ]}
        />

        {/* Tabla */}
        <View style={basePdfStyles.table}>
          <PdfTableHeader columnas={columnas} />

          {/* Filas de datos */}
          {datos.map((d, index) => (
            <View key={index} style={basePdfStyles.tableRow}>
              <Text style={{ width: columnas[0].ancho }}>{d.placa}</Text>
              <Text style={{ width: columnas[1].ancho }}>{d.numero_cuenta}</Text>
              <Text style={{ width: columnas[2].ancho }}>{d.tipo_servicio}</Text>
              <Text style={{ width: columnas[3].ancho }}>{d.proceso_tipo}</Text>
              <Text style={{ width: columnas[4].ancho }}>{d.estado}</Text>
              <Text style={{ width: columnas[5].ancho }}>{d.organismo}</Text>
              <Text style={{ width: columnas[6].ancho }}>{formatearFechaPDF(d.fecha_completado)}</Text>
              <Text style={{ width: columnas[7].ancho }}>{d.duracion_dias} días</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={basePdfStyles.footer}>
          Reporte generado por Movilidad - Página 1 de 1
        </Text>
      </Page>
    </Document>
  )
}
