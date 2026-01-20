export interface OrganismoTransito {
  nombre: string
  municipio: string
  departamento: string
}

export interface EmpresaTransporte {
  id: string
  nombre: string
}

export interface UsuarioResumen {
  nombre_completo: string
}

export interface TrasladoHistorial {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_vencimiento: string
  fecha_completado: string | null
  numero_guia: string | null
  observaciones: string | null
  creado_en: string
  actualizado_en: string
  creador: UsuarioResumen | null
  actualizador: UsuarioResumen | null
  organismo: OrganismoTransito | null
  empresa_transporte: EmpresaTransporte | null
}

export interface RadicacionHistorial {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_vencimiento: string
  fecha_completado: string | null
  observaciones: string | null
  creado_en: string
  actualizado_en: string
  creador: UsuarioResumen | null
  actualizador: UsuarioResumen | null
  organismo: OrganismoTransito | null
}

export interface HistorialAccion {
  id: string
  cuenta_id: string
  accion: string
  estado_anterior: string | null
  estado_nuevo: string | null
  creado_en: string
  responsable: UsuarioResumen | null
}
