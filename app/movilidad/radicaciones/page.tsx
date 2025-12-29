import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadicacionesTable } from "@/components/movilidad/radicaciones/radicaciones-table"

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
    .limit(50)

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
