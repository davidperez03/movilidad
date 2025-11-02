"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, ExternalLink } from "lucide-react"
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
    bgColor: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700 border-red-300",
  },
  warning: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700 border-orange-300",
  },
  info: {
    icon: AlertTriangle,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
  },
}

export function AlertCard({ alerts, title = "Alertas", emptyMessage = "No hay alertas" }: AlertCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <CardDescription>Requieren atención inmediata</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${config.bgColor}`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.daysRemaining !== undefined && (
                        <Badge variant="outline" className={config.badge}>
                          {alert.daysRemaining === 0
                            ? "Hoy"
                            : alert.daysRemaining === 1
                              ? "Mañana"
                              : `${alert.daysRemaining}d`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    {alert.link && (
                      <Button asChild variant="link" size="sm" className="h-auto p-0 mt-2">
                        <Link href={alert.link}>
                          Ver detalles
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
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
