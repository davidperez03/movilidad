import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { TablaInspecciones } from "@/components/parqueadero/inspecciones/tabla-inspecciones"

export default async function InspeccionesPage() {
  const supabase = await createClient()
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  const { data: inspecciones } = await supabase
    .from("parq_vista_inspecciones")
    .select("*")
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inspecciones</h1>
          <p className="text-muted-foreground">Registro de inspecciones de vehículos</p>
        </div>
        {permisos.crear_inspecciones && (
          <Button asChild>
            <Link href="/parqueadero/inspecciones/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Inspección
            </Link>
          </Button>
        )}
      </div>

      {/* Tabla */}
      <TablaInspecciones
        inspecciones={inspecciones || []}
        permisos={permisos}
      />
    </div>
  )
}
