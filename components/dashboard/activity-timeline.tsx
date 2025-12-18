"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowRightLeft, ArrowDownToLine, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  type: "cuenta_creada" | "traslado_iniciado" | "radicacion_iniciada" | "estado_cambiado" | "novedad_agregada"
  title: string
  description: string
  timestamp: string
  metadata?: {
    placa?: string
    estado?: string
  }
}

interface ActivityTimelineProps {
  activities: TimelineItem[]
  title?: string
  emptyMessage?: string
}

const typeConfig = {
  cuenta_creada: {
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  traslado_iniciado: {
    icon: ArrowRightLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  radicacion_iniciada: {
    icon: ArrowDownToLine,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  estado_cambiado: {
    icon: CheckCircle2,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  novedad_agregada: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
}

export function ActivityTimeline({
  activities,
  title = "Actividad Reciente",
  emptyMessage = "No hay actividad reciente",
}: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = typeConfig[activity.type]
              const Icon = config.icon
              const isLast = index === activities.length - 1

              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn("rounded-full p-2", config.bgColor)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    {!isLast && <div className="w-px h-full bg-border mt-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        {activity.metadata && (
                          <div className="flex gap-2 mt-2">
                            {activity.metadata.placa && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {activity.metadata.placa}
                              </span>
                            )}
                            {activity.metadata.estado && (
                              <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                                {activity.metadata.estado.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
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

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}
