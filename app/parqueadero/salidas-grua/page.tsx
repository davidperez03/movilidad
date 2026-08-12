import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import SalidasGruaClient from './salidas-grua-client'

export default async function SalidasGruaPage() {
  const { parqueadero, esSuperadmin } = await obtenerPermisosUsuario()
  const puedeEditar = esSuperadmin || parqueadero.configurar

  return <SalidasGruaClient puedeEditar={puedeEditar} />
}
