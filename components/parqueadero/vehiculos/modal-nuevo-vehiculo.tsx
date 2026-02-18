"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react"
import { OPCIONES_TIPO_VEHICULO } from "@/lib/parqueadero/config"
import { toast } from "sonner"

export function ModalNuevoVehiculo() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    placa: "",
    tipo: "grua_plataforma",
    marca: "",
    modelo: "",
    soat_aseguradora: "",
    soat_vencimiento: "",
    tecnomecanica_vencimiento: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("parq_vehiculos")
        .insert({
          placa: formData.placa.toUpperCase().trim(),
          tipo: formData.tipo,
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          soat_aseguradora: formData.soat_aseguradora || null,
          soat_vencimiento: formData.soat_vencimiento || null,
          tecnomecanica_vencimiento: formData.tecnomecanica_vencimiento || null,
          creado_por: user?.id || null,
        })

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya existe un vehículo con esa placa")
        } else {
          toast.error("Error al crear el vehículo")
        }
        return
      }

      toast.success("Vehículo creado correctamente")
      setOpen(false)
      setFormData({
        placa: "",
        tipo: "grua_plataforma",
        marca: "",
        modelo: "",
        soat_aseguradora: "",
        soat_vencimiento: "",
        tecnomecanica_vencimiento: "",
      })
      router.refresh()
    } catch {
      toast.error("Error al crear el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Vehículo</DialogTitle>
            <DialogDescription>
              Registra un nuevo vehículo en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  placeholder="ABC123"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  required
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Chevrolet"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="2024"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="soat_aseguradora">Aseguradora SOAT</Label>
              <Input
                id="soat_aseguradora"
                placeholder="Nombre de la aseguradora"
                value={formData.soat_aseguradora}
                onChange={(e) => setFormData({ ...formData, soat_aseguradora: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soat_vencimiento">Vencimiento SOAT</Label>
                <Input
                  id="soat_vencimiento"
                  type="date"
                  value={formData.soat_vencimiento}
                  onChange={(e) => setFormData({ ...formData, soat_vencimiento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tecnomecanica_vencimiento">Vencimiento Tecnomecánica</Label>
                <Input
                  id="tecnomecanica_vencimiento"
                  type="date"
                  value={formData.tecnomecanica_vencimiento}
                  onChange={(e) => setFormData({ ...formData, tecnomecanica_vencimiento: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.placa}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Vehículo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
