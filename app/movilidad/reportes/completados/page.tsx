// =====================================================
// REPORTE DE PROCESOS COMPLETADOS
// Página con tabla y exportación de procesos completados
// =====================================================

import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosCompletados, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { ReporteWrapper } from '@/components/movilidad/reportes/reporte-wrapper'
import { TablaCompletados } from '@/components/movilidad/reportes/tabla-completados'

export default async function ReporteCompletadosPage() {
  // Verificar permisos
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  // Obtener datos
  const [datos, organismos, responsables] = await Promise.all([
    obtenerDatosCompletados(FILTROS_INICIALES),
    obtenerOrganismos(),
    obtenerResponsables(),
  ])

  return (
    <ReporteWrapper
      titulo="Procesos Completados"
      descripcion="Histórico de procesos finalizados"
      tipoReporte="completados"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaCompletados}
    />
  )
}
