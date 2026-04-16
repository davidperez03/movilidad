'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Car, Users, Activity, Truck, AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'
import type { RegistroAuditoria } from '@/app/superadmin/auditoria/auditoria-columns'
import { getTipoAccion } from '@/lib/hooks/useAuditoria'

interface EstadisticasAuditoriaProps {
  registros: RegistroAuditoria[]
  onFiltrarTipo: (tipo: string) => void
  onFiltrarQuick?: (quick: string) => void
}

/** Devuelve YYYY-MM-DD en hora local del navegador (no UTC) */
function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EstadisticasAuditoria({ registros, onFiltrarTipo, onFiltrarQuick }: EstadisticasAuditoriaProps) {
  const stats = useMemo(() => {
    const hoy = fechaLocal(new Date())
    const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7); hace7.setHours(0, 0, 0, 0)

    const registrosHoy     = registros.filter((r) => fechaLocal(new Date(r.creado_en)) === hoy)
    const recientes        = registros.filter((r) => new Date(r.creado_en) >= hace7)

    const loginsExitosos   = recientes.filter((r) => r.accion === 'login_exitoso').length
    const loginsFallidos   = recientes.filter((r) => r.accion === 'login_fallido').length
    const inspecciones     = recientes.filter((r) => r.accion === 'parq_inspeccion_creada').length
    const subsanadas       = recientes.filter((r) => r.accion === 'parq_novedad_subsanada').length
    const usuarios7d       = recientes.filter((r) => getTipoAccion(r.accion) === 'usuario').length
    const roles7d          = recientes.filter((r) => getTipoAccion(r.accion) === 'rol').length
    const movilidad7d      = recientes.filter((r) => getTipoAccion(r.accion) === 'movilidad').length

    return {
      accionesHoy: registrosHoy.length,
      sesiones7d: loginsExitosos + loginsFallidos,
      loginsExitosos,
      loginsFallidos,
      usuariosRoles7d: usuarios7d + roles7d,
      usuarios7d,
      roles7d,
      movilidad7d,
      parqueadero7d: inspecciones + subsanadas,
      inspecciones,
      subsanadas,
    }
  }, [registros])

  const cards = [
    {
      title: 'Hoy',
      value: stats.accionesHoy,
      desc: 'Acciones registradas hoy',
      icon: Activity,
      color: 'text-blue-600',
      onClick: () => onFiltrarQuick?.('hoy'),
    },
    {
      title: 'Sesiones · 7 días',
      value: stats.sesiones7d,
      desc: `${stats.loginsExitosos} exitosos · ${stats.loginsFallidos} fallidos`,
      icon: LogIn,
      color: stats.loginsFallidos > 5 ? 'text-orange-500' : 'text-slate-600',
      onClick: () => onFiltrarTipo('sesion'),
      alert: stats.loginsFallidos > 5,
    },
    {
      title: 'Usuarios · 7 días',
      value: stats.usuariosRoles7d,
      desc: `${stats.usuarios7d} en usuarios · ${stats.roles7d} en roles`,
      icon: Users,
      color: 'text-purple-600',
      onClick: () => onFiltrarTipo('usuario'),
    },
    {
      title: 'Movilidad · 7 días',
      value: stats.movilidad7d,
      desc: 'Cuentas, traslados, radicaciones',
      icon: Car,
      color: 'text-teal-600',
      onClick: () => onFiltrarTipo('movilidad'),
    },
    {
      title: 'Parqueadero · 7 días',
      value: stats.parqueadero7d,
      desc: `${stats.inspecciones} inspecciones · ${stats.subsanadas} subsanadas`,
      icon: Truck,
      color: 'text-cyan-600',
      onClick: () => onFiltrarTipo('parqueadero'),
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
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-tight">{card.title}</CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                {card.alert && <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString('es-CO')}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
