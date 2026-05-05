import { createClient } from "@/lib/supabase/server"

export async function obtenerCuentaVehiculo(placa: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mov_cuentas_vehiculos")
    .select(`
      *,
      creador:perfiles!creado_por (
        nombre_completo,
        correo
      )
    `)
    .eq("placa", placa.toUpperCase())
    .single()

  if (error) throw error
  return data
}

export async function obtenerProcesoActivo(cuentaId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("mov_vista_proceso_activo_detalle")
    .select("*")
    .eq("cuenta_id", cuentaId)
    .single()

  if (!data?.proceso_id) return null

  return {
    ...data,
    creador: data.proceso_creador_nombre
      ? { nombre_completo: data.proceso_creador_nombre }
      : null,
    actualizador: data.proceso_actualizador_nombre
      ? { nombre_completo: data.proceso_actualizador_nombre }
      : null,
    empresa_transporte: data.empresa_transporte_id
      ? { id: data.empresa_transporte_id, nombre: data.empresa_transporte_nombre }
      : null,
    notificacion_radicacion: data.notificacion_radicacion_id
      ? {
          id: data.notificacion_radicacion_id,
          solicitante_notificado: data.notificacion_solicitante_notificado,
          notificado_en: data.notificacion_notificado_en,
          observaciones: data.notificacion_observaciones,
        }
      : null,
  }
}

export async function obtenerHistorialTraslados(cuentaId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("mov_traslados")
    .select(`
      *,
      creador:perfiles!creado_por (nombre_completo),
      actualizador:perfiles!actualizado_por (nombre_completo),
      organismo:mov_organismos_transito!organismo_destino_id (nombre, municipio, departamento),
      empresa_transporte:mov_empresas_transporte (id, nombre)
    `)
    .eq("cuenta_id", cuentaId)
    .order("creado_en", { ascending: false })

  return data || []
}

export async function obtenerHistorialRadicaciones(cuentaId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("mov_radicaciones")
    .select(`
      *,
      creador:perfiles!creado_por (nombre_completo),
      actualizador:perfiles!actualizado_por (nombre_completo),
      organismo:mov_organismos_transito!organismo_origen_id (nombre, municipio, departamento),
      empresa_transporte:mov_empresas_transporte!empresa_transportadora_id (id, nombre)
    `)
    .eq("cuenta_id", cuentaId)
    .order("creado_en", { ascending: false })

  return data || []
}

export async function obtenerNovedadesProceso(procesoId: string, procesoTipo: 'traslado' | 'radicacion') {
  const supabase = await createClient()

  const { data } = await supabase
    .from("mov_novedades")
    .select(`
      *,
      creador:perfiles!creado_por (nombre_completo),
      resolutor:perfiles!resuelta_por (nombre_completo)
    `)
    .eq("proceso_tipo", procesoTipo)
    .eq("proceso_id", procesoId)
    .order("creado_en", { ascending: false })

  return data || []
}

export async function obtenerHistorialAcciones(cuentaId: string, limite: number = 20) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("mov_historial_acciones")
    .select(`
      *,
      responsable:perfiles!realizado_por (nombre_completo)
    `)
    .eq("cuenta_id", cuentaId)
    .order("creado_en", { ascending: false })
    .limit(limite)

  return data || []
}
