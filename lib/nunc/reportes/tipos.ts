export interface FilaSesionNunc {
  codigo: string
  entidad_nombre: string
  nombre_peritos: string
  estado: string
  total_registros: number
  creado_en: string
  expira_en: string
  generado_por: string | null
}

export interface FilaRegistroNunc {
  placa: string
  nunc_completo: string
  nunc_dpto: string
  nunc_municipio: string
  nunc_entidad: string
  nunc_unidad: string
  nunc_anio: number
  nunc_consecutivo: string
  observaciones: string | null
  registrado_en: string
}

export interface FiltrosNunc {
  fechaInicio: string | null
  fechaFin: string | null
}

export const FILTROS_NUNC_INICIALES: FiltrosNunc = {
  fechaInicio: null,
  fechaFin: null,
}
