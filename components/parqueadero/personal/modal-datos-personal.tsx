"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { VistaPersonal } from "@/lib/parqueadero/types"
import { OPCIONES_CATEGORIA_LICENCIA, OPCIONES_TIPO_DOCUMENTO } from "@/lib/parqueadero/config"

interface ModalDatosPersonalProps {
  persona: VistaPersonal
  onCerrar: () => void
}

const requiereLicencia = (rolCodigo: string) => {
  return rolCodigo !== "parq_auxiliar"
}

export function ModalDatosPersonal({ persona, onCerrar }: ModalDatosPersonalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    licencia_numero: persona.licencia_numero || "",
    licencia_categoria: persona.licencia_categoria || "",
    licencia_vencimiento: persona.licencia_vencimiento || "",
    licencia_restricciones: "",
    documento_tipo: persona.documento_tipo || "CC",
    documento_numero: persona.documento_numero || "",
    telefono: persona.telefono || "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    observaciones: "",
  })

  useEffect(() => {
    async function cargarDatos() {
      const supabase = createClient()
      const { data } = await supabase
        .from("parq_datos_personal")
        .select("*")
        .eq("perfil_id", persona.id)
        .single()

      if (data) {
        setFormData({
          licencia_numero: data.licencia_numero || "",
          licencia_categoria: data.licencia_categoria || "",
          licencia_vencimiento: data.licencia_vencimiento || "",
          licencia_restricciones: data.licencia_restricciones || "",
          documento_tipo: data.documento_tipo || "CC",
          documento_numero: data.documento_numero || "",
          telefono: data.telefono || "",
          contacto_emergencia: data.contacto_emergencia || "",
          telefono_emergencia: data.telefono_emergencia || "",
          observaciones: data.observaciones || "",
        })
      }
    }
    cargarDatos()
  }, [persona.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const dataToSave = {
        perfil_id: persona.id,
        licencia_numero: formData.licencia_numero || null,
        licencia_categoria: formData.licencia_categoria || null,
        licencia_vencimiento: formData.licencia_vencimiento || null,
        licencia_restricciones: formData.licencia_restricciones || null,
        documento_tipo: formData.documento_tipo,
        documento_numero: formData.documento_numero || null,
        telefono: formData.telefono || null,
        contacto_emergencia: formData.contacto_emergencia || null,
        telefono_emergencia: formData.telefono_emergencia || null,
        observaciones: formData.observaciones || null,
      }

      const { error } = await supabase
        .from("parq_datos_personal")
        .upsert(dataToSave, { onConflict: "perfil_id" })

      if (error) throw error

      toast.success("Datos guardados")
      router.refresh()
      onCerrar()
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error("Error: " + (err.message || "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => onCerrar()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requiereLicencia(persona.rol_codigo) ? "Datos del Conductor" : "Datos del Personal"}
          </DialogTitle>
          <DialogDescription>
            {persona.nombre_completo} - {persona.rol_nombre}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requiereLicencia(persona.rol_codigo) ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Licencia de Conducción</h4>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="licencia_categoria" className="text-xs">Categoría</Label>
                  <Select
                    value={formData.licencia_categoria}
                    onValueChange={(value) => setFormData({ ...formData, licencia_categoria: value })}
                  >
                    <SelectTrigger id="licencia_categoria" className="h-9">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCIONES_CATEGORIA_LICENCIA.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="licencia_vencimiento" className="text-xs">Vencimiento</Label>
                  <Input
                    id="licencia_vencimiento"
                    type="date"
                    className="h-9"
                    value={formData.licencia_vencimiento}
                    onChange={(e) => setFormData({ ...formData, licencia_vencimiento: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="licencia_numero" className="text-xs">Número</Label>
                  <Input
                    id="licencia_numero"
                    className="h-9"
                    value={formData.licencia_numero}
                    onChange={(e) => setFormData({ ...formData, licencia_numero: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="licencia_restricciones" className="text-xs">Restricciones</Label>
                  <Input
                    id="licencia_restricciones"
                    className="h-9"
                    value={formData.licencia_restricciones}
                    onChange={(e) => setFormData({ ...formData, licencia_restricciones: e.target.value })}
                    placeholder="Ej: Lentes"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              El rol de Auxiliar no requiere licencia
            </p>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Documento</h4>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="documento_tipo" className="text-xs">Tipo</Label>
                <Select
                  value={formData.documento_tipo}
                  onValueChange={(value) => setFormData({ ...formData, documento_tipo: value })}
                >
                  <SelectTrigger id="documento_tipo" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPCIONES_TIPO_DOCUMENTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="documento_numero" className="text-xs">Número</Label>
                <Input
                  id="documento_numero"
                  className="h-9"
                  value={formData.documento_numero}
                  onChange={(e) => setFormData({ ...formData, documento_numero: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Contacto</h4>
            <div className="space-y-1">
              <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
              <Input
                id="telefono"
                className="h-9"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="contacto_emergencia" className="text-xs">Contacto emergencia</Label>
                <Input
                  id="contacto_emergencia"
                  className="h-9"
                  value={formData.contacto_emergencia}
                  onChange={(e) => setFormData({ ...formData, contacto_emergencia: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="telefono_emergencia" className="text-xs">Tel. emergencia</Label>
                <Input
                  id="telefono_emergencia"
                  className="h-9"
                  value={formData.telefono_emergencia}
                  onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="observaciones" className="text-xs">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
