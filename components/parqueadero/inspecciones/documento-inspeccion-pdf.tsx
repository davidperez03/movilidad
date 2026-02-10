"use client"

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { capitalizeName } from "@/lib/utils/capitalize"

// Estilos del PDF - diseño limpio y profesional
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "1 solid #e5e7eb",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    textAlign: "right",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  consecutivo: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  resultadoBadge: {
    marginTop: 6,
    padding: "6 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
  apto: {
    backgroundColor: "#f0fdf4",
    color: "#166534",
    border: "1 solid #bbf7d0",
  },
  noApto: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1 solid #fecaca",
  },
  // Secciones
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1 solid #e5e7eb",
  },
  // Grid de información
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 6,
    paddingRight: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9,
    color: "#111827",
  },
  // Documentos
  docGrid: {
    flexDirection: "row",
    gap: 12,
  },
  docItem: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  docLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  docValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  docEstado: {
    fontSize: 8,
    marginTop: 3,
  },
  estadoVigente: {
    color: "#166534",
  },
  estadoPorVencer: {
    color: "#b45309",
  },
  estadoVencido: {
    color: "#dc2626",
  },
  // Resumen
  resumenGrid: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },
  resumenItem: {
    alignItems: "center",
  },
  resumenNumero: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resumenLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  // Tabla
  table: {
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: "6 8",
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 8",
    borderBottom: "0.5 solid #e5e7eb",
    fontSize: 8,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  colItem: {
    flex: 3,
  },
  colEstado: {
    width: 55,
    textAlign: "center",
  },
  colObs: {
    flex: 2,
    color: "#6b7280",
  },
  // Categoría
  categoriaHeader: {
    backgroundColor: "#f3f4f6",
    padding: "4 8",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  // Novedades
  novedadesSection: {
    marginTop: 4,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    border: "1 solid #fde68a",
  },
  novedadItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "0.5 solid #fde68a",
  },
  novedadItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottom: "none",
  },
  novedadTitulo: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 2,
  },
  novedadObs: {
    fontSize: 8,
    color: "#78716c",
  },
  // Firmas
  firmasContainer: {
    flexDirection: "row",
    gap: 40,
  },
  firmaBox: {
    flex: 1,
    alignItems: "center",
  },
  firmaImagen: {
    width: 140,
    height: 50,
    objectFit: "contain",
    marginBottom: 8,
  },
  firmaLinea: {
    width: "100%",
    borderTop: "1 solid #9ca3af",
    marginBottom: 4,
  },
  firmaNombre: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  firmaLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9ca3af",
    paddingTop: 10,
    borderTop: "0.5 solid #e5e7eb",
  },
  // Observaciones
  observaciones: {
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    marginTop: 4,
  },
  // Anexos
  anexoItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  anexoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  anexoTitulo: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  anexoEstado: {
    fontSize: 9,
    fontWeight: "bold",
  },
  anexoObs: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 8,
  },
  anexoFoto: {
    width: 280,
    height: 210,
    objectFit: "contain",
    borderRadius: 4,
  },
  // Título de firmas
  firmasTitulo: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
})

// Tipos
interface ItemInspeccion {
  id: string
  estado: string
  observacion: string | null
  foto_url: string | null
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

// Helpers
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return "-"
  const [year, month, day] = fecha.substring(0, 10).split("-")
  return `${day}/${month}/${year}`
}

const formatearHora = (hora: string | null): string => {
  if (!hora) return "-"
  return hora.substring(0, 5)
}

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    bueno: "Bueno",
    regular: "Regular",
    malo: "Malo",
    no_aplica: "N/A",
  }
  return labels[estado] || estado
}

const getEstadoDocLabel = (estado: string | null): string => {
  if (!estado) return "-"
  const labels: Record<string, string> = {
    vigente: "Vigente",
    por_vencer: "Por vencer",
    vencido: "Vencido",
    sin_datos: "Sin datos",
  }
  return labels[estado] || estado
}

const getCategoriaLabel = (categoria: string): string => {
  const labels: Record<string, string> = {
    niveles: "Niveles",
    luces: "Luces",
    exterior: "Exterior",
    interior: "Interior",
    grua: "Sistema de Grúa",
    funcional: "Verificación Funcional",
    kit_carretera: "Kit de Carretera",
    seguridad: "Seguridad",
    documentos: "Documentos",
    epp_operador: "EPP Operador",
    epp_auxiliar: "EPP Auxiliar",
  }
  return labels[categoria] || categoria
}

const getEstadoDocStyle = (estado: string | null) => {
  if (estado === "vigente") return styles.estadoVigente
  if (estado === "por_vencer") return styles.estadoPorVencer
  if (estado === "vencido") return styles.estadoVencido
  return {}
}

