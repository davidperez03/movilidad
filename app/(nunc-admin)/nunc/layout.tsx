import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ModuleHeader } from "@/components/shared/module-header"
import { NavTabsNunc, nuncNavItems } from "@/components/nunc/nav-tabs"
import { capitalizeName } from "@/lib/utils/capitalize"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { NUNC_ROL_COLORS } from "@/lib/types/layout"

export const dynamic = "force-dynamic"

function obtenerRolVisual(esSuperadmin: boolean, puedeConfigurar: boolean) {
  if (esSuperadmin) return { codigo: "superadmin", nombre: "Superadmin" }
  if (puedeConfigurar) return { codigo: "nunc_admin", nombre: "Administrador" }
  return { codigo: "nunc_operador", nombre: "Operador" }
}

export default async function NuncAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("correo, nombre_completo, rol_global")
    .eq("id", user.id)
    .single()

  const { nunc, movilidad, parqueadero, esSuperadmin } = await obtenerPermisosUsuario()
  if (!esSuperadmin && !nunc.ver) redirect("/sin-acceso")

  const nombreCapitalizado = capitalizeName(perfil?.nombre_completo) || perfil?.correo || ""
  const rolModulo = obtenerRolVisual(esSuperadmin, nunc.configurar)

  return (
    <div className="min-h-screen bg-muted/30">
      <ModuleHeader
        title="NUNC"
        subtitle="Sesiones externas"
        iconName="Scale"
        iconBgClass="bg-amber-500/10"
        iconColorClass="text-amber-600"
        nombreCapitalizado={nombreCapitalizado}
        rolModulo={rolModulo}
        rolColors={NUNC_ROL_COLORS}
        esSuperAdmin={esSuperadmin}
        otrosModulos={[
          ...(movilidad.ver ? [{ href: "/movilidad", label: "Movilidad", descripcion: "Traslados y radicaciones", iconName: "Car" }] : []),
          ...(parqueadero.ver ? [{ href: "/parqueadero", label: "Parqueadero", descripcion: "Inspecciones de grúas", iconName: "Truck" }] : []),
        ]}
        mobileNavItems={nuncNavItems}
        mobileUserInfo={{
          nombre: nombreCapitalizado,
          rol: rolModulo.nombre,
          rolColor: NUNC_ROL_COLORS[rolModulo.codigo] ?? NUNC_ROL_COLORS.sin_rol,
          esSuperAdmin: esSuperadmin,
          otrosModulos: [
            ...(movilidad.ver ? [{ href: "/movilidad", label: "Movilidad", iconName: "Car" }] : []),
            ...(parqueadero.ver ? [{ href: "/parqueadero", label: "Parqueadero", iconName: "Truck" }] : []),
          ],
        }}
      >
        <NavTabsNunc />
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
