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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Generación de reportes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CardTipoReporte
          icono={Activity}
          titulo="Activos"
          descripcion="Procesos en curso"
          href="/movilidad/reportes/activos"
          contador={contadores.activos}
          color="blue"
        />
        <CardTipoReporte
          icono={CheckCircle}
          titulo="Completados"
          descripcion="Procesos finalizados"
          href="/movilidad/reportes/completados"
          contador={contadores.completados}
          color="green"
        />
        <CardTipoReporte
          icono={Clock}
          titulo="Por Vencer"
          descripcion="Próximos a vencer"
          href="/movilidad/reportes/por-vencer"
          contador={contadores.porVencer}
          color="orange"
        />
      </div>
    </div>
  )
}
