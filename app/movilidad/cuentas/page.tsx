import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search } from "lucide-react"
import { BotonNuevaCuenta } from "@/components/movilidad/cuentas-acciones"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { CuentasTable } from "@/components/movilidad/cuentas/cuentas-table"

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.q || ""

  // Obtener permisos del usuario en el servidor
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  // Construir consulta con búsqueda
  let cuentasQuery = supabase
    .from("mov_cuentas_vehiculos")
    .select(`
      *,
      creador:perfiles!creado_por (
        nombre_completo,
        correo
      )
    `)
    .order("creado_en", { ascending: false })

  // Aplicar filtro de búsqueda si existe
  if (query) {
    cuentasQuery = cuentasQuery.or(`placa.ilike.%${query}%,numero_cuenta.ilike.%${query}%`)
  }

  const { data: cuentas, error } = await cuentasQuery

  if (error) {
  }

  // Obtener último proceso completado de todas las cuentas
  const { data: ultimosCompletados } = await supabase.rpc('obtener_ultimos_procesos_completados')

  // Obtener procesos activos para cada cuenta
  const cuentasConProcesos = await Promise.all(
    (cuentas || []).map(async (cuenta) => {
      const { data: procesoActivo } = await supabase
        .from("mov_vista_proceso_activo")
        .select("*")
        .eq("cuenta_id", cuenta.id)
        .single()

      const ultimoCompletado = (ultimosCompletados as any[] | null)?.find((uc: any) => uc.cuenta_id === cuenta.id)

      return {
        ...cuenta,
        procesoActivo,
        ultimo_proceso_completado: ultimoCompletado || null,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas de Vehículos</h1>
          <p className="text-muted-foreground">
            Gestiona todas las cuentas de vehículos registradas
          </p>
        </div>
        <BotonNuevaCuenta permisos={permisos} />
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por placa o número de cuenta..."
                defaultValue={query}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
            {query && (
              <Button type="button" variant="outline" asChild>
                <Link href="/movilidad/cuentas">Limpiar</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Tabla de cuentas */}
      <Card>
        <CardContent className="pt-6">
          <CuentasTable cuentas={cuentasConProcesos || []} permisos={permisos} />
        </CardContent>
      </Card>
    </div>
  )
}
