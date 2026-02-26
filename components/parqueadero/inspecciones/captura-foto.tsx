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
import { Camera, FolderOpen, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { FotoConTimestamp } from "@/lib/parqueadero/types"
import {
  procesarImagenConTimestamp,
  optimizarImagenParaMovil,
  formatearTimestampParaImagen,
} from "@/lib/parqueadero/procesamiento-imagen"
import { getNowTimestampColombia } from "@/lib/utils/date"

interface CapturaFotoProps {
  open: boolean
  onClose: () => void
  onSave: (fotos: FotoConTimestamp[]) => void
  titulo: string
  descripcion?: string
  carpeta?: string
  maxFotos?: number
  fotosActuales?: FotoConTimestamp[]
}

type FotoLocal = {
  file: File
  preview: string
  timestamp: string
  origen: 'camera' | 'upload'
}

export function CapturaFoto({
  open,
  onClose,
  onSave,
  titulo,
  descripcion,
  carpeta = "inspecciones",
  maxFotos = 3,
  fotosActuales = [],
}: CapturaFotoProps) {
  const [loading, setLoading] = useState(false)
  const [fotos, setFotos] = useState<FotoLocal[]>([])
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const procesarArchivo = async (selectedFile: File, origen: 'camera' | 'upload') => {
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

    // Validar límite de fotos
    if (fotos.length + fotosActuales.length >= maxFotos) {
      toast.error(`Máximo ${maxFotos} fotos permitidas`)
      return
    }

    try {
      setLoading(true)

      // 1. Optimizar para móvil si es necesario
      const optimizada = await optimizarImagenParaMovil(selectedFile)

      // 2. Agregar timestamp y badge de origen a la imagen
      const timestamp = getNowTimestampColombia()
      const conTimestamp = await procesarImagenConTimestamp(optimizada, timestamp, origen)

      // 3. Generar preview y agregar al array
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotos(prev => [...prev, {
          file: conTimestamp,
          preview: reader.result as string,
          timestamp,
          origen,
        }])
      }
      reader.readAsDataURL(conTimestamp)

      toast.success(origen === 'camera' ? "Foto de cámara procesada" : "Imagen de galería procesada")
    } catch (error) {
      console.error("Error al procesar imagen:", error)
      toast.error("Error al procesar la imagen")
    } finally {
      setLoading(false)
    }
  }

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await procesarArchivo(file, 'camera')
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await procesarArchivo(file, 'upload')
    if (galleryInputRef.current) galleryInputRef.current.value = ""
  }

  const eliminarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index))
  }

  const limpiar = () => {
    setFotos([])
    if (cameraInputRef.current) cameraInputRef.current.value = ""
    if (galleryInputRef.current) galleryInputRef.current.value = ""
  }

  const guardar = async () => {
    if (fotos.length === 0) {
      toast.error("Agregue al menos una foto")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const fotosSubidas: FotoConTimestamp[] = []

      for (const foto of fotos) {
        const ts = Date.now()
        const extension = foto.file.name.split(".").pop() || "jpg"
        const nombreArchivo = `${carpeta}/${ts}_${Math.random().toString(36).substring(7)}.${extension}`

        const { data, error } = await supabase.storage
          .from("parqueadero")
          .upload(nombreArchivo, foto.file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from("parqueadero")
          .getPublicUrl(data.path)

        fotosSubidas.push({
          url: urlData.publicUrl,
          timestamp: foto.timestamp,
          origen: foto.origen,
        })
      }

      onSave(fotosSubidas)
      limpiar()
      onClose()
      toast.success(`${fotosSubidas.length} foto(s) guardada(s)`)
    } catch (error) {
      console.error("Error al subir fotos:", error)
      toast.error(error instanceof Error ? error.message : "Error al subir las fotos")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    limpiar()
    onClose()
  }

  const puedeAgregarMas = fotos.length + fotosActuales.length < maxFotos
  const totalFotos = fotos.length + fotosActuales.length

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && (
            <DialogDescription>{descripcion}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Grid de fotos en esta sesión */}
          {fotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {fotos.map((foto, index) => (
                <div key={index} className="relative">
                  <img
                    src={foto.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  {/* Badge de origen */}
                  <span
                    className={`absolute bottom-7 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                      foto.origen === 'camera'
                        ? 'bg-green-600'
                        : 'bg-orange-600'
                    }`}
                  >
                    {foto.origen === 'camera' ? 'Camara' : 'Galeria'}
                  </span>
                  {/* Botón eliminar */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => eliminarFoto(index)}
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {formatearTimestampParaImagen(foto.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Botones de captura */}
          {puedeAgregarMas && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Botón Cámara */}
                <button
                  type="button"
                  onClick={() => !loading && cameraInputRef.current?.click()}
                  disabled={loading}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 rounded-lg p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-8 w-8 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Tomar foto</span>
                  <span className="text-xs text-green-600">Con la cámara</span>
                </button>

                {/* Botón Galería */}
                <button
                  type="button"
                  onClick={() => !loading && galleryInputRef.current?.click()}
                  disabled={loading}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 rounded-lg p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderOpen className="h-8 w-8 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Subir imagen</span>
                  <span className="text-xs text-orange-600">Desde galeria</span>
                </button>
              </div>

              {/* Contador de fotos */}
              <p className="text-xs text-muted-foreground text-center">
                {totalFotos}/{maxFotos} fotos · Máximo 5MB por foto
              </p>
            </div>
          )}

          {!puedeAgregarMas && fotos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Límite de {maxFotos} fotos alcanzado
            </p>
          )}

          {/* Inputs ocultos */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            className="hidden"
            disabled={loading}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryChange}
            className="hidden"
            disabled={loading}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {fotos.length > 0 && (
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
              {loading ? "Subiendo..." : `Guardar ${fotos.length} foto${fotos.length !== 1 ? 's' : ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente para mostrar una sola foto (retrocompatibilidad)
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

// Componente para mostrar múltiples fotos con indicadores de origen
interface VistaFotosProps {
  fotos: FotoConTimestamp[]
  onCapturar?: () => void
  onEliminar?: (index: number) => void
  maxFotos?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function VistaFotos({
  fotos,
  onCapturar,
  onEliminar,
  maxFotos = 3,
  size = "md",
  className,
}: VistaFotosProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const puedeAgregarMas = fotos.length < maxFotos

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {fotos.map((foto, index) => (
        <div key={index} className="relative inline-block">
          <img
            src={foto.url}
            alt={`Foto ${index + 1}`}
            className={`${sizeClasses[size]} object-cover rounded-lg border`}
          />
          {/* Badge de origen */}
          {foto.origen && (
            <span
              className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold py-0.5 rounded-b-lg text-white ${
                foto.origen === 'camera'
                  ? 'bg-green-600/85'
                  : 'bg-orange-600/85'
              }`}
            >
              {foto.origen === 'camera' ? 'Camara' : 'Galeria'}
            </span>
          )}
          {onEliminar && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => onEliminar(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center mt-1">
            {formatearTimestampParaImagen(foto.timestamp)}
          </p>
        </div>
      ))}

      {onCapturar && puedeAgregarMas && (
        <Button
          type="button"
          variant="outline"
          onClick={onCapturar}
          className={`${sizeClasses[size]} border-dashed flex-shrink-0`}
        >
          <div className="text-center">
            <Camera className="h-5 w-5 mx-auto" />
            <span className="text-xs mt-1 block">{fotos.length}/{maxFotos}</span>
          </div>
        </Button>
      )}
    </div>
  )
}
