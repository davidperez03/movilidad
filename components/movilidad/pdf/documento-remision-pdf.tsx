"use client"

import React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Definir estilos
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    width: "60%",
    color: "#000",
  },
  divider: {
    borderBottom: "1px solid #ddd",
    marginVertical: 15,
  },
  observaciones: {
    marginTop: 5,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    minHeight: 60,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
    borderTop: "1px solid #ddd",
    paddingTop: 10,
  },
  consecutivo: {
    textAlign: "right",
    fontSize: 10,
    color: "#666",
    marginBottom: 15,
  },
})

interface Organismo {
  id: string
  nombre: string
  tipo: string
  telefono?: string
  direccion?: string
  municipio: string
  departamento: string
}

interface Vehiculo {
  placa: string
  numero_cuenta: string
  tipo_servicio: string
}

interface DocumentoRemisionPDFProps {
  traslado: {
    id: string
    fecha_tramite: string
    observaciones?: string
    creado_en: string
  }
  organismoOrigen: Organismo
  organismoDestino: Organismo
  vehiculo: Vehiculo
}

export function DocumentoRemisionPDF({
  traslado,
  organismoOrigen,
  organismoDestino,
  vehiculo,
}: DocumentoRemisionPDFProps) {
  // Funciones de formateo simples que solo manipulan strings
  const formatearFechaCorta = (fecha: string): string => {
    if (!fecha) return '-'
    // Tomar solo YYYY-MM-DD y convertir a dd/MM/yyyy
    const fechaSolo = fecha.substring(0, 10)
    const [year, month, day] = fechaSolo.split('-')
    return `${day}/${month}/${year}`
  }

  const formatearFechaHora = (fechaISO: string): string => {
    if (!fechaISO) return '-'
    // Para timestamp: extraer fecha y hora sin conversión de timezone
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    const horas = String(fecha.getHours()).padStart(2, '0')
    const minutos = String(fecha.getMinutes()).padStart(2, '0')

    return `${dia}/${mes}/${año} ${horas}:${minutos}`
  }

  const formatearFechaHoraActual = (): string => {
    const ahora = new Date()
    const dia = String(ahora.getDate()).padStart(2, '0')
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const año = ahora.getFullYear()
    const horas = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')

    return `${dia}/${mes}/${año} ${horas}:${minutos}`
  }

  const consecutivo = traslado.id.split("-")[0].toUpperCase()

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Documento de Remisión</Text>
          <Text style={styles.subtitle}>Traslado de Cuenta de Vehículo</Text>
        </View>

        {/* Consecutivo */}
        <Text style={styles.consecutivo}>Consecutivo: {consecutivo}</Text>

        {/* Información del Remitente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remitente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Organismo:</Text>
            <Text style={styles.value}>{organismoOrigen.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{organismoOrigen.tipo}</Text>
          </View>
          {organismoOrigen.direccion && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{organismoOrigen.direccion}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Municipio:</Text>
            <Text style={styles.value}>
              {organismoOrigen.municipio}, {organismoOrigen.departamento}
            </Text>
          </View>
          {organismoOrigen.telefono && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{organismoOrigen.telefono}</Text>
            </View>
          )}
        </View>

        {/* Información del Destinatario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatario</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Organismo:</Text>
            <Text style={styles.value}>{organismoDestino.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{organismoDestino.tipo}</Text>
          </View>
          {organismoDestino.direccion && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{organismoDestino.direccion}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Municipio:</Text>
            <Text style={styles.value}>
              {organismoDestino.municipio}, {organismoDestino.departamento}
            </Text>
          </View>
          {organismoDestino.telefono && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{organismoDestino.telefono}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Información del Vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Placa:</Text>
            <Text style={styles.value}>{vehiculo.placa}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Número de Cuenta:</Text>
            <Text style={styles.value}>{vehiculo.numero_cuenta}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Servicio:</Text>
            <Text style={styles.value}>
              {vehiculo.tipo_servicio === "publico" ? "Público" : "Particular"}
            </Text>
          </View>
        </View>

        {/* Fecha de Trámite */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Trámite</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Trámite:</Text>
            <Text style={styles.value}>{formatearFechaCorta(traslado.fecha_tramite)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registrado en sistema:</Text>
            <Text style={styles.value}>{formatearFechaHora(traslado.creado_en)}</Text>
          </View>
        </View>

        {/* Observaciones */}
        {traslado.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <View style={styles.observaciones}>
              <Text>{traslado.observaciones}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado electrónicamente el {formatearFechaHoraActual()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
