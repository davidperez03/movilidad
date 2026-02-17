"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useDialogForm } from "@/lib/hooks/use-dialog-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { AlertBox } from "@/components/ui/alert-box"
import { SubmitButton } from "@/components/ui/submit-button"

interface AgregarNotificacionRadicacionProps {
  radicacionId: string
  notificacionIdActual?: string | null
  notificadoActual?: boolean | null
  notificadoEnActual?: string | null
  observacionesActual?: string | null
}

interface NotificacionExistente {
  id: string
  notificado_en: string | null
}

interface InsertNotificacionPayload {
  radicacion_id: string
  solicitante_notificado: boolean
  notificado_en: string | null
  observaciones: string | null
  creado_por: string
  actualizado_por: string
}

interface UpdateNotificacionPayload {
  solicitante_notificado: boolean
  notificado_en: string | null
  observaciones: string | null
  actualizado_por: string
}

export function AgregarNotificacionRadicacion({
  radicacionId,
  notificacionIdActual,
  notificadoActual,
  notificadoEnActual,
  observacionesActual,
}: AgregarNotificacionRadicacionProps) {
  const supabase = createClient()
  const { open, setOpen, loading, handleSubmit } = useDialogForm({
    successMessage: "Notificación del solicitante actualizada",
  })

  const [solicitanteNotificado, setSolicitanteNotificado] = useState(Boolean(notificadoActual))
  const [observaciones, setObservaciones] = useState(observacionesActual ?? "")

  const hayRegistro = Boolean(notificacionIdActual)

  useEffect(() => {
    if (open) {
      setSolicitanteNotificado(Boolean(notificadoActual))
      setObservaciones(observacionesActual ?? "")
    }
  }, [open, notificadoActual, observacionesActual])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    await handleSubmit(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa")
      }

      const observacionesLimpias = observaciones.trim() || null
      const nuevoNotificadoEn = solicitanteNotificado
        ? (notificadoEnActual ?? new Date().toISOString())
        : null

      const { data: existente, error: errorExistente } = await supabase
        .from("mov_notificaciones_radicacion")
        .select("id, notificado_en")
        .eq("radicacion_id", radicacionId)
        .maybeSingle()

      if (errorExistente) {
        throw errorExistente
      }

      if (existente) {
        const payload: UpdateNotificacionPayload = {
          solicitante_notificado: solicitanteNotificado,
          notificado_en: solicitanteNotificado
            ? (existente.notificado_en ?? nuevoNotificadoEn)
            : null,
          observaciones: observacionesLimpias,
          actualizado_por: user.id,
        }

        const { error } = await supabase
          .from("mov_notificaciones_radicacion")
          .update(payload)
          .eq("id", existente.id)

        if (error) {
          throw error
        }

        return
      }

      const payload: InsertNotificacionPayload = {
        radicacion_id: radicacionId,
        solicitante_notificado: solicitanteNotificado,
        notificado_en: nuevoNotificadoEn,
        observaciones: observacionesLimpias,
        creado_por: user.id,
        actualizado_por: user.id,
      }

      const { error } = await supabase
        .from("mov_notificaciones_radicacion")
        .insert(payload)

      if (error) {
        throw error
      }
    }, {
      errorMessage: "No fue posible guardar la notificación",
      successMessage: hayRegistro
        ? "Notificación actualizada exitosamente"
        : "Notificación registrada exitosamente",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={hayRegistro ? "outline" : "default"}>
          <Bell className="h-4 w-4 mr-2" />
          {hayRegistro ? "Editar Notificación" : "Registrar Notificación"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificación al Solicitante</DialogTitle>
          <DialogDescription>
            Registre si el solicitante ya fue notificado durante la etapa pendiente radicar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border p-3">
            <Checkbox
              id="solicitante_notificado"
              checked={solicitanteNotificado}
              onCheckedChange={(checked) => setSolicitanteNotificado(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="solicitante_notificado" className="cursor-pointer">
              El solicitante ya fue notificado
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones_notificacion">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones_notificacion"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              placeholder="Detalles de contacto, respuesta del solicitante u otra nota relevante..."
              rows={4}
              disabled={loading}
            />
          </div>

          <AlertBox variant="info" title="Nota">
            Si marca notificado, se guarda la fecha y hora automáticamente.
          </AlertBox>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <SubmitButton loading={loading}>
              Guardar
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
