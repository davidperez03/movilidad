"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eraser, Check, X } from "lucide-react"

interface CapturaFirmaProps {
  open: boolean
  onClose: () => void
  onSave: (firmaBase64: string) => void
  titulo: string
  descripcion?: string
}

export function CapturaFirma({
  open,
  onClose,
  onSave,
  titulo,
  descripcion,
}: CapturaFirmaProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const limpiar = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const guardar = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
      onSave(dataURL)
      onClose()
    }
  }

  const handleEnd = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty())
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && (
            <DialogDescription>{descripcion}</DialogDescription>
          )}
        </DialogHeader>

        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-48 rounded-lg",
              style: { width: "100%", height: "192px" },
            }}
            backgroundColor="white"
            penColor="black"
            onEnd={handleEnd}
          />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Firme en el recuadro de arriba
        </p>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={limpiar}
            className="flex-1 sm:flex-none"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={guardar}
            disabled={isEmpty}
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface VistaFirmaProps {
  firma: string | null
  label: string
  onCapturar?: () => void
  className?: string
}

export function VistaFirma({ firma, label, onCapturar, className }: VistaFirmaProps) {
  if (firma) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="border rounded-lg p-2 bg-white">
          <img
            src={firma}
            alt={label}
            className="max-h-20 mx-auto"
          />
        </div>
      </div>
    )
  }

  if (onCapturar) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <Button
          type="button"
          variant="outline"
          onClick={onCapturar}
          className="w-full h-20 border-dashed"
        >
          Toque para firmar
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="border rounded-lg p-4 bg-gray-50 text-center text-sm text-muted-foreground">
        Sin firma
      </div>
    </div>
  )
}
