import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrasladosTable } from "@/components/movilidad/traslados/traslados-table"

export default async function TrasladosPage() {
  const supabase = await createClient()

  // Obtener datos de vencimiento desde la vista
  const { data: vistaActivos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("proceso_id, dias_restantes")
    .eq("proceso_tipo", "traslado")

  // Crear mapa de proceso_id -> dias_restantes
  const diasPorProceso = new Map(
    vistaActivos?.map(v => [v.proceso_id, v.dias_restantes]) || []
  )

  // Obtener traslados activos con todos sus datos
  const { data: trasladosActivosRaw, error: errorActivos } = await supabase
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
      ),
      empresa_transporte:mov_empresas_transporte (
        id,
        nombre
      )
    `)
    .not("estado", "in", "(trasladado,devuelto)")
    .order("creado_en", { ascending: false })

  // Agregar días restantes a cada traslado
  const trasladosActivos = trasladosActivosRaw?.map(traslado => ({
    ...traslado,
    dias_restantes: diasPorProceso.get(traslado.id) ?? null
  }))

  if (errorActivos) {
  }

  // Obtener traslados completados
  const { data: trasladosCompletados } = await supabase
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
      ),
      empresa_transporte:mov_empresas_transporte (
        id,
        nombre
      )
    `)
    .in("estado", ["trasladado", "devuelto"])
    .order("fecha_completado", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Traslados</h1>
          <p className="text-muted-foreground">Gestión de traslados</p>
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

        <TabsContent value="activos">
          <Card>
            <CardContent className="pt-6">
              <TrasladosTable traslados={trasladosActivos || []} esCompletados={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completados">
          <Card>
            <CardContent className="pt-6">
              <TrasladosTable traslados={trasladosCompletados || []} esCompletados={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
