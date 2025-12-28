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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useDialogForm } from "@/lib/hooks/use-dialog-form"

interface ResolverNovedadProps {
  novedadId: string
  descripcion: string
}

export function ResolverNovedad({ novedadId, descripcion }: ResolverNovedadProps) {
  const supabase = createClient()
  const { open, setOpen, loading, handleSubmit } = useDialogForm({
    successMessage: "Novedad resuelta exitosamente",
    onSuccess: () => setSolucion(""),
  })

  const [solucion, setSolucion] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await handleSubmit(async () => {
      if (!solucion.trim()) {
        throw new Error("Debe ingresar la solución aplicada")
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa")
      }

      const { error } = await supabase
        .from("mov_novedades")
        .update({
          estado: "resuelta",
          solucion: solucion.trim(),
          resuelta_por: user.id,
        })
        .eq("id", novedadId)

      if (error) {
        throw error
      }
    }, {
      errorMessage: "Error al resolver la novedad"
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Resolver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Novedad</DialogTitle>
          <DialogDescription>
            Marcar la novedad como resuelta e ingresar la solución
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Descripción del Problema</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">{descripcion}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solucion">
              Solución Aplicada <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="solucion"
              placeholder="Describa la solución que se aplicó a esta novedad..."
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
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
                  Resolviendo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Resuelta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
