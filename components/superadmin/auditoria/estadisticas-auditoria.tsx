'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Car, Users, Activity, Truck } from 'lucide-react'
import { useMemo } from 'react'
import type { RegistroAuditoria } from '@/app/superadmin/auditoria/auditoria-columns'
import { getTipoAccion } from '@/lib/hooks/useAuditoria'

interface EstadisticasAuditoriaProps {
  registros: RegistroAuditoria[]
  onFiltrarTipo: (tipo: string) => void
}

export function EstadisticasAuditoria({ registros, onFiltrarTipo }: EstadisticasAuditoriaProps) {
  const stats = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const accionesHoy = registros.filter((r) => r.creado_en.startsWith(hoy)).length

    const porTipo: Record<string, number> = {}
    for (const r of registros) {
      const tipo = getTipoAccion(r.accion)
      porTipo[tipo] = (porTipo[tipo] || 0) + 1
    }

    const loginsExitosos = registros.filter((r) => r.accion === 'login_exitoso').length
    const loginsFallidos = registros.filter((r) => r.accion === 'login_fallido').length

    const inspeccionesCreadas = registros.filter((r) => r.accion === 'parq_inspeccion_creada').length
    const novedadesSubsanadas = registros.filter((r) => r.accion === 'parq_novedad_subsanada').length

    return { accionesHoy, porTipo, loginsExitosos, loginsFallidos, inspeccionesCreadas, novedadesSubsanadas }
  }, [registros])

  const cards = [
    {
      title: 'Acciones Hoy',
      value: stats.accionesHoy,
      desc: `de ${registros.length} totales`,
      icon: Activity,
      color: 'text-blue-600',
      tipo: 'todos',
    },
    {
      title: 'Sesiones',
      value: stats.porTipo['sesion'] || 0,
      desc: `${stats.loginsExitosos} exitosos, ${stats.loginsFallidos} fallidos`,
      icon: LogIn,
      color: 'text-slate-600',
      tipo: 'sesion',
    },
    {
      title: 'Usuarios y Roles',
      value: (stats.porTipo['usuario'] || 0) + (stats.porTipo['rol'] || 0),
      desc: `${stats.porTipo['usuario'] || 0} usuarios, ${stats.porTipo['rol'] || 0} roles`,
      icon: Users,
      color: 'text-purple-600',
      tipo: 'usuario',
    },
    {
      title: 'Movilidad',
      value: stats.porTipo['movilidad'] || 0,
      desc: 'Cuentas, traslados, radicaciones',
      icon: Car,
      color: 'text-teal-600',
      tipo: 'movilidad',
    },
    {
      title: 'Parqueadero',
      value: stats.porTipo['parqueadero'] || 0,
      desc: `${stats.inspeccionesCreadas} inspecciones, ${stats.novedadesSubsanadas} subsanadas`,
      icon: Truck,
      color: 'text-cyan-600',
      tipo: 'parqueadero',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onFiltrarTipo(card.tipo)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
