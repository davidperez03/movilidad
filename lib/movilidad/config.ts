import { ArrowRightLeft, ArrowDownToLine, type LucideIcon } from 'lucide-react'

export type TipoProceso = 'traslado' | 'radicacion'

// ============================================================================
// ESTADOS DE PROCESOS
// ============================================================================

export interface OpcionEstado {
  value: string
  label: string
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
