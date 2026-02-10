import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { TablaPersonal } from "@/components/parqueadero/personal/tabla-personal"
import { Users } from "lucide-react"

export default async function PersonalPage() {
  const supabase = await createClient()
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  // Obtener personal de parqueadero con datos de licencia
  const { data: personal, error } = await supabase
    .from("parq_vista_personal")
    .select("*")
    .order("nombre_completo")

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error cargando personal: {error.message}</p>
      </div>
    )
  }

  // Contar alertas de licencias (excluir auxiliares y admins que no requieren licencia)
  const personalConLicencia = personal?.filter(p => p.rol_codigo !== 'parq_auxiliar' && p.rol_codigo !== 'parq_administrador') || []
  const licenciasVencidas = personalConLicencia.filter(p => p.estado_licencia === 'vencido').length
  const licenciasPorVencer = personalConLicencia.filter(p => p.estado_licencia === 'por_vencer').length
  const sinDatosLicencia = personalConLicencia.filter(p => p.estado_licencia === 'sin_datos').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal</h1>
        <p className="text-muted-foreground">
          Gestión de operadores, auxiliares y datos de licencia
        </p>
      </div>

      {/* Resumen de licencias */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{personal?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total personal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={licenciasVencidas > 0 ? "border-red-300" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{licenciasVencidas}</p>
                <p className="text-sm text-muted-foreground">Licencias vencidas</p>
              </div>
              {licenciasVencidas > 0 && (
                <Badge variant="destructive">Alerta</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={licenciasPorVencer > 0 ? "border-orange-300" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{licenciasPorVencer}</p>
                <p className="text-sm text-muted-foreground">Por vencer (30 días)</p>
              </div>
              {licenciasPorVencer > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">Atención</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{sinDatosLicencia}</p>
                <p className="text-sm text-muted-foreground">Sin datos de licencia</p>
              </div>
              {sinDatosLicencia > 0 && (
                <Badge variant="secondary">Pendiente</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de personal */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Personal</CardTitle>
          <CardDescription>
            Operadores y auxiliares del módulo de parqueadero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TablaPersonal
            personal={personal || []}
            puedeEditar={permisos.gestionar_vehiculos}
          />
        </CardContent>
      </Card>
    </div>
  )
}
