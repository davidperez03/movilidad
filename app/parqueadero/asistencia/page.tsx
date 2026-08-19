import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import AsistenciaClient from "./asistencia-client"

export default async function AsistenciaPage() {
  const { parqueadero, esSuperadmin } = await obtenerPermisosUsuario()
  const puedeEditar = esSuperadmin || parqueadero.configurar
  return <AsistenciaClient puedeEditar={puedeEditar} />
}
