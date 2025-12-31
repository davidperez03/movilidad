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
import { AlertTriangle } from "lucide-react"

interface ModalProcesoActivoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placa: string
  razon: string
}

export function ModalProcesoActivo({
  open,
  onOpenChange,
  placa,
  razon,
}: ModalProcesoActivoProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Vehículo con Proceso Activo</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              <p className="text-base">
                La placa <span className="font-semibold">{placa}</span> ya tiene un proceso en curso.
              </p>
              <p className="text-sm text-muted-foreground">
                {razon}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
