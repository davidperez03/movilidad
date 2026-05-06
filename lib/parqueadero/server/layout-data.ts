import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { getNowDateColombia } from "@/lib/utils/date"
import type { RolModulo } from "@/lib/types/layout"
import { PARQUEADERO_ROL_COLORS } from "@/lib/types/layout"

interface LayoutData {
  contadores: {
    inspeccionesHoy: number | null
    vehiculosActivos: number | null
    alertasLicencias: number
  }
  rolModulo: RolModulo
  rolColors: Record<string, string>
  tieneMovilidad: boolean
  tieneNunc: boolean
}

/**
 * Obtiene todos los datos necesarios para el layout de parqueadero
 * en la menor cantidad de queries posible.
 */
export async function obtenerLayoutData(
  userId: string,
  esSuperAdmin: boolean
): Promise<LayoutData> {
  const supabase = await createClient()

  const [
    { data: rolesUsuario },
    { count: inspeccionesHoy },
    { count: vehiculosActivos },
    { data: personalConAlertas },
  ] = await Promise.all([
    supabase
      .from("usuarios_roles")
      .select(`
        modulo_id,
        roles_modulo (
          codigo,
          nombre
        )
      `)
      .eq("usuario_id", userId),

    supabase
      .from("parq_inspecciones")
      .select("*", { count: "exact", head: true })
      .eq("fecha", getNowDateColombia()),

    supabase
      .from("parq_vehiculos")
      .select("*", { count: "exact", head: true })
      .eq("activo", true),

    supabase
      .from("parq_vista_personal")
      .select("estado_licencia, rol_codigo")
      .in("estado_licencia", ["vencido", "por_vencer"])
      .not("rol_codigo", "in", "(parq_auxiliar,parq_administrador)"),
  ])

  if (!rolesUsuario) {
    logger.error("Error obteniendo roles para layout parqueadero", { userId })
  }

  // Extraer rol de parqueadero
  const rolParqueadero = rolesUsuario?.find((r) => r.modulo_id === "parqueadero")
  const rolModuloRaw = rolParqueadero?.roles_modulo as unknown as { codigo: string; nombre: string } | null
  const rolModulo: RolModulo = esSuperAdmin
    ? { codigo: "superadmin", nombre: "SuperAdmin" }
    : (rolModuloRaw ?? { codigo: "sin_rol", nombre: "Sin rol" })

  // Verificar acceso a movilidad
  const modulosUsuario = new Set(rolesUsuario?.map((r) => r.modulo_id) || [])
  const tieneMovilidad = esSuperAdmin || modulosUsuario.has("movilidad")
  const tieneNunc      = esSuperAdmin || modulosUsuario.has("nunc")

  return {
    contadores: {
      inspeccionesHoy,
      vehiculosActivos,
      alertasLicencias: personalConAlertas?.length ?? 0,
    },
    rolModulo,
    rolColors: PARQUEADERO_ROL_COLORS,
    tieneMovilidad,
    tieneNunc,
  }
}
