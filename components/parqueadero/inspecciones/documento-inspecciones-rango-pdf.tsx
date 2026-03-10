"use client"

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { capitalizeName, humanize } from "@/lib/utils/capitalize"
import type { FotoConTimestamp } from "@/lib/parqueadero/types"

// ─── Tipos ────────────────────────────────────────────────
export interface ItemInspeccionRango {
  id: string
  estado: string
  observacion: string | null
  fotos: FotoConTimestamp[] | null
  foto_url: string | null
  item_nombre: string | null
  item_categoria: string | null
  item_orden: number
  subsanado: boolean
  subsanado_observacion: string | null
}

export interface InspeccionRangoData {
  id: string
  consecutivo: string | null
  fecha: string
  hora: string
  turno: string | null
  es_apto: boolean
  observaciones: string | null
  observaciones_fotos: FotoConTimestamp[] | null
  placa: string
  marca: string | null
  modelo: string | null
  vehiculo_tipo: string
  operador_nombre: string
  auxiliar_nombre: string | null
  inspector_nombre: string
  soat_vencimiento: string | null
  tecnomecanica_vencimiento: string | null
  operador_licencia_vencimiento: string | null
  operador_licencia_categoria: string | null
  estado_soat: string | null
  estado_tecnomecanica: string | null
  operador_estado_licencia: string | null
  items_buenos: number
  items_regulares: number
  items_malos: number
  firma_inspector: string | null
  firma_operador: string | null
}

export interface DatoInspeccionRango {
  inspeccion: InspeccionRangoData
  items: ItemInspeccionRango[]
}

