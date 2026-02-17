"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  value: string
  label: string
}

interface ProcessTimelineProps {
  tipo: "traslado" | "radicacion"
  estadoActual: string
  className?: string
}

// Flujo principal de traslados (orden cronológico)
const FLUJO_TRASLADO: TimelineStep[] = [
  { value: "sin_asignar", label: "Registrado" },
  { value: "revisado", label: "Revisado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "enviado_organismo", label: "Enviado" },
  { value: "trasladado", label: "Trasladado" },
]

// Flujo principal de radicaciones (orden cronológico)
const FLUJO_RADICACION: TimelineStep[] = [
  { value: "sin_asignar", label: "Registrado" },
  { value: "recibido", label: "Recibido" },
  { value: "revisado", label: "Revisado" },
  { value: "pendiente_radicar", label: "Pendiente" },
  { value: "radicado", label: "Radicado" },
]

// Estados especiales (no son parte del flujo lineal)
const ESTADOS_ESPECIALES = ["con_novedades", "enviado_devolucion", "devuelto"]

export function ProcessTimeline({ tipo, estadoActual, className }: ProcessTimelineProps) {
  const flujo = tipo === "traslado" ? FLUJO_TRASLADO : FLUJO_RADICACION
  const esEstadoEspecial = ESTADOS_ESPECIALES.includes(estadoActual)

  // Encontrar el índice del estado actual en el flujo
  const indiceActual = flujo.findIndex(step => step.value === estadoActual)

  // Si el estado es especial, mostrar solo el flujo sin alerta textual
  if (esEstadoEspecial) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 -translate-y-1/2">
            <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          <div className="relative flex justify-between">
            {flujo.map((step) => (
              <div key={step.value} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 mt-1.5 text-center max-w-[60px]">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Estado final completado
  const estadoFinal = tipo === "traslado" ? "trasladado" : "radicado"
  const estaCompletado = estadoActual === estadoFinal

  return (
    <div className={cn("space-y-2", className)}>
      {/* Contenedor principal con posicionamiento relativo */}
      <div className="relative">
        {/* Línea de fondo - centrada con los círculos */}
        <div className="absolute top-4 left-4 right-4 h-0.5 -translate-y-1/2">
          <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          {/* Línea de progreso */}
          <div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300"
            style={{
              width: indiceActual >= 0
                ? `${(indiceActual / (flujo.length - 1)) * 100}%`
                : '0%'
            }}
          />
        </div>

        {/* Pasos */}
        <div className="relative flex justify-between">
          {flujo.map((step, index) => {
            const isPast = index < indiceActual
            const isCurrent = index === indiceActual
            const isFuture = index > indiceActual

            return (
              <div key={step.value} className="flex flex-col items-center">
                {/* Círculo del paso */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white dark:bg-gray-900",
                  isPast && "bg-green-500",
                  isCurrent && !estaCompletado && "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900",
                  isCurrent && estaCompletado && "bg-green-500 ring-4 ring-green-100 dark:ring-green-900",
                  isFuture && "bg-gray-200 dark:bg-gray-700"
                )}>
                  {isPast || (isCurrent && estaCompletado) ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Circle className="w-3 h-3 text-white fill-white" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-400" />
                  )}
                </div>

                {/* Label del paso */}
                <span className={cn(
                  "text-xs mt-1.5 text-center max-w-[70px] font-medium",
                  isPast && "text-green-600 dark:text-green-400",
                  isCurrent && "text-blue-600 dark:text-blue-400",
                  isFuture && "text-gray-400"
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mensaje de estado completado */}
      {estaCompletado && (
        <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Proceso completado exitosamente
          </span>
        </div>
      )}
    </div>
  )
}
