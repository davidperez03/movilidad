import { Document, Page, Text, View } from '@react-pdf/renderer'
import { basePdfStyles, PDF_COLORS } from '@/components/movilidad/reportes/pdf/base-pdf-styles'
import { PdfHeader } from '@/components/movilidad/reportes/pdf/pdf-header'
import { PdfTableHeader } from '@/components/movilidad/reportes/pdf/pdf-table-header'
import type { FilaStock, FilaSticker, FilaCierre } from '@/lib/parqueadero/reportes/tipos'
import { getNowDateColombia } from '@/lib/utils/date'

function fmt(f: string): string {
  try {
    const d = new Date(f + 'T00:00:00')
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  } catch { return f }
}
function fechaHoy(): string {
  return fmt(getNowDateColombia())
}

// ── Stock actual ──────────────────────────────────────────────────────────────

interface StockPDFProps {
  stock:   FilaStock[]
  sticker: FilaSticker | null
}

export function DocumentoStockPDF({ stock, sticker }: StockPDFProps) {
  const gruasKeys = stock.length > 0 ? Object.keys(stock[0].gruas) : []
  const colItems: { texto: string; ancho: string }[] = [
    { texto: 'Ítem',       ancho: '28%' },
    { texto: 'Categoría',  ancho: '12%' },
    { texto: 'Unidad',     ancho: '8%'  },
    { texto: 'Bodega',     ancho: '10%' },
    ...gruasKeys.map(k => ({ texto: k, ancho: `${Math.floor(30 / Math.max(gruasKeys.length, 1))}%` })),
    { texto: 'Total',      ancho: '10%' },
    { texto: 'Estado',     ancho: '12%' },
  ]

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Inventario — Stock Actual"
          subtitulo="Parqueadero · Distribución por bodega y grúas"
          badge="STOCK"
          metadata={[
            { label: 'Fecha de generacion', value: fechaHoy() },
            { label: 'Total items',         value: stock.length },
            { label: 'Sistema',             value: 'Parqueadero' },
          ]}
        />

        <View style={basePdfStyles.tableWrapper}>
          <View style={basePdfStyles.table}>
            <PdfTableHeader columnas={colItems} />
            {stock.map((row, i) => {
              const estado     = row.total === 0 ? 'Sin stock' : row.total <= row.stock_minimo ? 'Stock bajo' : 'Normal'
              const estadoColor = row.total === 0 ? PDF_COLORS.cellVencido : row.total <= row.stock_minimo ? PDF_COLORS.cellUrgente : '#16a34a'
              return (
                <View key={row.item_id} style={[basePdfStyles.tableRow, i % 2 === 1 ? basePdfStyles.tableRowAlternate : {}]}>
                  <Text style={[basePdfStyles.tableCellBold, { width: colItems[0].ancho }]}>{row.nombre}</Text>
                  <Text style={[basePdfStyles.tableCell,     { width: colItems[1].ancho }]}>{row.categoria}</Text>
                  <Text style={[basePdfStyles.tableCell,     { width: colItems[2].ancho }]}>{row.unidad}</Text>
                  <Text style={[basePdfStyles.tableCell,     { width: colItems[3].ancho }]}>{row.bodega}</Text>
                  {gruasKeys.map((k, gi) => (
                    <Text key={k} style={[basePdfStyles.tableCell, { width: colItems[4 + gi].ancho }]}>
                      {row.gruas[k] ?? 0}
                    </Text>
                  ))}
                  <Text style={[basePdfStyles.tableCellBold, { width: colItems[colItems.length - 2].ancho }]}>{row.total}</Text>
                  <Text style={[basePdfStyles.tableCell,     { width: colItems[colItems.length - 1].ancho, color: estadoColor }]}>{estado}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {sticker && (
          <View style={{ paddingLeft: 32, paddingRight: 32, marginTop: 20 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: PDF_COLORS.primary, marginBottom: 8 }}>
              Stickers de Inventario
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'Nombre',         value: sticker.nombre },
                { label: 'Rango',          value: sticker.configurado ? `#${sticker.rango_inicio.toLocaleString()} al #${sticker.rango_fin.toLocaleString()}` : 'Sin configurar' },
                { label: 'Ultimo usado',   value: sticker.configurado ? `#${sticker.usados.toLocaleString()}` : '-' },
                { label: 'Disponibles',    value: sticker.configurado ? sticker.disponibles.toLocaleString() : '-' },
                { label: '% Utilizado',    value: sticker.configurado ? `${sticker.pct_uso}%` : '-' },
                { label: 'Stock minimo',   value: sticker.stock_minimo.toLocaleString() },
              ].map((item, i, arr) => (
                <View key={item.label} style={{
                  flex: 1,
                  backgroundColor: PDF_COLORS.bgMeta,
                  padding: 8,
                  borderRadius: 4,
                  marginRight: i < arr.length - 1 ? 6 : 0,
                }}>
                  <Text style={{ fontSize: 7, color: PDF_COLORS.textMuted, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
                    {item.label.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 9, color: PDF_COLORS.text, fontFamily: 'Helvetica-Bold' }}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={basePdfStyles.footer}
          render={({ pageNumber, totalPages }) => `Sistema de Movilidad · Parqueadero  ·  Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

// ── Cierres de turno ──────────────────────────────────────────────────────────

interface CierresPDFProps {
  cierres: FilaCierre[]
  filtros: { fechaInicio: string | null; fechaFin: string | null; gruaId: string }
}

const colsCierres = [
  { texto: 'Fecha',        ancho: '10%' },
  { texto: 'Grúa',         ancho: '10%' },
  { texto: 'Ítem',         ancho: '30%' },
  { texto: 'Unidad',       ancho: '8%'  },
  { texto: 'Inicial',      ancho: '10%' },
  { texto: 'Final',        ancho: '10%' },
  { texto: 'Consumido',    ancho: '10%' },
  { texto: 'Registrado por', ancho: '12%' },
]

export function DocumentoCierresPDF({ cierres, filtros }: CierresPDFProps) {
  const metaFiltro = [
    filtros.fechaInicio && filtros.fechaFin
      ? `${fmt(filtros.fechaInicio)} — ${fmt(filtros.fechaFin)}`
      : filtros.fechaInicio ? `Desde ${fmt(filtros.fechaInicio)}`
      : filtros.fechaFin   ? `Hasta ${fmt(filtros.fechaFin)}`
      : 'Todas las fechas',
    filtros.gruaId !== 'todos' ? `Grúa filtrada` : 'Todas las grúas',
  ].join('  ·  ')

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={basePdfStyles.page}>
        <PdfHeader
          titulo="Reporte de Cierres de Turno"
          subtitulo={`Parqueadero · ${metaFiltro}`}
          badge="CIERRES"
          metadata={[
            { label: 'Fecha de generacion', value: fechaHoy() },
            { label: 'Total registros',     value: cierres.length },
            { label: 'Total consumido',     value: `${cierres.reduce((s, c) => s + c.cantidad_consumida, 0)} uds` },
          ]}
        />

        <View style={basePdfStyles.tableWrapper}>
          <View style={basePdfStyles.table}>
            <PdfTableHeader columnas={colsCierres} />
            {cierres.map((row, i) => (
              <View key={`${row.cierre_id}-${row.item_id}`}
                style={[basePdfStyles.tableRow, i % 2 === 1 ? basePdfStyles.tableRowAlternate : {}]}>
                <Text style={[basePdfStyles.tableCell,     { width: colsCierres[0].ancho }]}>{fmt(row.fecha)}</Text>
                <Text style={[basePdfStyles.tableCellBold, { width: colsCierres[1].ancho }]}>{row.grua_placa}</Text>
                <Text style={[basePdfStyles.tableCell,     { width: colsCierres[2].ancho }]}>{row.item_nombre}</Text>
                <Text style={[basePdfStyles.tableCell,     { width: colsCierres[3].ancho }]}>{row.unidad}</Text>
                <Text style={[basePdfStyles.tableCell,     { width: colsCierres[4].ancho }]}>{row.cantidad_inicial}</Text>
                <Text style={[basePdfStyles.tableCell,     { width: colsCierres[5].ancho }]}>{row.cantidad_final}</Text>
                <Text style={[
                  row.cantidad_consumida > 0 ? basePdfStyles.tableCellUrgente : basePdfStyles.tableCell,
                  { width: colsCierres[6].ancho }
                ]}>
                  {row.cantidad_consumida > 0 ? `−${row.cantidad_consumida}` : '—'}
                </Text>
                <Text style={[basePdfStyles.tableCell, { width: colsCierres[7].ancho, color: PDF_COLORS.textMuted }]}>
                  {row.registrado_por ?? '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={basePdfStyles.footer}
          render={({ pageNumber, totalPages }) => `Sistema de Movilidad · Parqueadero  ·  Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
