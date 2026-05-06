import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavTabs, movilidadNavItems } from "@/components/movilidad/nav-tabs"
import { ModuleHeader } from "@/components/shared/module-header"
import { capitalizeName } from "@/lib/utils/capitalize"
import { obtenerLayoutData } from "@/lib/movilidad/server/layout-data"
import { MOVILIDAD_ROL_COLORS } from "@/lib/types/layout"

export const dynamic = "force-dynamic"

export default async function MovilidadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) redirect("/auth/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const esSuperAdmin = perfil?.rol_global === "superadmin"

  const { contadores, rolModulo, tieneParqueadero, tieneNunc } = await obtenerLayoutData(
    user.id,
    esSuperAdmin
  )

  if (!esSuperAdmin && rolModulo.codigo === "sin_rol") {
    redirect("/sin-acceso")
  }

  const nombreCapitalizado = capitalizeName(perfil?.nombre_completo) || perfil?.correo || ""

  return (
    <div className="min-h-screen bg-muted/30">
      <ModuleHeader
        title="Movilidad"
        subtitle="Traslados y Radicaciones"
        iconName="Car"
        iconBgClass="bg-primary/10"
        iconColorClass="text-primary"
        nombreCapitalizado={nombreCapitalizado}
        rolModulo={rolModulo}
        rolColors={MOVILIDAD_ROL_COLORS}
        esSuperAdmin={esSuperAdmin}
        otrosModulos={[
          ...(tieneParqueadero ? [{ href: "/parqueadero", label: "Parqueadero", descripcion: "Inspecciones de grúas", iconName: "Truck" }] : []),
          ...(tieneNunc        ? [{ href: "/nunc",        label: "Estudios NUNC", descripcion: "Sesiones de estudio externo", iconName: "Scale" }] : []),
        ]}
        mobileNavItems={movilidadNavItems}
        mobileUserInfo={{
          nombre: nombreCapitalizado,
          rol: rolModulo.nombre,
          rolColor: MOVILIDAD_ROL_COLORS[rolModulo.codigo] ?? MOVILIDAD_ROL_COLORS.sin_rol,
          esSuperAdmin,
          otrosModulos: [
            ...(tieneParqueadero ? [{ href: "/parqueadero", label: "Parqueadero", iconName: "Truck" }] : []),
            ...(tieneNunc        ? [{ href: "/nunc",        label: "Estudios NUNC", iconName: "Scale" }] : []),
          ],
        }}
      >
        <NavTabs
          trasladosActivos={contadores.trasladosActivos}
          radicacionesActivas={contadores.radicacionesActivas}
          novedadesPendientes={contadores.novedadesPendientes}
        />
      </ModuleHeader>

      <main
        id="main-content"
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-10"
        role="main"
      >
        {children}
      </main>
    </div>
  )
}
