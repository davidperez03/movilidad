"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AgregarNovedadProps {
  procesoId: string
  procesoTipo: "traslado" | "radicacion"
}

export function AgregarNovedad({ procesoId, procesoTipo }: AgregarNovedadProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipoNovedad, setTipoNovedad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [prioridad, setPrioridad] = useState("media")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from("mov_novedades")
        .insert({
          proceso_tipo: procesoTipo,
          proceso_id: procesoId,
          tipo_novedad: tipoNovedad,
          descripcion: descripcion.trim(),
          prioridad,
          creado_por: user.id,
        })

      if (error) {
        toast.error("Error al crear la novedad: " + error.message)
        setLoading(false)
        return
      }

      toast.success("Novedad agregada exitosamente")
      setOpen(false)
      setTipoNovedad("")
      setDescripcion("")
      setPrioridad("media")
      router.refresh()
    } catch (error) {
      toast.error("Error inesperado al crear la novedad")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Novedad
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Novedad</DialogTitle>
          <DialogDescription>
            Registra un problema o incidencia en el proceso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo_novedad">
              Tipo de Novedad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={tipoNovedad}
              onValueChange={setTipoNovedad}
              disabled={loading}
              required
            >
              <SelectTrigger id="tipo_novedad">
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="documentos_faltantes">Documentos faltantes</SelectItem>
                <SelectItem value="documentos_incorrectos">Documentos incorrectos</SelectItem>
                <SelectItem value="placa_incorrecta">Placa incorrecta</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridad">
              Prioridad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={prioridad}
              onValueChange={setPrioridad}
              disabled={loading}
              required
            >
              <SelectTrigger id="prioridad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describa el problema o incidencia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              required
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Novedad"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