// ─── Estilos ──────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  // ─── Encabezado ───────────────────────────────────────
  headerBar: {
    backgroundColor: "#1e3a5f",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#93c5fd",
  },
  headerMeta: {
    alignItems: "flex-end",
  },
  headerConsecutivo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  headerDate: {
    fontSize: 8,
    color: "#93c5fd",
  },

  // ─── Portada ──────────────────────────────────────────
  coverHero: {
    backgroundColor: "#1e3a5f",
    borderRadius: 6,
    padding: 36,
    marginBottom: 30,
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 11,
    color: "#93c5fd",
    textAlign: "center",
  },
  coverStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  coverStatBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    border: "0.5 solid #e5e7eb",
  },
  coverStatNum: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 2,
  },
  coverStatLabel: {
    fontSize: 7,
    color: "#4b5563",
  },

  // ─── Tabla de índice ──────────────────────────────────
  indexTable: {
    marginTop: 4,
  },
  indexHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a5f",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 2,
    marginBottom: 2,
  },
  indexHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  indexRow: {
    flexDirection: "row",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottom: "0.5 solid #f3f4f6",
  },
  indexRowAlt: {
    backgroundColor: "#f9fafb",
  },
  indexCell: {
    fontSize: 8,
    color: "#1f2937",
  },
  colFecha:   { width: 60 },
  colHora:    { width: 42 },
  colPlaca:   { width: 60 },
  colOperador: { flex: 1 },
  colEstado:  { width: 55, textAlign: "center" },
  aptoBadge:   { color: "#166534", fontFamily: "Helvetica-Bold" },
  noAptoBadge: { color: "#991b1b", fontFamily: "Helvetica-Bold" },

  // ─── Separador de inspección ──────────────────────────
  inspeccionSep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "1 solid #e5e7eb",
  },
  inspeccionSepLabel: {
    fontSize: 8,
    color: "#6b7280",
  },

  // ─── Resultado ────────────────────────────────────────
  resultadoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "1 solid #e5e7eb",
  },
  resultadoLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  resultadoBadge: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 3,
  },
  apto:       { backgroundColor: "#f0fdf4", border: "1 solid #bbf7d0" },
  noApto:     { backgroundColor: "#fef2f2", border: "1 solid #fecaca" },
  aptoText:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#166534" },
  noAptoText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#991b1b" },

  // ─── Sección ──────────────────────────────────────────
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "0.5 solid #d1d5db",
  },

  // ─── Info grid ────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 7,
    paddingRight: 12,
  },
  infoLabel: {
    fontSize: 7,
    color: "#4b5563",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9,
    color: "#111827",
  },

  // ─── Documentos ───────────────────────────────────────
  docGrid: {
    flexDirection: "row",
    gap: 10,
  },
  docItem: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 3,
    border: "0.5 solid #e5e7eb",
  },
  docLabel: {
    fontSize: 7,
    color: "#4b5563",
    marginBottom: 2,
  },
  docValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 3,
  },
  docEstado:       { fontSize: 7 },
  estadoVigente:   { color: "#166534" },
  estadoPorVencer: { color: "#b45309" },
  estadoVencido:   { color: "#dc2626" },

  // ─── Resumen ──────────────────────────────────────────
  resumenGrid: {
    flexDirection: "row",
    gap: 10,
  },
  resumenItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 3,
    border: "0.5 solid #e5e7eb",
  },
  resumenNumero: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  resumenLabel: {
    fontSize: 7,
    color: "#4b5563",
  },

  // ─── Novedades ────────────────────────────────────────
  novedadesBox: {
    gap: 5,
  },
  novedadItem: {
    padding: 8,
    borderRadius: 3,
    borderLeft: "3 solid #f59e0b",
    backgroundColor: "#fffbeb",
  },
  novedadItemSubsanado: {
    borderLeft: "3 solid #16a34a",
    backgroundColor: "#f0fdf4",
  },
  novedadItemSeMantiene: {
    borderLeft: "3 solid #d97706",
    backgroundColor: "#fffbeb",
  },
  novedadItemEmpeoro: {
    borderLeft: "3 solid #dc2626",
    backgroundColor: "#fef2f2",
  },
  novedadItemLast: {},
  novedadTitulo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    marginBottom: 2,
  },
  novedadTituloSubsanado: {
    color: "#166534",
  },
  novedadTituloEmpeoro: {
    color: "#991b1b",
  },
  novedadObs: {
    fontSize: 8,
    color: "#78716c",
  },
  novedadResolucion: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
  },
  novedadResolucionSubsanado: { color: "#166534" },
  novedadResolucionSeMantiene: { color: "#b45309" },
  novedadResolucionEmpeoro: { color: "#991b1b" },

  // ─── Tabla de items ───────────────────────────────────
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottom: "0.5 solid #d1d5db",
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  tableRow: {
    flexDirection: "row",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottom: "0.5 solid #f3f4f6",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 8,
    color: "#1f2937",
  },
  colItem:   { flex: 3 },
  colEstado2: { width: 55, textAlign: "center" },
  colObs:    { flex: 2, color: "#4b5563" },

  // ─── Categoría ────────────────────────────────────────
  categoriaHeader: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    marginTop: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    borderLeft: "2 solid #9ca3af",
  },

  // ─── Observaciones ────────────────────────────────────
  observacionesBox: {
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 3,
    border: "0.5 solid #e5e7eb",
    fontSize: 8,
    color: "#1f2937",
  },

  // ─── Firmas ───────────────────────────────────────────
  firmasTitulo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 14,
  },
  firmasContainer: {
    flexDirection: "row",
    gap: 30,
  },
  firmaBox: {
    flex: 1,
    alignItems: "center",
  },
  firmaImagen: {
    width: 130,
    height: 50,
    objectFit: "contain",
    marginBottom: 8,
  },
  firmaLinea: {
    width: "100%",
    borderTop: "0.5 solid #9ca3af",
    marginBottom: 5,
  },
  firmaNombre: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
  },
  firmaLabel: {
    fontSize: 7,
    color: "#4b5563",
    textAlign: "center",
  },

  // ─── Anexos ───────────────────────────────────────────
  anexoItem: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 3,
    border: "0.5 solid #e5e7eb",
  },
  anexoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  anexoTitulo: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  anexoEstado: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  anexoObs: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 8,
  },
  anexoFoto: {
    width: 270,
    height: 200,
    objectFit: "contain",
    borderRadius: 3,
  },

  // ─── Footer ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "0.5 solid #e5e7eb",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: "#6b7280",
  },
})

// ─── Helpers ──────────────────────────────────────────────
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return "—"
  const [year, month, day] = fecha.substring(0, 10).split("-")
  return `${day}/${month}/${year}`
}

const formatearHora = (hora: string | null): string => {
  if (!hora) return "—"
  return hora.substring(0, 5)
}

