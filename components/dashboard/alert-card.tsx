"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"

interface AlertItem {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  link?: string
  daysRemaining?: number
}

interface AlertCardProps {
  alerts: AlertItem[]
  title?: string
  emptyMessage?: string
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
    badge: "bg-red-600 text-white border-red-600",
    label: "Vencido",
  },
  warning: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    badge: "bg-orange-500 text-white border-orange-500",
    label: "Urgente",
  },
  info: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    badge: "bg-blue-500 text-white border-blue-500",
    label: "Próximo",
  },
}

function formatDaysRemaining(days: number, severity: string): string {
  if (severity === "critical") return "Vencido"
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `${days} días hábiles`
}

export function AlertCard({ alerts, title = "Alertas", emptyMessage = "No hay alertas" }: AlertCardProps) {
  const criticalCount = alerts.filter(a => a.severity === "critical").length
  const warningCount = alerts.filter(a => a.severity === "warning").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {title}
          </CardTitle>
          {alerts.length > 0 && (
            <div className="flex gap-1.5">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalCount} vencido{criticalCount > 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="text-xs bg-orange-500">
                  {warningCount} urgente{warningCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardDescription>Procesos que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon

              const content = (
                <div
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${config.bgColor}`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {alert.daysRemaining !== undefined && (
                      <Badge variant="outline" className={`text-xs ${config.badge}`}>
                        {formatDaysRemaining(alert.daysRemaining, alert.severity)}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )

              return alert.link ? (
                <Link key={alert.id} href={alert.link}>
                  {content}
                </Link>
              ) : (
                <div key={alert.id}>{content}</div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
