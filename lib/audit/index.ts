export type ModuloAuditoria = 'sistema' | 'movilidad' | 'parqueadero' | 'inventarios'

export type AccionSistema =
  | 'usuario_creado' | 'usuario_editado' | 'usuario_eliminado'
  | 'usuario_activado' | 'usuario_desactivado' | 'usuario_aprobado'
  | 'rol_global_cambiado' | 'rol_modulo_asignado' | 'rol_modulo_removido' | 'rol_modulo_cambiado'
  | 'password_reseteado' | 'password_cambiado'
  | 'modulo_activado' | 'modulo_desactivado' | 'configuracion_modificada'
  | 'login_exitoso' | 'login_fallido' | 'logout' | 'sesion_expirada'
  | 'sesion_cerrada_por_admin' | 'sesiones_token_expirado'

export type AccionMovilidad =
  | 'cuenta_creada' | 'traslado_iniciado' | 'radicacion_iniciada'
  | 'estado_cambiado' | 'novedad_agregada' | 'novedad_resuelta'
  | 'proceso_completado' | 'proceso_devuelto' | 'observacion_agregada'

export type AccionParqueadero =
  | 'parq_vehiculo_creado' | 'parq_vehiculo_editado'
  | 'parq_vehiculo_activado' | 'parq_vehiculo_desactivado'
  | 'parq_inspeccion_creada' | 'parq_novedad_subsanada' | 'parq_personal_actualizado'

export type AccionAuditoria = AccionSistema | AccionMovilidad | AccionParqueadero

export interface EventoAuditoria {
  id: string
  modulo: ModuloAuditoria
  accion: string
  entidad_tipo: string | null
  entidad_id: string | null
  detalles: Record<string, unknown> | null
  valor_anterior: string | null
  valor_nuevo: string | null
  usuario_id: string | null
  usuario_correo: string | null
  usuario_nombre: string | null
  ip_address: string | null
  user_agent: string | null
  creado_en: string
  sesion_id: string | null
  secuencia: number | null
  hash_registro: string | null
  cuenta_id: string | null
  proceso_tipo: string | null
  proceso_id: string | null
  placa: string | null
}

export interface FiltrosAuditoria {
  usuario_id?: string
  desde?: string       // ISO date string
  hasta?: string       // ISO date string
  accion?: string
  modulo?: ModuloAuditoria
  entidad_tipo?: string
  entidad_id?: string
  sesion_id?: string
  page?: number
  limit?: number
}

export interface ResultadoAuditoria {
  data: EventoAuditoria[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ResultadoVerificacionTabla {
  tabla: string
  total_registros: number
  registros_integros: number
  registros_corruptos: number
  cadena_integra: boolean
  primer_id_corrupto: string | null
  primer_fecha_corrupta: string | null
}

export interface ResultadoVerificacion {
  tablas: ResultadoVerificacionTabla[]
  todo_integro: boolean
  total_registros: number
  total_corruptos: number
  verificado_en: string
}

export interface ParametrosAuditoriaLogger {
  accion: AccionSistema
  entidadTipo?: string
  entidadId?: string
  detalles?: Record<string, unknown>
  valorAnterior?: string
  valorNuevo?: string
  ipAddress?: string
  userAgent?: string
  sesionId?: string
}
