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
import { toast } from "sonner"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ResolverNovedadProps {
  novedadId: string
  descripcion: string
}

export function ResolverNovedad({ novedadId, descripcion }: ResolverNovedadProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [solucion, setSolucion] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!solucion.trim()) {
        toast.error("Debe ingresar la solución aplicada")
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from("novedades")
        .update({
          estado: "resuelta",
          solucion: solucion.trim(),
          resuelta_por: user.id,
        })
        .eq("id", novedadId)

      if (error) {
        console.error("Error al resolver novedad:", error)
        toast.error("Error al resolver la novedad: " + error.message)
        setLoading(false)
        return
      }

      toast.success("Novedad resuelta exitosamente")
      setOpen(false)
      setSolucion("")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al resolver la novedad")
    } finally {
      setLoading(false)
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
