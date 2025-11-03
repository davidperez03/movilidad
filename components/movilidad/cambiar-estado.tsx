"use client"

import { useState, useEffect } from "react"
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
import { Edit, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CambiarEstadoProps {
  procesoId: string
  procesoTipo: "traslado" | "radicacion"
  estadoActual: string
}

const ESTADOS_TRASLADO = [
  { value: "sin_asignar", label: "Sin asignar" },
  { value: "revisado", label: "Revisado" },
  { value: "con_novedades", label: "Con novedades" },
  { value: "enviado_organismo", label: "Enviado a organismo" },
  { value: "trasladado", label: "Trasladado" },
  { value: "devuelto", label: "Devuelto" },
]

const ESTADOS_RADICACION = [
  { value: "sin_asignar", label: "Sin asignar" },
  { value: "recibido", label: "Recibido" },
  { value: "revisado", label: "Revisado" },
  { value: "con_novedades", label: "Con novedades" },
  { value: "pendiente_radicar", label: "Pendiente radicar" },
  { value: "radicado", label: "Radicado" },
  { value: "devuelto", label: "Devuelto" },
]

export function CambiarEstado({ procesoId, procesoTipo, estadoActual }: CambiarEstadoProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [estadosPermitidos, setEstadosPermitidos] = useState<string[]>([])
  const [cargandoTransiciones, setCargandoTransiciones] = useState(true)

  const estados = procesoTipo === "traslado" ? ESTADOS_TRASLADO : ESTADOS_RADICACION
  const tabla = procesoTipo === "traslado" ? "mov_traslados" : "mov_radicaciones"

  // Cargar transiciones válidas cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarTransicionesValidas()
      setNuevoEstado("") // Reset selection when opening
    } else {
      // Reset when closing
      setNuevoEstado("")
      setObservaciones("")
    }
  }, [open, estadoActual, procesoTipo])

  const cargarTransicionesValidas = async () => {
    setCargandoTransiciones(true)
    try {
      const { data, error } = await supabase
        .rpc("obtener_transiciones_validas", {
          p_estado_actual: estadoActual,
          p_tipo_proceso: procesoTipo,
        })

      if (error) {
        console.error("Error al cargar transiciones:", error)
        toast.error("Error al cargar los estados disponibles")
        setEstadosPermitidos([])
        return
      }

      // Extraer solo los valores de estado_siguiente
      const permitidos = data?.map((row: any) => row.estado_siguiente) || []
      setEstadosPermitidos(permitidos)

      // Si no hay transiciones válidas, significa que es un estado final
      if (permitidos.length === 0) {
        toast.info("Este proceso está en un estado final")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar transiciones válidas")
      setEstadosPermitidos([])
    } finally {
      setCargandoTransiciones(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!nuevoEstado || nuevoEstado === estadoActual) {
        toast.error("Debe seleccionar un nuevo estado")
        setLoading(false)
        return
      }

      // Validar que el nuevo estado esté en los permitidos
      if (!estadosPermitidos.includes(nuevoEstado)) {
        toast.error("La transición seleccionada no es válida")
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      const updateData: any = {
        estado: nuevoEstado,
        actualizado_por: user.id,
      }

      if (observaciones.trim()) {
        updateData.observaciones = observaciones.trim()
      }

      const { error } = await supabase
        .from(tabla)
        .update(updateData)
        .eq("id", procesoId)

      if (error) {
        console.error("Error al cambiar estado:", error)
        toast.error("Error al cambiar el estado: " + error.message)
        setLoading(false)
        return
      }

      toast.success("Estado actualizado exitosamente")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al cambiar el estado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Cambiar Estado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Proceso</DialogTitle>
          <DialogDescription>
            Actualiza el estado del {procesoTipo === "traslado" ? "traslado" : "radicación"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Estado Actual</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium capitalize">
                {estados.find((e) => e.value === estadoActual)?.label || estadoActual}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuevo_estado">
              Nuevo Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={nuevoEstado}
              onValueChange={setNuevoEstado}
              disabled={loading || cargandoTransiciones}
              required
            >
              <SelectTrigger id="nuevo_estado">
                <SelectValue placeholder={cargandoTransiciones ? "Cargando estados..." : "Seleccione un estado"} />
              </SelectTrigger>
              <SelectContent>
                {cargandoTransiciones ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Cargando estados disponibles...
                  </div>
                ) : estadosPermitidos.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay transiciones disponibles desde este estado
                  </div>
                ) : (
                  estados
                    .filter((estado) => estadosPermitidos.includes(estado.value))
                    .map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {!cargandoTransiciones && estadosPermitidos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {estadosPermitidos.length} {estadosPermitidos.length === 1 ? "transición disponible" : "transiciones disponibles"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Ingrese observaciones sobre el cambio de estado (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Solo se permiten transiciones de estado válidas.
              {nuevoEstado === "trasladado" || nuevoEstado === "radicado"
                ? " Este es un estado final y no se podrá revertir."
                : ""}
            </p>
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
            <Button
              type="submit"
              disabled={loading || cargandoTransiciones || estadosPermitidos.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Estado"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
