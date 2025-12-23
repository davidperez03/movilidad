import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Car, Search, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDateLong } from "@/lib/utils"
import { BotonNuevaCuenta, BotonesIniciarProceso } from "@/components/movilidad/cuentas-acciones"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"

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

  // Obtener procesos activos para cada cuenta
  const cuentasConProcesos = await Promise.all(
    (cuentas || []).map(async (cuenta) => {
      const { data: procesoActivo } = await supabase
        .from("mov_vista_proceso_activo")
        .select("*")
        .eq("cuenta_id", cuenta.id)
        .single()

      return {
        ...cuenta,
        procesoActivo,
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

      {/* Listado de cuentas */}
      <div className="grid gap-4">
        {cuentasConProcesos && cuentasConProcesos.length > 0 ? (
          cuentasConProcesos.map((cuenta) => (
            <Card key={cuenta.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      {cuenta.placa}
                    </CardTitle>
                    <CardDescription>
                      Cuenta: {cuenta.numero_cuenta}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {cuenta.tipo_servicio === "particular" && "Particular"}
                      {cuenta.tipo_servicio === "publico" && "Público"}
                      {cuenta.tipo_servicio === "otro" && "Otro"}
                    </Badge>
                    {cuenta.procesoActivo?.proceso_tipo && (
                      <Badge
                        variant={
                          cuenta.procesoActivo.proceso_estado === "con_novedades"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {cuenta.procesoActivo.proceso_tipo === "traslado"
                          ? "Traslado Activo"
                          : "Radicación Activa"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Creado por</p>
                    <p className="font-medium">
                      {cuenta.creador?.nombre_completo || "Sin información"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de creación</p>
                    <p className="font-medium">
                      {formatDateLong(cuenta.creado_en)}
                    </p>
                  </div>
                  {cuenta.procesoActivo?.proceso_tipo && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {cuenta.procesoActivo.proceso_tipo === "traslado"
                            ? "Organismo destino"
                            : "Organismo origen"}
                        </p>
                        <p className="font-medium">
                          {cuenta.procesoActivo.ciudad}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado del proceso</p>
                        <p className="font-medium capitalize">
                          {cuenta.procesoActivo.proceso_estado?.replace(/_/g, " ")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/movilidad/vehiculos/${cuenta.placa}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </Button>
                  {!cuenta.procesoActivo?.proceso_tipo && (
                    <BotonesIniciarProceso placa={cuenta.placa} permisos={permisos} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron cuentas</p>
              <p className="text-muted-foreground mb-4">
                {query
                  ? "No hay cuentas que coincidan con tu búsqueda"
                  : "Aún no hay cuentas registradas en el sistema"}
              </p>
              {!query && <BotonNuevaCuenta permisos={permisos} />}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
