'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { EstadisticasDashboard } from '@/components/superadmin/dashboard/estadisticas-dashboard'
import { ActividadReciente } from '@/components/superadmin/dashboard/actividad-reciente'

export default function DashboardPage() {
  const { stats, actividadReciente, loading } = useDashboardStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Panel de control y estadísticas del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/usuarios">
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      <EstadisticasDashboard stats={stats} />

      {/* Actividad reciente */}
      <ActividadReciente actividades={actividadReciente} />
    </div>
  )
}
