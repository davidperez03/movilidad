export interface ItemCatalogo {
  id: string
  codigo: string
  nombre: string
  categoria: string
  descripcion: string | null
  orden: number
  activo: boolean
}

export type EstadoDocumento = 'vigente' | 'por_vencer' | 'vencido' | 'sin_datos' | 'no_aplica'

export interface VistaInspeccion {
  id: string
  consecutivo: string | null
  fecha: string
  hora: string
  turno: string | null
  es_apto: boolean
  observaciones: string | null
  creado_en: string
  vehiculo_id: string
  placa: string
  marca: string | null
  modelo: string | null
  vehiculo_tipo: string
  soat_vencimiento: string | null
  tecnomecanica_vencimiento: string | null
  estado_soat: EstadoDocumento
  estado_tecnomecanica: EstadoDocumento
  operador_id: string
  operador_nombre: string
  operador_licencia_vencimiento: string | null
  operador_licencia_categoria: string | null
  operador_estado_licencia: EstadoDocumento
  auxiliar_id: string | null
  auxiliar_nombre: string | null
  inspector_id: string
  inspector_nombre: string
  items_buenos: number
  items_regulares: number
  items_malos: number
}

export interface VistaVehiculo {
  id: string
  placa: string
  marca: string | null
  modelo: string | null
  tipo: string
  activo: boolean
  soat_aseguradora: string | null
  soat_vencimiento: string | null
  tecnomecanica_vencimiento: string | null
  estado_soat: EstadoDocumento
  estado_tecnomecanica: EstadoDocumento
  total_inspecciones: number
  ultima_inspeccion: string | null
}

export interface VistaPersonal {
  id: string
  nombre_completo: string
  correo: string
  rol_codigo: string
  rol_nombre: string
  licencia_numero: string | null
  licencia_categoria: string | null
  licencia_vencimiento: string | null
  licencia_restricciones: string | null
  documento_tipo: string | null
  documento_numero: string | null
  telefono: string | null
  estado_licencia: EstadoDocumento
}