const getEstadoLabel = (estado: string): string =>
  ({ bueno: "Bueno", regular: "Regular", malo: "Malo", no_aplica: "N/A" }[estado] ?? estado)

const getEstadoDocLabel = (estado: string | null): string =>
  (!estado ? "—" : ({ vigente: "Vigente", por_vencer: "Por vencer", vencido: "Vencido", sin_datos: "Sin datos" }[estado] ?? estado))

const getCategoriaLabel = (categoria: string): string =>
  ({
    niveles: "Niveles", luces: "Luces", exterior: "Exterior", interior: "Interior",
    grua: "Sistema de Grúa", funcional: "Verificación Funcional",
    kit_carretera: "Kit de Carretera", seguridad: "Seguridad",
    documentos: "Documentos", epp_operador: "EPP Operador", epp_auxiliar: "EPP Auxiliar",
  }[categoria] ?? categoria)

const getEstadoDocStyle = (estado: string | null) =>
  estado === "vigente" ? styles.estadoVigente :
  estado === "por_vencer" ? styles.estadoPorVencer :
  estado === "vencido" ? styles.estadoVencido : {}

// Parsea "[SE_MANTIENE] texto" → { estado, texto }
const RESOLUCION_LABELS: Record<string, string> = {
  SUBSANADO: "Subsanado",
  SE_MANTIENE: "Se mantiene",
  EMPEORO: "Empeoró",
}
type EstadoResolucion = "subsanado" | "se_mantiene" | "empeoro" | null
const parsearResolucion = (obs: string | null, subsanado?: boolean): { estado: EstadoResolucion; texto: string } => {
  if (subsanado && !obs) return { estado: "subsanado", texto: "Subsanado" }
  if (!obs) return { estado: null, texto: "" }
  const match = obs.match(/^\[(\w+)\]\s*(.*)$/)
  if (match) {
    const clave = match[1]
    const etiqueta = RESOLUCION_LABELS[clave] ?? clave
    const resto = match[2].trim()
    const estado: EstadoResolucion =
      clave === "SUBSANADO" ? "subsanado" :
      clave === "SE_MANTIENE" ? "se_mantiene" :
      clave === "EMPEORO" ? "empeoro" : null
    return { estado, texto: resto ? `${etiqueta}: ${resto}` : etiqueta }
  }
  return { estado: subsanado ? "subsanado" : null, texto: obs }
}

// ─── Componente ───────────────────────────────────────────
interface Props {
  datos: DatoInspeccionRango[]
  fechaInicio: string
  fechaFin: string
}

