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
import { AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { AlertBox } from "@/components/ui/alert-box"

interface ModalCuentaExistenteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placa: string
  numeroCuenta: string
}

export function ModalCuentaExistente({
  open,
  onOpenChange,
  placa,
  numeroCuenta,
}: ModalCuentaExistenteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Cuenta Ya Existe</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Mensaje principal */}
              <AlertBox variant="orange" showIcon={false}>
                La placa <strong>{placa}</strong> ya está registrada en el sistema.
              </AlertBox>

              {/* Información de la cuenta */}
              <AlertBox variant="info" showIcon={false}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Placa:</span>
                    <span>{placa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Número de Cuenta:</span>
                    <span className="font-mono">{numeroCuenta}</span>
                  </div>
                </div>
              </AlertBox>

              {/* Sugerencia */}
              <div className="text-sm text-muted-foreground">
                <p>
                  No es posible crear una cuenta duplicada. Si deseas ver o modificar la información
                  de este vehículo, puedes acceder a sus detalles.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Cerrar
          </AlertDialogAction>
          <Button asChild variant="default">
            <Link
              href={`/movilidad/vehiculos/${placa}`}
              onClick={() => onOpenChange(false)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Detalles
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
