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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Edit } from "lucide-react"
import { ESTADOS_TRASLADO, ESTADOS_RADICACION } from "@/lib/movilidad/config"
import { useDialogForm } from "@/lib/hooks/use-dialog-form"
import { AlertBox } from "@/components/ui/alert-box"
import { SubmitButton } from "@/components/ui/submit-button"

interface TransicionValida {
  estado_siguiente: string
}

interface UpdateProcesoData {
  estado: string
  actualizado_por: string
  observaciones?: string
  fecha_aprobacion?: string
}

interface CambiarEstadoProps {
  procesoId: string
  procesoTipo: "traslado" | "radicacion"
  estadoActual: string
}

export function CambiarEstado({ procesoId, procesoTipo, estadoActual }: CambiarEstadoProps) {
  const supabase = createClient()
  const { open, setOpen, loading, handleSubmit } = useDialogForm({
    successMessage: "Estado actualizado exitosamente",
  })

  const [nuevoEstado, setNuevoEstado] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [usarOtraFecha, setUsarOtraFecha] = useState(false)
  const [fechaAprobacion, setFechaAprobacion] = useState("")
  const [estadosPermitidos, setEstadosPermitidos] = useState<string[]>([])
  const [cargandoTransiciones, setCargandoTransiciones] = useState(true)

  // Fecha máxima es hoy
  const hoy = new Date().toISOString().split("T")[0]

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
      setUsarOtraFecha(false)
      setFechaAprobacion("")
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
        toast.error("Error al cargar los estados disponibles")
        setEstadosPermitidos([])
        return
      }

      // Extraer solo los valores de estado_siguiente
      const permitidos = (data as TransicionValida[] | null)?.map((row) => row.estado_siguiente) || []
      setEstadosPermitidos(permitidos)

      // Si no hay transiciones válidas, significa que es un estado final
      if (permitidos.length === 0) {
        toast.info("Este proceso está en un estado final")
      }
    } catch (error) {
      toast.error("Error al cargar transiciones válidas")
      setEstadosPermitidos([])
    } finally {
      setCargandoTransiciones(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación especial para estado "devuelto"
    if (nuevoEstado === "devuelto" && !observaciones.trim()) {
      toast.error("Debe especificar el motivo de la devolución")
      return
    }

    await handleSubmit(async () => {
      if (!nuevoEstado || nuevoEstado === estadoActual) {
        throw new Error("Debe seleccionar un nuevo estado")
      }

      // Validar que el nuevo estado esté en los permitidos
      if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error("La transición seleccionada no es válida")
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa")
      }

      const updateData: UpdateProcesoData = {
        estado: nuevoEstado,
        actualizado_por: user.id,
        ...(observaciones.trim() && { observaciones: observaciones.trim() }),
        // Incluir fecha_aprobacion solo si se marcó usar otra fecha
        ...(nuevoEstado === "aprobado" && procesoTipo === "traslado" && usarOtraFecha && fechaAprobacion && { fecha_aprobacion: fechaAprobacion }),
      }

      const { error } = await supabase
        .from(tabla)
        .update(updateData)
        .eq("id", procesoId)

      if (error) {
        throw error
      }
    }, {
      errorMessage: nuevoEstado === "devuelto"
        ? "Error al registrar la devolución"
        : "Error al cambiar el estado",
      successMessage: nuevoEstado === "devuelto"
        ? "Proceso devuelto exitosamente"
        : "Estado actualizado exitosamente"
    })
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
        <form onSubmit={onSubmit} className="space-y-4">
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

          {/* Opción de fecha de aprobación personalizada - Solo para traslados */}
          {nuevoEstado === "aprobado" && procesoTipo === "traslado" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="usar_otra_fecha"
                  checked={usarOtraFecha}
                  onCheckedChange={(checked) => {
                    setUsarOtraFecha(checked === true)
                    if (!checked) setFechaAprobacion("")
                  }}
                  disabled={loading}
                />
                <Label htmlFor="usar_otra_fecha" className="text-sm font-normal cursor-pointer">
                  Usar otra fecha de aprobación
                </Label>
              </div>
              {usarOtraFecha && (
                <Input
                  id="fecha_aprobacion"
                  type="date"
                  value={fechaAprobacion}
                  onChange={(e) => setFechaAprobacion(e.target.value)}
                  max={hoy}
                  disabled={loading}
                  required
                  className="w-full"
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">
              {nuevoEstado === "devuelto" ? (
                <>
                  Motivo de la Devolución <span className="text-red-500">*</span>
                </>
              ) : (
                "Observaciones"
              )}
            </Label>
            <Textarea
              id="observaciones"
              placeholder={
                nuevoEstado === "devuelto"
                  ? "Explique detalladamente el motivo de la devolución (obligatorio)"
                  : "Ingrese observaciones sobre el cambio de estado (opcional)"
              }
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={loading}
              rows={nuevoEstado === "devuelto" ? 4 : 3}
              required={nuevoEstado === "devuelto"}
              className={nuevoEstado === "devuelto" ? "border-red-300 focus:border-red-500" : ""}
            />
            {nuevoEstado === "devuelto" && (
              <p className="text-xs text-red-600">
                El motivo de la devolución quedará registrado en el historial del proceso
              </p>
            )}
          </div>

          {nuevoEstado === "devuelto" && (
            <AlertBox variant="error" title="Advertencia">
              Este proceso será devuelto. Asegúrese de especificar claramente el motivo en las observaciones.
            </AlertBox>
          )}

          {nuevoEstado !== "devuelto" && (
            <AlertBox variant="warning" title="Nota">
              Solo se permiten transiciones de estado válidas.
              {nuevoEstado === "trasladado" || nuevoEstado === "radicado"
                ? " Este es un estado final y no se podrá revertir."
                : ""}
            </AlertBox>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <SubmitButton
              loading={loading}
              loadingText="Actualizando..."
              disabled={cargandoTransiciones || estadosPermitidos.length === 0}
            >
              Actualizar Estado
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
