"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { OPCIONES_TIPO_VEHICULO } from "@/lib/parqueadero/config"
import { toast } from "sonner"
import type { VistaVehiculo } from "@/lib/parqueadero/types"

interface ModalEditarVehiculoProps {
  vehiculo: VistaVehiculo
  onCerrar: () => void
}

export function ModalEditarVehiculo({ vehiculo, onCerrar }: ModalEditarVehiculoProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    placa: vehiculo.placa,
    tipo: vehiculo.tipo,
    marca: vehiculo.marca || "",
    modelo: vehiculo.modelo || "",
    soat_aseguradora: vehiculo.soat_aseguradora || "",
    soat_vencimiento: vehiculo.soat_vencimiento || "",
    tecnomecanica_vencimiento: vehiculo.tecnomecanica_vencimiento || "",
    activo: vehiculo.activo,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("parq_vehiculos")
        .update({
          placa: formData.placa.toUpperCase().trim(),
          tipo: formData.tipo,
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          soat_aseguradora: formData.soat_aseguradora || null,
          soat_vencimiento: formData.soat_vencimiento || null,
          tecnomecanica_vencimiento: formData.tecnomecanica_vencimiento || null,
          activo: formData.activo,
        })
        .eq("id", vehiculo.id)

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya existe un vehículo con esa placa")
        } else {
          toast.error("Error al actualizar: " + error.message)
        }
        return
      }

      toast.success("Vehículo actualizado")
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
          <DialogDescription>
            {vehiculo.placa} - {OPCIONES_TIPO_VEHICULO.find(t => t.value === vehiculo.tipo)?.label}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="placa" className="text-xs">Placa *</Label>
              <Input
                id="placa"
                className="h-9 uppercase"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tipo" className="text-xs">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPCIONES_TIPO_VEHICULO.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="marca" className="text-xs">Marca</Label>
              <Input
                id="marca"
                className="h-9"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="modelo" className="text-xs">Modelo</Label>
              <Input
                id="modelo"
                className="h-9"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="soat_aseguradora" className="text-xs">Aseguradora SOAT</Label>
            <Input
              id="soat_aseguradora"
              className="h-9"
              value={formData.soat_aseguradora}
              onChange={(e) => setFormData({ ...formData, soat_aseguradora: e.target.value })}
            />
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="soat_vencimiento" className="text-xs">Venc. SOAT</Label>
              <Input
                id="soat_vencimiento"
                type="date"
                className="h-9"
                value={formData.soat_vencimiento}
                onChange={(e) => setFormData({ ...formData, soat_vencimiento: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tecnomecanica_vencimiento" className="text-xs">Venc. Tecnomecánica</Label>
              <Input
                id="tecnomecanica_vencimiento"
                type="date"
                className="h-9"
                value={formData.tecnomecanica_vencimiento}
                onChange={(e) => setFormData({ ...formData, tecnomecanica_vencimiento: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div>
              <Label htmlFor="activo" className="text-sm font-medium">Estado del vehículo</Label>
              <p className="text-xs text-muted-foreground">
                {formData.activo ? "Disponible para inspecciones" : "No disponible"}
              </p>
            </div>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading || !formData.placa}>
              {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
