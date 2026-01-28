// =====================================================
// TIPOS Y INTERFACES PARA MÓDULO DE REPORTES
// =====================================================

export type TipoReporte = 'activos' | 'completados' | 'por-vencer' | 'auditoria'

// =====================================================
// FILTROS
// =====================================================

export interface FiltrosReporte {
  fechaInicio: string | null
  fechaFin: string | null
  estado: string
  organismoId: string
  responsable: string
  tipoProceso: 'todos' | 'traslado' | 'radicacion'
}

export const FILTROS_INICIALES: FiltrosReporte = {
  fechaInicio: null,
  fechaFin: null,
  estado: 'todos',
  organismoId: 'todos',
  responsable: 'todos',
  tipoProceso: 'todos',
}

// =====================================================
// DATOS DE REPORTES
// =====================================================

export interface DatosReporteActivos {
  cuenta_id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: 'traslado' | 'radicacion'
  proceso_id: string
  proceso_estado: string
  ciudad: string
  organismo_id: string
  fecha_tramite: string
  fecha_vencimiento: string
  dias_restantes: number | null
  responsable?: string
  creado_por?: string
  proceso_creado_en: string
}

export interface DatosReporteCompletados {
  cuenta_id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: 'traslado' | 'radicacion'
  proceso_id: string
  estado: string
  fecha_tramite: string
  fecha_completado: string
  duracion_dias: number
  organismo: string
  responsable: string
  observaciones?: string
  creado_en: string
}

export interface DatosReportePorVencer {
  proceso_tipo: 'traslado' | 'radicacion'
  proceso_id: string
  cuenta_id: string
  placa: string
  numero_cuenta: string
  ciudad: string
  estado: string
  fecha_vencimiento: string
  dias_restantes: number
  responsable: string
}

// =====================================================
// DATOS PARA SELECT/COMBOBOX DE FILTROS
// =====================================================

export interface Organismo {
  id: string
  nombre: string
  municipio: string
  departamento: string
}

export interface Responsable {
  id: string
  nombre_completo: string
  correo: string
}

// =====================================================
// ESTADÍSTICAS POR TIPO DE REPORTE
// =====================================================

export interface EstadisticasActivos {
  total: number
  traslados: number
  radicaciones: number
  porVencer: number
  enTramite: number
}

export interface EstadisticasCompletados {
  total: number
  trasladados: number
  radicados: number
  devueltos: number
  duracionPromedio: number
}

export interface EstadisticasPorVencer {
  total: number
  criticos: number
  alta: number
  media: number
  vencidos: number
}

// =====================================================
// CONFIGURACIÓN DE REPORTES
// =====================================================

export interface ConfigReporte {
  tipo: TipoReporte
  titulo: string
  descripcion: string
  icono: string
  color: string
}

export const REPORTES_CONFIG: Record<TipoReporte, ConfigReporte> = {
  activos: {
    tipo: 'activos',
    titulo: 'Procesos Activos',
    descripcion: 'Traslados y radicaciones en curso',
    icono: 'Activity',
    color: 'blue',
  },
  completados: {
    tipo: 'completados',
    titulo: 'Procesos Completados',
    descripcion: 'Histórico de procesos finalizados',
    icono: 'CheckCircle',
    color: 'green',
  },
  'por-vencer': {
    tipo: 'por-vencer',
    titulo: 'Procesos por Vencer',
    descripcion: 'Alertas de vencimientos próximos',
    icono: 'Clock',
    color: 'orange',
  },
  auditoria: {
    tipo: 'auditoria',
    titulo: 'Auditoría',
    descripcion: 'Registro de actividad del sistema',
    icono: 'Shield',
    color: 'purple',
  },
}
