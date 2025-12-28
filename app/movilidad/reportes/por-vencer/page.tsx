// =====================================================
// REPORTE DE PROCESOS POR VENCER
// Página con tabla y exportación de procesos por vencer
// =====================================================

import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosPorVencer, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { ReporteWrapper } from '@/components/movilidad/reportes/reporte-wrapper'
import { TablaPorVencer } from '@/components/movilidad/reportes/tabla-por-vencer'

export default async function ReportePorVencerPage() {
  // Verificar permisos
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  // Obtener datos
  const [datos, organismos, responsables] = await Promise.all([
    obtenerDatosPorVencer(FILTROS_INICIALES),
    obtenerOrganismos(),
    obtenerResponsables(),
  ])

  // Calcular estadísticas
  const vencidos = datos.filter((d) => d.dias_restantes < 0).length
  const urgentes = datos.filter((d) => d.dias_restantes >= 0 && d.dias_restantes <= 2).length
  const medios = datos.filter((d) => d.dias_restantes > 2 && d.dias_restantes <= 7).length

  const estadisticas = (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold">{datos.length}</p>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-700">Vencidos</p>
        <p className="text-2xl font-bold text-red-700">{vencidos}</p>
      </div>
      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <p className="text-sm text-orange-700">Urgencia Alta</p>
        <p className="text-2xl font-bold text-orange-700">{urgentes}</p>
      </div>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-700">Urgencia Media</p>
        <p className="text-2xl font-bold text-yellow-700">{medios}</p>
      </div>
    </div>
  )

  return (
    <ReporteWrapper
      titulo="Procesos por Vencer"
      descripcion="Alertas de vencimientos próximos"
      tipoReporte="por-vencer"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaPorVencer}
      estadisticasComponent={estadisticas}
    />
  )
}
