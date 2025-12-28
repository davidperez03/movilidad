// =====================================================
// REPORTE DE PROCESOS ACTIVOS
// Página con tabla y exportación de procesos activos
// =====================================================

import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosActivos, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { ReporteWrapper } from '@/components/movilidad/reportes/reporte-wrapper'
import { TablaActivos } from '@/components/movilidad/reportes/tabla-activos'

export default async function ReporteActivosPage() {
  // Verificar permisos
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  // Obtener datos
  const [datos, organismos, responsables] = await Promise.all([
    obtenerDatosActivos(FILTROS_INICIALES),
    obtenerOrganismos(),
    obtenerResponsables(),
  ])

  return (
    <ReporteWrapper
      titulo="Procesos Activos"
      descripcion="Traslados y radicaciones en curso"
      tipoReporte="activos"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaActivos}
    />
  )
}
