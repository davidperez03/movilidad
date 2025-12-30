"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRightLeft, ArrowDownToLine, Info } from "lucide-react"
import Link from "next/link"

interface ModalErrorSecuenciaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placa: string
  errorMessage: string
  procesoIntentado: "traslado" | "radicacion"
}

export function ModalErrorSecuencia({
  open,
  onOpenChange,
  placa,
  errorMessage,
  procesoIntentado,
}: ModalErrorSecuenciaProps) {
  // Determinar qué proceso debe hacer basado en el mensaje de error
  const debeTrasladar = errorMessage.includes("debe ser radicado") || errorMessage.includes("Debe ser radicado")
  const debeRadicar = errorMessage.includes("Debe ser trasladado") || errorMessage.includes("debe ser trasladado")

  const procesoRequerido = debeTrasladar ? "radicación" : debeRadicar ? "traslado" : null
  const ProcesoIcon = debeTrasladar ? ArrowDownToLine : debeRadicar ? ArrowRightLeft : AlertTriangle

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Secuencia de Proceso Incorrecta</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Explicación principal */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-900">
                  <strong>La placa {placa}</strong> no puede iniciar {" "}
                  {procesoIntentado === "traslado" ? "un traslado" : "una radicación"} en este momento.
                </p>
              </div>

              {/* Razón del error */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">¿Por qué?</p>
                    <p className="text-sm text-muted-foreground">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Próximo paso */}
              {procesoRequerido && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <ProcesoIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Próximo paso:</p>
                      <p className="text-sm text-muted-foreground">
                        Debes iniciar un proceso de{" "}
                        <strong className="text-foreground">{procesoRequerido}</strong>{" "}
                        para este vehículo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recordatorio de secuencia */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Recuerda:</strong> Los vehículos deben alternar entre traslados y radicaciones.
                  Si el último proceso fue un traslado, el siguiente debe ser una radicación, y viceversa.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Entendido
          </AlertDialogAction>
          {procesoRequerido && (
            <Button asChild variant="default">
              <Link
                href={`/movilidad/${procesoRequerido === "traslado" ? "traslados" : "radicaciones"}/nuev${procesoRequerido === "traslado" ? "o" : "a"}?placa=${placa}`}
                onClick={() => onOpenChange(false)}
              >
                <ProcesoIcon className="h-4 w-4 mr-2" />
                Iniciar {procesoRequerido === "traslado" ? "Traslado" : "Radicación"}
              </Link>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
