import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRightLeft, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcesoCard } from "@/components/movilidad/proceso-card"
import { EmptyState } from "@/components/shared/empty-state"

export default async function TrasladosPage() {
  const supabase = await createClient()

  // Obtener traslados activos
  const { data: trasladosActivos, error: errorActivos } = await supabase
    .from("mov_traslados")
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
      organismo:mov_organismos_transito!organismo_destino_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .not("estado", "in", "(trasladado,devuelto)")
    .order("creado_en", { ascending: false })

  if (errorActivos) {
  }

  // Obtener traslados completados
  const { data: trasladosCompletados } = await supabase
    .from("mov_traslados")
    .select(`
      *,
      cuenta:mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      creador:perfiles!creado_por (
        nombre_completo
      ),
      organismo:mov_organismos_transito!organismo_destino_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .in("estado", ["trasladado", "devuelto"])
    .order("fecha_completado", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Traslados</h1>
          <p className="text-muted-foreground">
            Gestiona los procesos de envío de vehículos
          </p>
        </div>
        <Button asChild>
          <Link href="/movilidad/traslados/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Traslado
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activos">
            Activos ({trasladosActivos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completados">
            Completados ({trasladosCompletados?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="space-y-4">
          {trasladosActivos && trasladosActivos.length > 0 ? (
            trasladosActivos.map((traslado) => (
              <ProcesoCard
                key={traslado.id}
                proceso={traslado}
                tipoProceso="traslado"
                esCompletado={false}
              />
            ))
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              titulo="No hay traslados activos"
              descripcion="No hay procesos de traslado en curso en este momento"
              accion={
                <Button asChild>
                  <Link href="/movilidad/traslados/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Iniciar Primer Traslado
                  </Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="completados" className="space-y-4">
          {trasladosCompletados && trasladosCompletados.length > 0 ? (
            trasladosCompletados.map((traslado) => (
              <ProcesoCard
                key={traslado.id}
                proceso={traslado}
                tipoProceso="traslado"
                esCompletado={true}
              />
            ))
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              titulo="No hay traslados completados"
              descripcion="No se han completado procesos de traslado aún"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
