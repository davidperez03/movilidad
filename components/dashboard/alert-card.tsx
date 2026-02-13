"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
    bgColor: "bg-red-100",
  },
  warning: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  info: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
}

function formatDaysRemaining(days: number, severity: string): string {
  if (severity === "critical") return days === 1 ? "Vencido hace 1 día" : `Vencido hace ${days} días`
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `${days} días`
}

export function AlertCard({ alerts, title = "Alertas", emptyMessage = "No hay alertas" }: AlertCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <CardDescription>Procesos que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon
              const isLast = index === alerts.length - 1

              const content = (
                <div className="flex gap-4">
                  {/* Icon column */}
                  <div className="flex flex-col items-center">
                    <div className={cn("rounded-full p-2", config.bgColor)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    {!isLast && <div className="w-px h-full bg-border mt-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {alert.daysRemaining !== undefined && (
                          <span className={cn("text-xs font-medium whitespace-nowrap", config.color)}>
                            {formatDaysRemaining(alert.daysRemaining, alert.severity)}
                          </span>
                        )}
                        {alert.link && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                </div>
              )

              return alert.link ? (
                <Link key={alert.id} href={alert.link} className="block hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors">
                  {content}
                </Link>
              ) : (
                <div key={alert.id}>{content}</div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
