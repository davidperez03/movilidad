export interface ConfigOpcion {
  value: string
  label: string
  color: string
}

export const ESTADOS_ITEM: Record<string, ConfigOpcion> = {
  bueno: { value: 'bueno', label: 'Bueno', color: 'bg-green-100 text-green-700' },
  regular: { value: 'regular', label: 'Regular', color: 'bg-yellow-100 text-yellow-700' },
  malo: { value: 'malo', label: 'Malo', color: 'bg-red-100 text-red-700' },
  no_aplica: { value: 'no_aplica', label: 'N/A', color: 'bg-gray-100 text-gray-700' },
}

export const ESTADOS_DOCUMENTO: Record<string, ConfigOpcion> = {
  vigente: { value: 'vigente', label: 'Vigente', color: 'bg-green-100 text-green-700' },
  por_vencer: { value: 'por_vencer', label: 'Por vencer', color: 'bg-yellow-100 text-yellow-700' },
  vencido: { value: 'vencido', label: 'Vencido', color: 'bg-red-100 text-red-700' },
  sin_datos: { value: 'sin_datos', label: 'Sin datos', color: 'bg-gray-100 text-gray-500' },
  no_aplica: { value: 'no_aplica', label: 'N/A', color: 'bg-gray-100 text-gray-500' },
}

export const TIPOS_VEHICULO: Record<string, ConfigOpcion> = {
  grua_plataforma: { value: 'grua_plataforma', label: 'Grúa Plataforma', color: 'bg-blue-100 text-blue-700' },
  otro: { value: 'otro', label: 'Otro', color: 'bg-gray-100 text-gray-700' },
}

export const TURNOS: Record<string, ConfigOpcion> = {
  diurno: { value: 'diurno', label: 'Diurno', color: 'bg-amber-100 text-amber-700' },
  nocturno: { value: 'nocturno', label: 'Nocturno', color: 'bg-indigo-100 text-indigo-700' },
}

export const CATEGORIAS_ITEMS: Record<string, ConfigOpcion> = {
  niveles: { value: 'niveles', label: 'Niveles', color: 'bg-blue-100 text-blue-700' },
  luces: { value: 'luces', label: 'Luces', color: 'bg-amber-100 text-amber-700' },
  exterior: { value: 'exterior', label: 'Exterior', color: 'bg-purple-100 text-purple-700' },
  grua: { value: 'grua', label: 'Sistema de Grúa', color: 'bg-cyan-100 text-cyan-700' },
  funcional: { value: 'funcional', label: 'Verificación Funcional', color: 'bg-indigo-100 text-indigo-700' },
  kit_carretera: { value: 'kit_carretera', label: 'Kit de Carretera', color: 'bg-green-100 text-green-700' },
  epp_operador: { value: 'epp_operador', label: 'EPP Operador', color: 'bg-orange-100 text-orange-700' },
  epp_auxiliar: { value: 'epp_auxiliar', label: 'EPP Auxiliar', color: 'bg-pink-100 text-pink-700' },
}

export const OPCIONES_TIPO_VEHICULO = Object.values(TIPOS_VEHICULO)
export const OPCIONES_TURNO = Object.values(TURNOS)

export const OPCIONES_CATEGORIA_LICENCIA: ConfigOpcion[] = [
  { value: 'A1', label: 'A1', color: 'bg-gray-100 text-gray-700' },
  { value: 'A2', label: 'A2', color: 'bg-gray-100 text-gray-700' },
  { value: 'B1', label: 'B1', color: 'bg-blue-100 text-blue-700' },
  { value: 'B2', label: 'B2', color: 'bg-blue-100 text-blue-700' },
  { value: 'B3', label: 'B3', color: 'bg-blue-100 text-blue-700' },
  { value: 'C1', label: 'C1', color: 'bg-orange-100 text-orange-700' },
  { value: 'C2', label: 'C2', color: 'bg-orange-100 text-orange-700' },
  { value: 'C3', label: 'C3', color: 'bg-orange-100 text-orange-700' },
]

export const OPCIONES_TIPO_DOCUMENTO: ConfigOpcion[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía', color: 'bg-gray-100 text-gray-700' },
  { value: 'CE', label: 'Cédula de Extranjería', color: 'bg-gray-100 text-gray-700' },
  { value: 'TI', label: 'Tarjeta de Identidad', color: 'bg-gray-100 text-gray-700' },
  { value: 'PP', label: 'Pasaporte', color: 'bg-gray-100 text-gray-700' },
]