export function DocumentoInspeccionPDF({ inspeccion, items }: DocumentoInspeccionPDFProps) {
  // Agrupar items por categoría
  const itemsPorCategoria = items.reduce((acc, item) => {
    const categoria = item.item_categoria || "otros"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(item)
    return acc
  }, {} as Record<string, ItemInspeccion[]>)

  // Separar novedades
  const novedades = items.filter(
    (item) => item.estado === "regular" || item.estado === "malo"
  )

  // Items con foto
  const itemsConFoto = items.filter((item) => item.foto_url)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Inspección Preoperacional</Text>
            <Text style={styles.subtitle}>Control de Vehículos</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.consecutivo}>
              {inspeccion.consecutivo || inspeccion.id.split("-")[0].toUpperCase()}
            </Text>
            <Text style={styles.subtitle}>
              {formatearFecha(inspeccion.fecha)} · {formatearHora(inspeccion.hora)}
            </Text>
            <View style={[styles.resultadoBadge, inspeccion.es_apto ? styles.apto : styles.noApto]}>
              <Text>{inspeccion.es_apto ? "APTO" : "NO APTO"}</Text>
            </View>
          </View>
        </View>

        {/* Información general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vehículo</Text>
              <Text style={styles.infoValue}>
                {inspeccion.placa} · {inspeccion.marca} {inspeccion.modelo}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>{inspeccion.vehiculo_tipo || "-"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Operador</Text>
              <Text style={styles.infoValue}>{capitalizeName(inspeccion.operador_nombre)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Turno</Text>
              <Text style={styles.infoValue}>
                {inspeccion.turno === "diurno" ? "Diurno" : "Nocturno"}
              </Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentación</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Verificación</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Novedades ({novedades.length})</Text>
            <View style={styles.novedadesSection}>
              {novedades.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.novedadItem,
                    index === novedades.length - 1 ? styles.novedadItemLast : {},
                  ]}
                >
                  <Text style={styles.novedadTitulo}>
                    {item.item_nombre} — {getEstadoLabel(item.estado).toUpperCase()}
                    {item.subsanado && " (Subsanado)"}
                  </Text>
                  {item.observacion && (
                    <Text style={styles.novedadObs}>{item.observacion}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items por categoría */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Verificación</Text>
          {Object.entries(itemsPorCategoria).map(([categoria, itemsCat]) => (
            <View key={categoria}>
              <Text style={styles.categoriaHeader}>{getCategoriaLabel(categoria)}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.colItem}>Item</Text>
                  <Text style={styles.colEstado}>Estado</Text>
                  <Text style={styles.colObs}>Observación</Text>
                </View>
                {itemsCat.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <Text style={styles.colItem}>{item.item_nombre}</Text>
                    <Text style={styles.colEstado}>{getEstadoLabel(item.estado)}</Text>
                    <Text style={styles.colObs}>{item.observacion || "-"}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Observaciones generales */}
        {inspeccion.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones Generales</Text>
            <View style={styles.observaciones}>
              <Text>{inspeccion.observaciones}</Text>
            </View>
          </View>
        )}

        {/* Firmas */}
        <View style={styles.section}>
          <Text style={styles.firmasTitulo}>FIRMAS</Text>
          <View style={styles.firmasContainer}>
            <View style={styles.firmaBox}>
              {inspeccion.firma_operador ? (
                <Image src={inspeccion.firma_operador} style={styles.firmaImagen} />
              ) : (
                <View style={{ height: 50, marginBottom: 8 }} />
              )}
              <View style={styles.firmaLinea} />
              <Text style={styles.firmaNombre}>{capitalizeName(inspeccion.operador_nombre)}</Text>
              <Text style={styles.firmaLabel}>Operador</Text>
            </View>
            <View style={styles.firmaBox}>
              {inspeccion.firma_inspector ? (
                <Image src={inspeccion.firma_inspector} style={styles.firmaImagen} />
              ) : (
                <View style={{ height: 50, marginBottom: 8 }} />
              )}
              <View style={styles.firmaLinea} />
              <Text style={styles.firmaNombre}>{capitalizeName(inspeccion.inspector_nombre)}</Text>
              <Text style={styles.firmaLabel}>Inspector</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {new Date().toLocaleDateString("es-CO")} · {inspeccion.consecutivo || ""}
          </Text>
        </View>
      </Page>

      {/* Página de anexos fotográficos */}
      {itemsConFoto.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Anexos Fotográficos</Text>
              <Text style={styles.subtitle}>
                {inspeccion.placa} · {formatearFecha(inspeccion.fecha)}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.consecutivo}>
                {inspeccion.consecutivo || inspeccion.id.split("-")[0].toUpperCase()}
              </Text>
            </View>
          </View>

          {itemsConFoto.map((item, index) => (
            <View key={item.id} style={styles.anexoItem} wrap={false}>
              <View style={styles.anexoHeader}>
                <Text style={styles.anexoTitulo}>
                  {index + 1}. {item.item_nombre}
                </Text>
                <Text
                  style={[
                    styles.anexoEstado,
                    { color: item.estado === "malo" ? "#dc2626" : "#b45309" },
                  ]}
                >
                  {getEstadoLabel(item.estado).toUpperCase()}
                </Text>
              </View>
              {item.observacion && (
                <Text style={styles.anexoObs}>{item.observacion}</Text>
              )}
              {item.foto_url && (
                <Image src={item.foto_url} style={styles.anexoFoto} />
              )}
            </View>
          ))}

          <View style={styles.footer}>
            <Text>Anexos fotográficos · {inspeccion.consecutivo || ""}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
