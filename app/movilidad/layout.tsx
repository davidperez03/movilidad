import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Car, Truck } from "lucide-react"
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
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const esSuperAdmin = perfil?.rol_global === "superadmin"

  if (!esSuperAdmin) {
    const { data: rolMovilidad } = await supabase
      .from("usuarios_roles")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("modulo_id", "movilidad")
      .single()

    if (!rolMovilidad) redirect("/sin-acceso")
  }

  const { contadores, rolModulo, tieneParqueadero } = await obtenerLayoutData(
    user.id,
    esSuperAdmin
  )

  const nombreCapitalizado = capitalizeName(perfil?.nombre_completo) || perfil?.correo || ""

  return (
    <div className="min-h-screen bg-muted/30">
      <ModuleHeader
        title="Movilidad"
        subtitle="Traslados y Radicaciones"
        icon={Car}
        iconBgClass="bg-primary/10"
        iconColorClass="text-primary"
        nombreCapitalizado={nombreCapitalizado}
        rolModulo={rolModulo}
        rolColors={MOVILIDAD_ROL_COLORS}
        esSuperAdmin={esSuperAdmin}
        otrosModulos={
          tieneParqueadero
            ? [{ href: "/parqueadero", label: "Parqueadero", icon: Truck }]
            : []
        }
        mobileNavItems={movilidadNavItems}
        mobileUserInfo={{
          nombre: nombreCapitalizado,
          rol: rolModulo.nombre,
          rolColor: MOVILIDAD_ROL_COLORS[rolModulo.codigo] ?? MOVILIDAD_ROL_COLORS.sin_rol,
          esSuperAdmin,
          otrosModulos: tieneParqueadero
            ? [{ href: "/parqueadero", label: "Parqueadero", iconName: "Truck" }]
            : [],
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
        className="container mx-auto px-3 sm:px-4 py-6 sm:py-8"
        role="main"
      >
        {children}
      </main>
    </div>
  )
}
