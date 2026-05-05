import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosActivos, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { ReporteWrapper } from '@/components/movilidad/reportes/reporte-wrapper'
import { TablaActivos } from '@/components/movilidad/reportes/tabla-activos'

export default async function ReporteActivosPage() {
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  const [datos, organismos, responsables] = await Promise.all([
    obtenerDatosActivos(FILTROS_INICIALES),
    obtenerOrganismos(),
    obtenerResponsables(),
  ])

  return (
    <ReporteWrapper
      titulo="Procesos Activos"
      descripcion="Reporte de activos"
      tipoReporte="activos"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaActivos}
    />
  )
}
