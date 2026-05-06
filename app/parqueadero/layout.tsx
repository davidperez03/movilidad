import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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

  const { contadores, rolModulo, rolColors, tieneMovilidad, tieneNunc } = await obtenerLayoutData(
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
        title="Parqueadero"
        subtitle="Inspecciones de Grúas"
        iconName="Truck"
        iconBgClass="bg-cyan-600/10"
        iconColorClass="text-cyan-600"
        nombreCapitalizado={nombreCapitalizado}
        rolModulo={rolModulo}
        rolColors={rolColors}
        esSuperAdmin={esSuperAdmin}
        otrosModulos={[
          ...(tieneMovilidad ? [{ href: "/movilidad", label: "Movilidad",      descripcion: "Traslados y radicaciones",   iconName: "Car"   }] : []),
          ...(tieneNunc      ? [{ href: "/nunc",      label: "Estudios NUNC",  descripcion: "Sesiones de estudio externo", iconName: "Scale" }] : []),
        ]}
        mobileNavItems={parqueaderoNavItems}
        mobileUserInfo={{
          nombre: nombreCapitalizado,
          rol: rolModulo.nombre,
          rolColor: rolColors[rolModulo.codigo] ?? rolColors.sin_rol,
          esSuperAdmin,
          otrosModulos: [
            ...(tieneMovilidad ? [{ href: "/movilidad", label: "Movilidad",     iconName: "Car"   }] : []),
            ...(tieneNunc      ? [{ href: "/nunc",      label: "Estudios NUNC", iconName: "Scale" }] : []),
          ],
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
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-10"
        role="main"
      >
        {children}
      </main>
    </div>
  )
}
