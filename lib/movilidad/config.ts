import { ArrowRightLeft, ArrowDownToLine, type LucideIcon } from 'lucide-react'

export type TipoProceso = 'traslado' | 'radicacion'

// ============================================================================
// ESTADOS DE PROCESOS
// ============================================================================

export interface OpcionEstado {
  value: string
  label: string
}

/**
 * Configuración unificada de estados con labels y estilos
 */
export interface ConfigEstado {
  value: string
  label: string
  color: string
}

export const ESTADOS_CONFIG: Record<string, ConfigEstado> = {
  sin_asignar: {
    value: "sin_asignar",
    label: "Sin asignar",
    color: "bg-gray-100 text-gray-700 border-gray-300",
  },
  enviado_organismo: {
    value: "enviado_organismo",
    label: "Enviado a organismo",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  recibido: {
    value: "recibido",
    label: "Recibido",
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  revisado: {
    value: "revisado",
    label: "Revisado",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  con_novedades: {
    value: "con_novedades",
    label: "Con novedades",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  pendiente_radicar: {
    value: "pendiente_radicar",
    label: "Pendiente radicar",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  trasladado: {
    value: "trasladado",
    label: "Trasladado",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  radicado: {
    value: "radicado",
    label: "Radicado",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  devuelto: {
    value: "devuelto",
    label: "Devuelto",
    color: "bg-red-100 text-red-700 border-red-300",
  },
}

export const ESTADOS_TRASLADO: OpcionEstado[] = [
  { value: "sin_asignar", label: "Sin asignar" },
  { value: "revisado", label: "Revisado" },
  { value: "con_novedades", label: "Con novedades" },
  { value: "enviado_organismo", label: "Enviado a organismo" },
  { value: "trasladado", label: "Trasladado" },
  { value: "devuelto", label: "Devuelto" },
]

export const ESTADOS_RADICACION: OpcionEstado[] = [
  { value: "sin_asignar", label: "Sin asignar" },
  { value: "recibido", label: "Recibido" },
  { value: "revisado", label: "Revisado" },
  { value: "con_novedades", label: "Con novedades" },
  { value: "pendiente_radicar", label: "Pendiente radicar" },
  { value: "radicado", label: "Radicado" },
  { value: "devuelto", label: "Devuelto" },
]

/**
 * Configuración de tipos de servicio
 */
export const TIPOS_SERVICIO_CONFIG = {
  particular: {
    value: "particular",
    label: "Particular",
    color: "bg-blue-50 text-blue-600",
  },
  publico: {
    value: "publico",
    label: "Público",
    color: "bg-purple-50 text-purple-600",
  },
  otro: {
    value: "otro",
    label: "Otro",
    color: "bg-gray-50 text-gray-600",
  },
}

// ============================================================================
// CONFIGURACIÓN DE PROCESOS
// ============================================================================

export interface ConfigProceso {
  tabla: string
  icono: LucideIcon
  organismoField: 'organismo_destino_id' | 'organismo_origen_id'
  organismoLabel: string
  estadosCompletados: string[]
  labels: {
    singular: string
    plural: string
    nuevo: string
    iniciar: string
  }
  rpcTipo: string
}

export const CONFIG_PROCESO: Record<TipoProceso, ConfigProceso> = {
  traslado: {
    tabla: 'mov_traslados',
    icono: ArrowRightLeft,
    organismoField: 'organismo_destino_id',
    organismoLabel: 'Organismo Destino',
    estadosCompletados: ['trasladado', 'devuelto'],
    labels: {
      singular: 'Traslado',
      plural: 'Traslados',
      nuevo: 'Nuevo Traslado',
      iniciar: 'Iniciar Traslado',
    },
    rpcTipo: 'traslado',
  },
  radicacion: {
    tabla: 'mov_radicaciones',
    icono: ArrowDownToLine,
    organismoField: 'organismo_origen_id',
    organismoLabel: 'Organismo Origen',
    estadosCompletados: ['radicado', 'devuelto'],
    labels: {
      singular: 'Radicación',
      plural: 'Radicaciones',
      nuevo: 'Nueva Radicación',
      iniciar: 'Iniciar Radicación',
    },
    rpcTipo: 'radicacion',
  },
}
