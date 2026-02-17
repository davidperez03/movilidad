import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadicacionesTable } from "@/components/movilidad/radicaciones/radicaciones-table"

export default async function RadicacionesPage() {
  const supabase = await createClient()

  // Obtener datos de vencimiento desde la vista
  const { data: vistaActivas } = await supabase
    .from("mov_vista_proceso_activo")
    .select("proceso_id, dias_restantes")
    .eq("proceso_tipo", "radicacion")

  // Crear mapa de proceso_id -> dias_restantes
  const diasPorProceso = new Map(
    vistaActivas?.map(v => [v.proceso_id, v.dias_restantes]) || []
  )

  // Obtener radicaciones activas con todos sus datos
  const { data: radicacionesActivasRaw, error: errorActivas } = await supabase
    .from("mov_radicaciones")
    .select(`
      *,
      mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      perfiles!creado_por (
        nombre_completo
      ),
      organismo:mov_organismos_transito!organismo_origen_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .not("estado", "in", "(radicado,devuelto)")
    .order("creado_en", { ascending: false })

  const radicacionIds = radicacionesActivasRaw?.map((radicacion) => radicacion.id) || []
  const { data: notificacionesData } = radicacionIds.length > 0
    ? await supabase
        .from("mov_notificaciones_radicacion")
        .select("id, radicacion_id, solicitante_notificado, notificado_en, observaciones")
        .in("radicacion_id", radicacionIds)
    : { data: [] as Array<{
      id: string
      radicacion_id: string
      solicitante_notificado: boolean
      notificado_en: string | null
      observaciones: string | null
    }> }

  const notificacionesPorRadicacion = new Map(
    (notificacionesData || []).map((notificacion) => [notificacion.radicacion_id, notificacion])
  )

  // Agregar días restantes a cada radicación
  const radicacionesActivas = radicacionesActivasRaw?.map((radicacion) => ({
    ...radicacion,
    dias_restantes: diasPorProceso.get(radicacion.id) ?? null,
    notificacion_radicacion: notificacionesPorRadicacion.get(radicacion.id) ?? null,
  }))

  if (errorActivas) {
    logger.error("Error cargando radicaciones activas", { error: errorActivas })
  }

  // Obtener radicaciones completadas
  const { data: radicacionesCompletadas } = await supabase
    .from("mov_radicaciones")
    .select(`
      *,
      mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      perfiles!creado_por (
        nombre_completo
      ),
      organismo:mov_organismos_transito!organismo_origen_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .in("estado", ["radicado", "devuelto"])
    .order("fecha_completado", { ascending: false})
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Radicaciones</h1>
          <p className="text-muted-foreground">Gestión de radicaciones</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/movilidad/radicaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Radicación
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="activas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activas">
            Activas ({radicacionesActivas?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completadas">
            Completadas ({radicacionesCompletadas?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas">
          <Card>
            <CardContent className="pt-6">
              <RadicacionesTable radicaciones={radicacionesActivas || []} esCompletadas={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completadas">
          <Card>
            <CardContent className="pt-6">
              <RadicacionesTable radicaciones={radicacionesCompletadas || []} esCompletadas={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
