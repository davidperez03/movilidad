import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Car, Truck } from "lucide-react"
import { NavTabsParqueadero, parqueaderoNavItems } from "@/components/parqueadero/nav-tabs"
import { ModuleHeader } from "@/components/shared/module-header"
import { capitalizeName } from "@/lib/utils/capitalize"
import { obtenerLayoutData } from "@/lib/parqueadero/server/layout-data"

export const revalidate = 60

export default async function ParqueaderoLayout({
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
    const { data: rolParqueadero } = await supabase
      .from("usuarios_roles")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("modulo_id", "parqueadero")
      .single()

    if (!rolParqueadero) redirect("/sin-acceso")
  }

  const { contadores, rolModulo, rolColors, tieneMovilidad } = await obtenerLayoutData(
    user.id,
    esSuperAdmin
  )

  const nombreCapitalizado = capitalizeName(perfil?.nombre_completo) || perfil?.correo || ""

  return (
    <div className="min-h-screen bg-muted/30">
      <ModuleHeader
        title="Parqueadero"
        subtitle="Inspecciones de Grúas"
        icon={Truck}
        iconBgClass="bg-cyan-600/10"
        iconColorClass="text-cyan-600"
        nombreCapitalizado={nombreCapitalizado}
        rolModulo={rolModulo}
        rolColors={rolColors}
        esSuperAdmin={esSuperAdmin}
        otrosModulos={
          tieneMovilidad
            ? [{ href: "/movilidad", label: "Movilidad", icon: Car }]
            : []
        }
        mobileNavItems={parqueaderoNavItems}
        mobileUserInfo={{
          nombre: nombreCapitalizado,
          rol: rolModulo.nombre,
          rolColor: rolColors[rolModulo.codigo] ?? rolColors.sin_rol,
          esSuperAdmin,
          otrosModulos: tieneMovilidad
            ? [{ href: "/movilidad", label: "Movilidad", iconName: "Car" }]
            : [],
        }}
      >
        <NavTabsParqueadero
          inspeccionesHoy={contadores.inspeccionesHoy}
          vehiculosActivos={contadores.vehiculosActivos}
          alertasLicencias={contadores.alertasLicencias}
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
