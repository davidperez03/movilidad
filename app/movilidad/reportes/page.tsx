// =====================================================
// DASHBOARD PRINCIPAL DE REPORTES
// Página con cards que enlazan a cada tipo de reporte
// =====================================================

import { redirect } from 'next/navigation'
import { Activity, CheckCircle, Clock } from 'lucide-react'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { obtenerContadores } from '@/lib/movilidad/reportes/queries'
import { CardTipoReporte } from '@/components/movilidad/reportes/card-tipo-reporte'

export default async function ReportesPage() {
  // Verificar permisos
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  if (!permisos.ver) {
    redirect('/sin-acceso')
  }

  // Obtener contadores
  const contadores = await obtenerContadores()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reportes de Movilidad</h1>
        <p className="text-muted-foreground mt-2">
          Analiza y exporta datos de procesos activos, completados y próximos a vencer
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <CardTipoReporte
          icono={Activity}
          titulo="Procesos Activos"
          descripcion="Traslados y radicaciones en curso"
          href="/movilidad/reportes/activos"
          contador={contadores.activos}
          color="blue"
        />

        <CardTipoReporte
          icono={CheckCircle}
          titulo="Procesos Completados"
          descripcion="Histórico de procesos finalizados"
          href="/movilidad/reportes/completados"
          contador={contadores.completados}
          color="green"
        />

        <CardTipoReporte
          icono={Clock}
          titulo="Procesos por Vencer"
          descripcion="Alertas de vencimientos próximos (7 días)"
          href="/movilidad/reportes/por-vencer"
          contador={contadores.porVencer}
          color="orange"
        />
      </div>

      {/* Nota informativa */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Los contadores mostrados representan el número de registros disponibles en cada reporte
          según los criterios predefinidos.
        </p>
      </div>
    </div>
  )
}
