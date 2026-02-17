// =====================================================
// REPORTE DE PROCESOS POR VENCER
// Página con tabla y exportación de procesos por vencer
// =====================================================

import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosPorVencer, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { obtenerNivelUrgenciaPorVencer } from '@/lib/movilidad/reportes/urgencia'
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

  // Calcular estadísticas con la misma regla de urgencia que usa la tabla
  const resumenUrgencia = datos.reduce(
    (acc, d) => {
      const nivel = obtenerNivelUrgenciaPorVencer(d.dias_restantes)
      if (nivel === 'vence_hoy') acc.venceHoy += 1
      if (nivel === 'alta') acc.urgentes += 1
      if (nivel === 'media') acc.medios += 1
      return acc
    },
    { venceHoy: 0, urgentes: 0, medios: 0 }
  )

  return (
    <ReporteWrapper
      titulo="Procesos por Vencer"
      descripcion="Reporte por vencer"
      tipoReporte="por-vencer"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaPorVencer}
      estadisticasItems={[
        {
          id: 'total-por-vencer',
          titulo: 'Total',
          valor: datos.length,
        },
        {
          id: 'vence-hoy',
          titulo: 'Vence hoy',
          valor: resumenUrgencia.venceHoy,
          claseContenedor: 'p-4 bg-red-50 rounded-lg border border-red-200',
          claseTitulo: 'text-sm text-red-700',
          claseValor: 'text-2xl font-bold text-red-700',
        },
        {
          id: 'urgencia-alta',
          titulo: 'Urgencia Alta',
          valor: resumenUrgencia.urgentes,
          claseContenedor: 'p-4 bg-orange-50 rounded-lg border border-orange-200',
          claseTitulo: 'text-sm text-orange-700',
          claseValor: 'text-2xl font-bold text-orange-700',
        },
        {
          id: 'urgencia-media',
          titulo: 'Urgencia Media',
          valor: resumenUrgencia.medios,
          claseContenedor: 'p-4 bg-yellow-50 rounded-lg border border-yellow-200',
          claseTitulo: 'text-sm text-yellow-700',
          claseValor: 'text-2xl font-bold text-yellow-700',
        },
      ]}
    />
  )
}
