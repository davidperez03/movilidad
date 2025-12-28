import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowDownToLine, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcesoCard } from "@/components/movilidad/proceso-card"
import { EmptyState } from "@/components/shared/empty-state"

export default async function RadicacionesPage() {
  const supabase = await createClient()

  // Obtener radicaciones activas
  const { data: radicacionesActivas, error: errorActivas } = await supabase
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

  if (errorActivas) {
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
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Radicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona los procesos de recepción de vehículos
          </p>
        </div>
        <Button asChild>
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

        <TabsContent value="activas" className="space-y-4">
          {radicacionesActivas && radicacionesActivas.length > 0 ? (
            radicacionesActivas.map((radicacion) => (
              <ProcesoCard
                key={radicacion.id}
                proceso={radicacion}
                tipoProceso="radicacion"
                esCompletado={false}
              />
            ))
          ) : (
            <EmptyState
              icon={ArrowDownToLine}
              titulo="No hay radicaciones activas"
              descripcion="No hay procesos de radicación en curso en este momento"
              accion={
                <Button asChild>
                  <Link href="/movilidad/radicaciones/nueva">
                    <Plus className="h-4 w-4 mr-2" />
                    Iniciar Primera Radicación
                  </Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4">
          {radicacionesCompletadas && radicacionesCompletadas.length > 0 ? (
            radicacionesCompletadas.map((radicacion) => (
              <ProcesoCard
                key={radicacion.id}
                proceso={radicacion}
                tipoProceso="radicacion"
                esCompletado={true}
              />
            ))
          ) : (
            <EmptyState
              icon={ArrowDownToLine}
              titulo="No hay radicaciones completadas"
              descripcion="No se han completado procesos de radicación aún"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
