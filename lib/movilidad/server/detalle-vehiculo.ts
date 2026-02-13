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

  const { data: procesoActivoData } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")
    .eq("cuenta_id", cuentaId)
    .single()

  if (!procesoActivoData?.proceso_id) {
    return null
  }

  // Obtener detalles completos con usuarios
  const { data: procesoDetalle } = procesoActivoData.proceso_tipo === "traslado"
    ? await supabase
        .from("mov_traslados")
        .select(`
          *,
          creador:perfiles!creado_por (nombre_completo),
          actualizador:perfiles!actualizado_por (nombre_completo),
          empresa_transporte:mov_empresas_transporte!empresa_transportadora_id (id, nombre)
        `)
        .eq("id", procesoActivoData.proceso_id)
        .single()
    : await supabase
        .from("mov_radicaciones")
        .select(`
          *,
          creador:perfiles!creado_por (nombre_completo),
          actualizador:perfiles!actualizado_por (nombre_completo),
          empresa_transporte:mov_empresas_transporte!empresa_transportadora_id (id, nombre)
        `)
        .eq("id", procesoActivoData.proceso_id)
        .single()

  if (procesoDetalle) {
    if (procesoActivoData.proceso_tipo === "radicacion") {
      const { data: notificacionRadicacion } = await supabase
        .from("mov_notificaciones_radicacion")
        .select("id, solicitante_notificado, notificado_en, observaciones")
        .eq("radicacion_id", procesoActivoData.proceso_id)
        .maybeSingle()

      return {
        ...procesoActivoData,
        ...procesoDetalle,
        notificacion_radicacion: notificacionRadicacion ?? null,
      }
    }

    return {
      ...procesoActivoData,
      ...procesoDetalle,
      notificacion_radicacion: null,
    }
  }

  return {
    ...procesoActivoData,
    notificacion_radicacion: null,
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
