import { createClient } from "@/lib/supabase/server"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Scale, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatearFechaHora } from "@/lib/parqueadero/utils"

function estadoBadge(estado: string) {
  if (estado === "activa") return <Badge className="bg-green-100 text-green-700 border-green-200">Activa</Badge>
  if (estado === "cerrada") return <Badge variant="secondary">Cerrada</Badge>
  return <Badge variant="destructive">Expirada</Badge>
}

export default async function NuncAdminPage() {
  const { movilidad: permisos, esSuperadmin } = await obtenerPermisosUsuario()
  if (!esSuperadmin && !permisos.ver) redirect("/sin-acceso")

  const supabase = await createClient()
  const { data: sesiones } = await supabase
    .from("nunc_sesiones")
    .select(`
      id, codigo, entidad_nombre, nombre_peritos, estado, expira_en, creado_en,
      generado_por_perfil:perfiles!generado_por(nombre_completo),
      registros:nunc_registros(count)
    `)
    .order("creado_en", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Peritajes
          </h1>
          <p className="text-muted-foreground">Sesiones de nunc externo</p>
        </div>
        {permisos.configurar && (
          <Button asChild>
            <Link href="/nunc/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva sesión
            </Link>
          </Button>
        )}
      </div>

      {!sesiones || sesiones.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Scale className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Sin sesiones de nunc</p>
            <p className="text-sm text-muted-foreground">Las sesiones generadas aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sesiones.map((s) => {
            const totalRegistros = Array.isArray(s.registros) && s.registros.length > 0
              ? (s.registros[0] as { count: number }).count
              : 0
            const perfil = s.generado_por_perfil as unknown as { nombre_completo: string } | null

            return (
              <Link key={s.id} href={`/nunc/${s.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {s.estado === "activa"
                            ? <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                            : s.estado === "cerrada"
                            ? <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          }
                          <span className="font-mono font-bold text-base">{s.codigo}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.entidad_nombre}</p>
                          <p className="text-sm text-muted-foreground truncate">{s.nombre_peritos}</p>
                          {perfil?.nombre_completo && (
                            <p className="text-xs text-muted-foreground truncate">Creada por {perfil.nombre_completo}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">{totalRegistros} vehículo{totalRegistros !== 1 ? "s" : ""}</p>
                          <p className="text-xs text-muted-foreground">{formatearFechaHora(s.creado_en)}</p>
                        </div>
                        {estadoBadge(s.estado)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
