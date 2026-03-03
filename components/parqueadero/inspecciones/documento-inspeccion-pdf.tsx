"use client"

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { capitalizeName, humanize } from "@/lib/utils/capitalize"
import type { FotoConTimestamp } from "@/lib/parqueadero/types"

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

  // ─── Encabezado ──────────────────────────────────────
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

  // ─── Cuerpo ───────────────────────────────────────────
  body: {},

  // ─── Resultado ───────────────────────────────────────
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
  apto:   { backgroundColor: "#f0fdf4", border: "1 solid #bbf7d0" },
  noApto: { backgroundColor: "#fef2f2", border: "1 solid #fecaca" },
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
  docEstado: {
    fontSize: 7,
  },
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
    padding: 10,
    backgroundColor: "#fffbeb",
    borderRadius: 3,
    border: "0.5 solid #fde68a",
  },
  novedadItem: {
    marginBottom: 7,
    paddingBottom: 7,
    borderBottom: "0.5 solid #fde68a",
  },
  novedadItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  novedadTitulo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    marginBottom: 2,
  },
  novedadObs: {
    fontSize: 8,
    color: "#78716c",
  },

  // ─── Tabla ────────────────────────────────────────────
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
  colEstado: { width: 55, textAlign: "center" },
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

// ─── Tipos ────────────────────────────────────────────────
interface ItemInspeccion {
  id: string
  estado: string
  observacion: string | null
  fotos: FotoConTimestamp[] | null  // Nuevo: múltiples fotos
  foto_url: string | null  // Mantener para retrocompatibilidad
  item_nombre: string | null
  item_categoria: string | null
  subsanado: boolean
  subsanado_observacion: string | null
}

interface InspeccionPDFData {
  id: string
  consecutivo: string | null
  fecha: string
  hora: string
  turno: string | null
  es_apto: boolean
  observaciones: string | null
  observaciones_fotos: FotoConTimestamp[] | null  // Nuevo
  placa: string
  marca: string
  modelo: string
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

interface DocumentoInspeccionPDFProps {
  inspeccion: InspeccionPDFData
  items: ItemInspeccion[]
}

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

// ─── Componente ───────────────────────────────────────────
export function DocumentoInspeccionPDF({ inspeccion, items }: DocumentoInspeccionPDFProps) {
  const docId = inspeccion.consecutivo || inspeccion.id.split("-")[0].toUpperCase()

  const itemsPorCategoria = items.reduce((acc, item) => {
    const cat = item.item_categoria || "otros"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, ItemInspeccion[]>)

  const novedades = items.filter((i) => i.estado === "regular" || i.estado === "malo")
  // Filtrar items con fotos (nuevo formato o legacy)
  const itemsConFoto = items.filter((i) => {
    if (i.fotos && i.fotos.length > 0) return true
    if (i.foto_url) return true  // Retrocompatibilidad
    return false
  })

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* Encabezado */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Inspecciones Preoperacionales</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerConsecutivo}>{docId}</Text>
            <Text style={styles.headerDate}>
              {formatearFecha(inspeccion.fecha)} · {formatearHora(inspeccion.hora)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>

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
                {novedades.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.novedadItem, index === novedades.length - 1 ? styles.novedadItemLast : {}]}
                  >
                    <Text style={styles.novedadTitulo}>
                      {item.item_nombre} — {getEstadoLabel(item.estado).toUpperCase()}
                      {item.subsanado ? " · Subsanado" : ""}
                    </Text>
                    {item.observacion && <Text style={styles.novedadObs}>{item.observacion}</Text>}
                    {item.subsanado_observacion && (
                      <Text style={[styles.novedadObs, { fontFamily: "Helvetica-Oblique", marginTop: 2 }]}>
                        Subsanación: {item.subsanado_observacion}
                      </Text>
                    )}
                  </View>
                ))}
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
                    <Text style={[styles.tableHeaderText, styles.colEstado]}>Estado</Text>
                    <Text style={[styles.tableHeaderText, styles.colObs]}>Observación</Text>
                  </View>
                  {itemsCat.map((item, index) => (
                    <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                      <Text style={[styles.tableCell, styles.colItem]}>{item.item_nombre}</Text>
                      <Text style={[styles.tableCell, styles.colEstado]}>{getEstadoLabel(item.estado)}</Text>
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
          <Text style={styles.footerText}>Sistema de Movilidad · Inspección Preoperacional</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${docId}  ·  Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* Página de anexos */}
      {itemsConFoto.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTitle}>Anexos Fotográficos</Text>
              <Text style={styles.headerSubtitle}>{inspeccion.placa} · {formatearFecha(inspeccion.fecha)}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerConsecutivo}>{docId}</Text>
            </View>
          </View>

          <View style={styles.body}>
            {itemsConFoto.map((item, itemIndex) => {
              // Obtener array de fotos (nuevo formato o legacy)
              const fotos: FotoConTimestamp[] = item.fotos && item.fotos.length > 0
                ? item.fotos
                : item.foto_url
                ? [{ url: item.foto_url, timestamp: '', origen: 'camera' as const }]  // Retrocompatibilidad
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
      )}

      {/* Página de fotos de observaciones generales */}
      {inspeccion.observaciones_fotos && inspeccion.observaciones_fotos.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTitle}>Observaciones Generales - Anexos Fotográficos</Text>
              <Text style={styles.headerSubtitle}>{inspeccion.placa} · {formatearFecha(inspeccion.fecha)}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerConsecutivo}>{docId}</Text>
            </View>
          </View>

          <View style={styles.body}>
            {inspeccion.observaciones_fotos.map((foto, index) => (
              <View key={index} style={styles.anexoItem} wrap={false}>
                <View style={styles.anexoHeader}>
                  <Text style={styles.anexoTitulo}>
                    Foto {index + 1} de Observaciones Generales
                  </Text>
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
      )}
    </Document>
  )
}
