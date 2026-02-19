import { StyleSheet } from '@react-pdf/renderer'

// =====================================================
// PALETA DE COLORES
// =====================================================
export const PDF_COLORS = {
  primary: '#1e3a5f',      // Azul marino oscuro — header principal
  primaryDark: '#152d4a',  // Azul marino más oscuro — acento
  accent: '#2563eb',       // Azul eléctrico — badges y resaltes
  accentLight: '#93c5fd',  // Azul claro — subtítulos en fondo oscuro
  bgLight: '#f8fafc',      // Fondo alterno de filas
  bgMeta: '#f1f5f9',       // Fondo barra de metadatos
  border: '#e2e8f0',       // Bordes sutiles
  text: '#1e293b',         // Texto principal
  textMuted: '#64748b',    // Texto secundario
  textWhite: '#ffffff',    // Texto sobre fondo oscuro
  rowVencido: '#fef2f2',   // Fondo fila vencida
  rowUrgente: '#fff7ed',   // Fondo fila urgente
  cellVencido: '#dc2626',  // Texto vencido
  cellUrgente: '#ea580c',  // Texto urgente
} as const

// =====================================================
// ESTILOS GLOBALES PDF
// =====================================================
export const basePdfStyles = StyleSheet.create({

  // --- Página ---
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // --- Barra de encabezado ---
  headerBar: {
    backgroundColor: PDF_COLORS.primary,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 32,
    paddingRight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerBarLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 8,
    color: PDF_COLORS.accentLight,
  },
  headerBadge: {
    backgroundColor: PDF_COLORS.accent,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 4,
  },
  headerBadgeText: {
    color: PDF_COLORS.textWhite,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },

  // --- Barra de metadatos ---
  metadataBar: {
    backgroundColor: PDF_COLORS.bgMeta,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 32,
    paddingRight: 32,
    flexDirection: 'row',
    borderBottom: `1 solid ${PDF_COLORS.border}`,
    marginBottom: 16,
  },
  metadataItem: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    borderRight: `1 solid ${PDF_COLORS.border}`,
  },
  metadataItemLast: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  metadataLabel: {
    fontSize: 7,
    color: PDF_COLORS.textMuted,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 9,
    color: PDF_COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },

  // --- Contenedor tabla ---
  tableWrapper: {
    paddingLeft: 32,
    paddingRight: 32,
  },
  table: {
    width: '100%',
  },

  // --- Encabezado de tabla ---
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 6,
    paddingRight: 6,
  },
  tableHeaderCell: {
    color: PDF_COLORS.textWhite,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },

  // --- Filas de datos ---
  tableRow: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 6,
    paddingRight: 6,
    borderBottom: `0.5 solid ${PDF_COLORS.border}`,
    backgroundColor: '#ffffff',
  },
  tableRowAlternate: {
    backgroundColor: PDF_COLORS.bgLight,
  },
  tableRowVencido: {
    backgroundColor: '#fef2f2',
  },
  tableRowUrgente: {
    backgroundColor: '#fff7ed',
  },

  // --- Celdas de datos ---
  tableCell: {
    fontSize: 8,
    color: PDF_COLORS.text,
  },
  tableCellVencido: {
    fontSize: 8,
    color: PDF_COLORS.cellVencido,
    fontFamily: 'Helvetica-Bold',
  },
  tableCellUrgente: {
    fontSize: 8,
    color: PDF_COLORS.cellUrgente,
    fontFamily: 'Helvetica-Bold',
  },
  tableCellBold: {
    fontSize: 8,
    color: PDF_COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 7,
    color: PDF_COLORS.textMuted,
    borderTop: `0.5 solid ${PDF_COLORS.border}`,
    paddingTop: 5,
  },

  // --- Retrocompatibilidad (usado en documento-por-vencer y vencidos) ---
  vencido: {
    color: PDF_COLORS.cellVencido,
    fontFamily: 'Helvetica-Bold',
  },
  urgente: {
    color: PDF_COLORS.cellUrgente,
    fontFamily: 'Helvetica-Bold',
  },
  normal: {
    color: PDF_COLORS.text,
  },

  // --- Estilos heredados (header/metadata/title/subtitle) ---
  // Mantenidos para no romper imports existentes
  header: {
    marginBottom: 0,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textWhite,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    color: PDF_COLORS.accentLight,
  },
  metadata: {
    marginBottom: 16,
    fontSize: 9,
  },
})
