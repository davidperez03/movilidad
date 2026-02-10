"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera, Upload, X, Loader2, Trash2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface CapturaFotoProps {
  open: boolean
  onClose: () => void
  onSave: (url: string) => void
  titulo: string
  descripcion?: string
  carpeta?: string // Subcarpeta en el bucket
}

export function CapturaFoto({
  open,
  onClose,
  onSave,
  titulo,
  descripcion,
  carpeta = "inspecciones",
}: CapturaFotoProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar tamaño (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede superar 5MB")
        return
      }

      // Validar tipo
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Solo se permiten imágenes")
        return
      }

      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const limpiar = () => {
    setFile(null)
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const guardar = async () => {
    if (!file) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const extension = file.name.split(".").pop() || "jpg"
      const nombreArchivo = `${carpeta}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("parqueadero")
        .upload(nombreArchivo, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        throw error
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("parqueadero")
        .getPublicUrl(data.path)

      onSave(urlData.publicUrl)
      limpiar()
      onClose()
      toast.success("Foto guardada")
    } catch (error) {
      console.error("Error al subir foto:", error)
      toast.error(error instanceof Error ? error.message : "Error al subir la foto")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    limpiar()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && (
            <DialogDescription>{descripcion}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full h-48 object-contain rounded-lg border bg-gray-50"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={limpiar}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                Toque para tomar foto o seleccionar imagen
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 5MB
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {!preview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {preview && (
            <Button
              type="button"
              onClick={guardar}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {loading ? "Subiendo..." : "Guardar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface VistaFotoProps {
  url: string | null
  onCapturar?: () => void
  onEliminar?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VistaFoto({ url, onCapturar, onEliminar, className, size = "md" }: VistaFotoProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  if (url) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img
          src={url}
          alt="Evidencia"
          className={`${sizeClasses[size]} object-cover rounded-lg border`}
        />
        {onEliminar && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onEliminar}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  if (onCapturar) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onCapturar}
        className={`${sizeClasses[size]} border-dashed ${className}`}
      >
        <Camera className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className={`${sizeClasses[size]} border rounded-lg bg-gray-50 flex items-center justify-center ${className}`}>
      <ImageIcon className="h-6 w-6 text-gray-300" />
    </div>
  )
}