export function DocumentoInspeccionesRangoPDF({ datos, fechaInicio, fechaFin }: Props) {
  const totalAptos = datos.filter(d => d.inspeccion.es_apto).length
  const totalNoAptos = datos.length - totalAptos
  const rangoLabel = `${formatearFecha(fechaInicio)} — ${formatearFecha(fechaFin)}`

  // Generar páginas de cada inspección
  const paginasInspecciones = datos.flatMap(({ inspeccion, items }, globalIndex) => {
    const docId = inspeccion.consecutivo || inspeccion.id.split("-")[0].toUpperCase()
    const itemsPorCategoria = items.reduce((acc, item) => {
      const cat = item.item_categoria || "otros"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ItemInspeccionRango[]>)

    const novedades = items.filter(i => i.estado === "regular" || i.estado === "malo")
    const itemsConFoto = items.filter(i => (i.fotos && i.fotos.length > 0) || i.foto_url)
    const tieneObsFotos = inspeccion.observaciones_fotos && inspeccion.observaciones_fotos.length > 0

    const paginas = []

    // Página principal de la inspección
    paginas.push(
      <Page key={`${inspeccion.id}-main`} size="LETTER" style={styles.page}>
        {/* Encabezado con número de inspección */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Inspección Preoperacional</Text>
            <Text style={styles.headerSubtitle}>
              {globalIndex + 1} de {datos.length} · {rangoLabel}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerConsecutivo}>{docId}</Text>
            <Text style={styles.headerDate}>
              {formatearFecha(inspeccion.fecha)} · {formatearHora(inspeccion.hora)}
            </Text>
          </View>
        </View>

        <View>
          {/* Resultado */}
          <View style={styles.resultadoRow} wrap={false}>
            <Text style={styles.resultadoLabel}>Resultado de la inspección</Text>
            <View style={[styles.resultadoBadge, inspeccion.es_apto ? styles.apto : styles.noApto]}>
              <Text style={inspeccion.es_apto ? styles.aptoText : styles.noAptoText}>
                {inspeccion.es_apto ? "APTO" : "NO APTO"}
              </Text>
            </View>
          </View>

          {/* Información general */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Vehículo</Text>
                <Text style={styles.infoValue}>{inspeccion.placa} · {inspeccion.marca} {inspeccion.modelo}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tipo</Text>
                <Text style={styles.infoValue}>{humanize(inspeccion.vehiculo_tipo)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Operador</Text>
                <Text style={styles.infoValue}>{capitalizeName(inspeccion.operador_nombre)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Turno</Text>
                <Text style={styles.infoValue}>{inspeccion.turno === "diurno" ? "Diurno" : "Nocturno"}</Text>
              </View>
              {inspeccion.auxiliar_nombre && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Auxiliar</Text>
                  <Text style={styles.infoValue}>{capitalizeName(inspeccion.auxiliar_nombre)}</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Inspector</Text>
                <Text style={styles.infoValue}>{capitalizeName(inspeccion.inspector_nombre)}</Text>
              </View>
            </View>
          </View>

          {/* Documentación */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>DOCUMENTACIÓN DEL VEHÍCULO</Text>
            <View style={styles.docGrid}>
              <View style={styles.docItem}>
                <Text style={styles.docLabel}>SOAT</Text>
                <Text style={styles.docValue}>{formatearFecha(inspeccion.soat_vencimiento)}</Text>
                <Text style={[styles.docEstado, getEstadoDocStyle(inspeccion.estado_soat)]}>
                  {getEstadoDocLabel(inspeccion.estado_soat)}
                </Text>
              </View>
              <View style={styles.docItem}>
                <Text style={styles.docLabel}>Tecnomecánica</Text>
                <Text style={styles.docValue}>{formatearFecha(inspeccion.tecnomecanica_vencimiento)}</Text>
                <Text style={[styles.docEstado, getEstadoDocStyle(inspeccion.estado_tecnomecanica)]}>
                  {getEstadoDocLabel(inspeccion.estado_tecnomecanica)}
                </Text>
              </View>
              <View style={styles.docItem}>
                <Text style={styles.docLabel}>Licencia {inspeccion.operador_licencia_categoria || ""}</Text>
                <Text style={styles.docValue}>{formatearFecha(inspeccion.operador_licencia_vencimiento)}</Text>
                <Text style={[styles.docEstado, getEstadoDocStyle(inspeccion.operador_estado_licencia)]}>
                  {getEstadoDocLabel(inspeccion.operador_estado_licencia)}
                </Text>
              </View>
            </View>
          </View>

          {/* Resumen */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>RESUMEN DE VERIFICACIÓN</Text>
            <View style={styles.resumenGrid}>
              <View style={styles.resumenItem}>
                <Text style={[styles.resumenNumero, { color: "#166534" }]}>{inspeccion.items_buenos}</Text>
                <Text style={styles.resumenLabel}>Buenos</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={[styles.resumenNumero, { color: "#b45309" }]}>{inspeccion.items_regulares}</Text>
                <Text style={styles.resumenLabel}>Regulares</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={[styles.resumenNumero, { color: "#dc2626" }]}>{inspeccion.items_malos}</Text>
                <Text style={styles.resumenLabel}>Malos</Text>
              </View>
            </View>
          </View>

          {/* Novedades */}
          {novedades.length > 0 && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>NOVEDADES ({novedades.length})</Text>
              <View style={styles.novedadesBox}>
                {novedades.map((item) => {
                  const res = parsearResolucion(item.subsanado_observacion, item.subsanado)
                  const itemStyle =
                    res.estado === "subsanado" ? styles.novedadItemSubsanado :
                    res.estado === "se_mantiene" ? styles.novedadItemSeMantiene :
                    res.estado === "empeoro" ? styles.novedadItemEmpeoro :
                    {}
                  const tituloStyle =
                    res.estado === "subsanado" ? styles.novedadTituloSubsanado :
                    res.estado === "empeoro" ? styles.novedadTituloEmpeoro :
                    {}
                  const resolucionStyle =
                    res.estado === "subsanado" ? styles.novedadResolucionSubsanado :
                    res.estado === "se_mantiene" ? styles.novedadResolucionSeMantiene :
                    res.estado === "empeoro" ? styles.novedadResolucionEmpeoro :
                    {}
                  return (
                    <View key={item.id} style={[styles.novedadItem, itemStyle]}>
                      <Text style={[styles.novedadTitulo, tituloStyle]}>
                        {item.item_nombre} — {getEstadoLabel(item.estado).toUpperCase()}
                      </Text>
                      {item.observacion && <Text style={styles.novedadObs}>{item.observacion}</Text>}
                      {res.texto && (
                        <Text style={[styles.novedadResolucion, resolucionStyle]}>
                          {res.texto}
                        </Text>
                      )}
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Detalle de verificación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DETALLE DE VERIFICACIÓN</Text>
            {Object.entries(itemsPorCategoria).map(([categoria, itemsCat]) => (
              <View key={categoria} wrap={false}>
                <Text style={styles.categoriaHeader}>{getCategoriaLabel(categoria)}</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colItem]}>Ítem</Text>
                    <Text style={[styles.tableHeaderText, styles.colEstado2]}>Estado</Text>
                    <Text style={[styles.tableHeaderText, styles.colObs]}>Observación</Text>
                  </View>
                  {itemsCat.map((item, index) => (
                    <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                      <Text style={[styles.tableCell, styles.colItem]}>{item.item_nombre}</Text>
                      <Text style={[styles.tableCell, styles.colEstado2]}>{getEstadoLabel(item.estado)}</Text>
                      <Text style={[styles.tableCell, styles.colObs]}>{item.observacion || "—"}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Observaciones generales */}
          {inspeccion.observaciones && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>OBSERVACIONES GENERALES</Text>
              <Text style={styles.observacionesBox}>{inspeccion.observaciones}</Text>
            </View>
          )}

          {/* Firmas */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.firmasTitulo}>DECLARACIÓN Y FIRMAS</Text>
            <View style={styles.firmasContainer}>
              <View style={styles.firmaBox}>
                {inspeccion.firma_operador
                  ? <Image src={inspeccion.firma_operador} style={styles.firmaImagen} />
                  : <View style={{ height: 50, marginBottom: 8 }} />
                }
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaNombre}>{capitalizeName(inspeccion.operador_nombre)}</Text>
                <Text style={styles.firmaLabel}>Operador</Text>
              </View>
              <View style={styles.firmaBox}>
                {inspeccion.firma_inspector
                  ? <Image src={inspeccion.firma_inspector} style={styles.firmaImagen} />
                  : <View style={{ height: 50, marginBottom: 8 }} />
                }
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaNombre}>{capitalizeName(inspeccion.inspector_nombre)}</Text>
                <Text style={styles.firmaLabel}>Inspector</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sistema de Movilidad · Inspecciones {rangoLabel}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${docId}  ·  Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    )

    // Página de anexos fotográficos por ítem
    if (itemsConFoto.length > 0) {
      paginas.push(
        <Page key={`${inspeccion.id}-fotos`} size="LETTER" style={styles.page}>
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTitle}>Anexos Fotográficos</Text>
              <Text style={styles.headerSubtitle}>{inspeccion.placa} · {formatearFecha(inspeccion.fecha)}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerConsecutivo}>{docId}</Text>
            </View>
          </View>

          <View>
            {itemsConFoto.map((item, itemIndex) => {
              const fotos: FotoConTimestamp[] = item.fotos && item.fotos.length > 0
                ? item.fotos
                : item.foto_url
                ? [{ url: item.foto_url, timestamp: "", origen: "camera" as const }]
                : []

              return fotos.map((foto, fotoIndex) => (
                <View
                  key={`${item.id}-${fotoIndex}`}
                  style={styles.anexoItem}
                  wrap={false}
                >
                  <View style={styles.anexoHeader}>
                    <Text style={styles.anexoTitulo}>
                      {itemIndex + 1}.{fotoIndex + 1} {item.item_nombre}
                      {fotos.length > 1 && ` (Foto ${fotoIndex + 1}/${fotos.length})`}
                    </Text>
                    <Text style={[styles.anexoEstado, { color: item.estado === "malo" ? "#dc2626" : "#b45309" }]}>
                      {getEstadoLabel(item.estado).toUpperCase()}
                    </Text>
                  </View>
                  {item.observacion && fotoIndex === 0 && (
                    <Text style={styles.anexoObs}>{item.observacion}</Text>
                  )}
                  <Image src={foto.url} style={styles.anexoFoto} />
                </View>
              ))
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Sistema de Movilidad · Anexos Fotográficos</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => `${docId}  ·  Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )
    }

    // Página de fotos de observaciones generales
    if (tieneObsFotos) {
      paginas.push(
        <Page key={`${inspeccion.id}-obs-fotos`} size="LETTER" style={styles.page}>
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTitle}>Observaciones Generales — Anexos</Text>
              <Text style={styles.headerSubtitle}>{inspeccion.placa} · {formatearFecha(inspeccion.fecha)}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerConsecutivo}>{docId}</Text>
            </View>
          </View>

          <View>
            {inspeccion.observaciones_fotos!.map((foto, index) => (
              <View key={index} style={styles.anexoItem} wrap={false}>
                <View style={styles.anexoHeader}>
                  <Text style={styles.anexoTitulo}>Foto {index + 1} de Observaciones Generales</Text>
                </View>
                <Image src={foto.url} style={styles.anexoFoto} />
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Sistema de Movilidad · Observaciones Generales</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => `${docId}  ·  Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )
    }

    return paginas
  })

  return (
    <Document>
      {/* Portada / Índice */}
      <Page size="LETTER" style={styles.page}>
        {/* Hero */}
        <View style={styles.coverHero}>
          <Text style={styles.coverTitle}>Registro de Inspecciones Preoperacionales</Text>
          <Text style={styles.coverSubtitle}>{rangoLabel}</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.coverStats}>
          <View style={styles.coverStatBox}>
            <Text style={styles.coverStatNum}>{datos.length}</Text>
            <Text style={styles.coverStatLabel}>Total inspecciones</Text>
          </View>
          <View style={styles.coverStatBox}>
            <Text style={[styles.coverStatNum, { color: "#166534" }]}>{totalAptos}</Text>
            <Text style={styles.coverStatLabel}>Aptas</Text>
          </View>
          <View style={styles.coverStatBox}>
            <Text style={[styles.coverStatNum, { color: "#dc2626" }]}>{totalNoAptos}</Text>
            <Text style={styles.coverStatLabel}>No aptas</Text>
          </View>
        </View>

        {/* Tabla índice */}
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>ÍNDICE DE INSPECCIONES</Text>
        <View style={styles.indexTable}>
          <View style={styles.indexHeader}>
            <Text style={[styles.indexHeaderText, styles.colFecha]}>Fecha</Text>
            <Text style={[styles.indexHeaderText, styles.colHora]}>Hora</Text>
            <Text style={[styles.indexHeaderText, styles.colPlaca]}>Placa</Text>
            <Text style={[styles.indexHeaderText, styles.colOperador]}>Operador</Text>
            <Text style={[styles.indexHeaderText, styles.colEstado]}>Estado</Text>
          </View>
          {datos.map(({ inspeccion }, idx) => (
            <View key={inspeccion.id} style={[styles.indexRow, idx % 2 === 1 ? styles.indexRowAlt : {}]}>
              <Text style={[styles.indexCell, styles.colFecha]}>{formatearFecha(inspeccion.fecha)}</Text>
              <Text style={[styles.indexCell, styles.colHora]}>{formatearHora(inspeccion.hora)}</Text>
              <Text style={[styles.indexCell, styles.colPlaca]}>{inspeccion.placa}</Text>
              <Text style={[styles.indexCell, styles.colOperador]}>{capitalizeName(inspeccion.operador_nombre)}</Text>
              <Text style={[styles.indexCell, styles.colEstado, inspeccion.es_apto ? styles.aptoBadge : styles.noAptoBadge]}>
                {inspeccion.es_apto ? "APTO" : "NO APTO"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sistema de Movilidad · Inspecciones Preoperacionales</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* Páginas de cada inspección */}
      {paginasInspecciones}
    </Document>
  )
}
