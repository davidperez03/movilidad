import { CheckCircle, XCircle, AlertCircle, MinusCircle } from "lucide-react"
import type { EstadoDocumento } from "./types"

const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

// "01 ene 2024"
export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return "Sin registrar"
  const [year, month, day] = fecha.split("-")
  return `${day} ${MESES_CORTO[parseInt(month, 10) - 1]} ${year}`
}

// "01/01/2024"
export function formatearFechaCorta(fecha: string | null | undefined): string {
  if (!fecha) return "-"
  const [year, month, day] = fecha.split("-")
  return `${day}/${month}/${year}`
}

// "lunes, 1 de enero de 2024"
export function formatearFechaLarga(fecha: string | null | undefined): string {
  if (!fecha) return "Sin registrar"
  const d = new Date(fecha + "T12:00:00")
  const diaSemana = DIAS_SEMANA[d.getDay()]
  const dia = d.getDate()
  const mes = MESES_LARGO[d.getMonth()]
  const year = d.getFullYear()
  return `${diaSemana}, ${dia} de ${mes} de ${year}`
}

// "1 de enero de 2024, 10:30"
export function formatearFechaHora(fechaISO: string | null | undefined): string {
  if (!fechaISO) return "Sin registrar"
  const d = new Date(fechaISO)
  const dia = d.getDate()
  const mes = MESES_LARGO[d.getMonth()]
  const year = d.getFullYear()
  const hora = d.getHours().toString().padStart(2, "0")
  const min = d.getMinutes().toString().padStart(2, "0")
  return `${dia} de ${mes} de ${year}, ${hora}:${min}`
}

// "10:30"
export function formatearHora(hora: string | null | undefined): string {
  if (!hora) return "-"
  return hora.slice(0, 5)
}

export function getEstadoDocumentoColor(estado: EstadoDocumento | string | undefined): string {
  if (!estado || estado === "sin_datos") return "text-gray-500"
  if (estado === "vencido") return "text-red-600"
  if (estado === "por_vencer") return "text-orange-600"
  if (estado === "no_aplica") return "text-gray-500"
  return "text-green-600"
}

export const ESTADO_ITEM_ICONS = {
  bueno: CheckCircle,
  regular: AlertCircle,
  malo: XCircle,
  no_aplica: MinusCircle,
} as const

export const ESTADO_ITEM_COLORS = {
  bueno: { icon: "text-green-600", bg: "border-green-500 bg-green-50" },
  regular: { icon: "text-yellow-600", bg: "border-yellow-500 bg-yellow-50" },
  malo: { icon: "text-red-600", bg: "border-red-500 bg-red-50" },
  no_aplica: { icon: "text-gray-400", bg: "border-gray-300 bg-gray-50" },
} as const

export type EstadoItem = keyof typeof ESTADO_ITEM_ICONS
