import { ArrowRightLeft, ArrowDownToLine, type LucideIcon } from 'lucide-react'

export type TipoProceso = 'traslado' | 'radicacion'

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
