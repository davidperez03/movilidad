import { redirect } from 'next/navigation'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerDatosVencidos, obtenerOrganismos, obtenerResponsables } from '@/lib/movilidad/reportes/queries'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import { ReporteWrapper } from '@/components/movilidad/reportes/reporte-wrapper'
import { TablaVencidos } from '@/components/movilidad/reportes/tabla-vencidos'

export default async function ReporteVencidosPage() {
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  const [datos, organismos, responsables] = await Promise.all([
    obtenerDatosVencidos(FILTROS_INICIALES),
    obtenerOrganismos(),
    obtenerResponsables(),
  ])

  const vencidosRecientes = datos.filter((d) => d.dias_vencidos >= 1 && d.dias_vencidos <= 2).length
  const vencidosUltimos7 = datos.filter((d) => d.dias_vencidos >= 3 && d.dias_vencidos <= 7).length
  const vencidosMasDe7 = datos.filter((d) => d.dias_vencidos > 7).length

  return (
    <ReporteWrapper
      titulo="Procesos Vencidos"
      descripcion="Vista especializada de procesos vencidos"
      tipoReporte="vencidos"
      datos={datos}
      organismos={organismos}
      responsables={responsables}
      tablaComponent={TablaVencidos}
      estadisticasItems={[
        {
          id: 'total-vencidos',
          titulo: 'Total vencidos',
          valor: datos.length,
        },
        {
          id: 'vencidos-1-2',
          titulo: '1 a 2 días',
          valor: vencidosRecientes,
          claseContenedor: 'p-4 bg-red-50 rounded-lg border border-red-200',
          claseTitulo: 'text-sm text-red-700',
          claseValor: 'text-2xl font-bold text-red-700',
        },
        {
          id: 'vencidos-3-7',
          titulo: '3 a 7 días',
          valor: vencidosUltimos7,
          claseContenedor: 'p-4 bg-orange-50 rounded-lg border border-orange-200',
          claseTitulo: 'text-sm text-orange-700',
          claseValor: 'text-2xl font-bold text-orange-700',
        },
        {
          id: 'vencidos-mas-7',
          titulo: 'Más de 7 días',
          valor: vencidosMasDe7,
          claseContenedor: 'p-4 bg-amber-50 rounded-lg border border-amber-200',
          claseTitulo: 'text-sm text-amber-700',
          claseValor: 'text-2xl font-bold text-amber-700',
        },
      ]}
    />
  )
}
