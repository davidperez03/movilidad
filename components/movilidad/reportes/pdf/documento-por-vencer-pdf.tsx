// =====================================================
// DOCUMENTO PDF: PROCESOS POR VENCER
// Genera PDF para reporte de procesos por vencer
// =====================================================

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatearFechaPDF, obtenerFechaGeneracion } from '@/lib/movilidad/reportes/exportar-pdf'
import type { DatosReportePorVencer } from '@/lib/movilidad/reportes/tipos'

interface DocumentoPorVencerPDFProps {
  datos: DatosReportePorVencer[]
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  metadata: {
    marginBottom: 20,
    fontSize: 9,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottom: '1 solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '0.5 solid #ddd',
    fontSize: 8,
  },
  col1: { width: '12%' },
  col2: { width: '14%' },
  col3: { width: '14%' },
  col4: { width: '16%' },
  col5: { width: '22%' },
  col6: { width: '12%' },
  col7: { width: '10%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  vencido: {
    color: '#dc2626',
  },
  urgente: {
    color: '#ea580c',
  },
})

function calcularUrgencia(diasRestantes: number): string {
  if (diasRestantes < 0) return 'Vencido'
  if (diasRestantes <= 2) return 'Alta'
  if (diasRestantes <= 7) return 'Media'
  return 'Baja'
}

export function DocumentoPorVencerPDF({ datos }: DocumentoPorVencerPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Procesos por Vencer</Text>
          <Text style={styles.subtitle}>Alertas de Vencimientos Próximos</Text>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text>Fecha de generación: {obtenerFechaGeneracion()}</Text>
          <Text>Total de registros: {datos.length}</Text>
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Placa</Text>
            <Text style={styles.col2}>N° Cuenta</Text>
            <Text style={styles.col3}>Tipo Proc.</Text>
            <Text style={styles.col4}>Estado</Text>
            <Text style={styles.col5}>Organismo</Text>
            <Text style={styles.col6}>F. Vencimiento</Text>
            <Text style={styles.col7}>Días Rest.</Text>
          </View>

          {/* Filas de datos */}
          {datos.map((d, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{d.placa}</Text>
              <Text style={styles.col2}>{d.numero_cuenta}</Text>
              <Text style={styles.col3}>{d.proceso_tipo}</Text>
              <Text style={styles.col4}>{d.estado}</Text>
              <Text style={styles.col5}>{d.ciudad}</Text>
              <Text style={styles.col6}>{formatearFechaPDF(d.fecha_vencimiento)}</Text>
              <Text style={[styles.col7, d.dias_restantes < 0 ? styles.vencido : d.dias_restantes <= 2 ? styles.urgente : {}]}>
                {d.dias_restantes} ({calcularUrgencia(d.dias_restantes)})
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Reporte generado por Sistema de Movilidad - Página 1 de 1
        </Text>
      </Page>
    </Document>
  )
}
