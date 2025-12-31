'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShieldCheck, UserCheck, UserX, Activity, FileText } from 'lucide-react'
import type { DashboardStats } from '@/lib/hooks/useDashboardStats'

interface EstadisticasDashboardProps {
  stats: DashboardStats | null
}

export function EstadisticasDashboard({ stats }: EstadisticasDashboardProps) {
  return (
    <>
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/superadmin/usuarios" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsuarios || 0}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=activos" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.usuariosActivos || 0}</div>
              <p className="text-xs text-muted-foreground">Pueden iniciar sesión</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=inactivos" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.usuariosInactivos || 0}</div>
              <p className="text-xs text-muted-foreground">Desactivados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=superadmin" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.totalSuperadmins || 0}</div>
              <p className="text-xs text-muted-foreground">Acceso completo</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.sesionesActivas || 0}</div>
            <p className="text-xs text-muted-foreground">Conectados ahora</p>
          </CardContent>
        </Card>

        <Link href="/superadmin/auditoria" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acciones Hoy</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.totalAccionesHoy || 0}</div>
              <p className="text-xs text-muted-foreground">Actividad del día</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  )
}
