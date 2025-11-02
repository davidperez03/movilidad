"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Car, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NuevaCuentaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [placa, setPlaca] = useState("")
  const [tipoServicio, setTipoServicio] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar que la placa no esté vacía
      if (!placa.trim()) {
        toast.error("La placa es requerida")
        setLoading(false)
        return
      }

      // Validar que el tipo de servicio esté seleccionado
      if (!tipoServicio) {
        toast.error("Debe seleccionar el tipo de servicio")
        setLoading(false)
        return
      }

      // Normalizar placa (convertir a mayúsculas y eliminar espacios)
      const placaNormalizada = placa.trim().toUpperCase()

      // Verificar si la placa ya existe
      const { data: cuentaExistente } = await supabase
        .from("mov_cuentas_vehiculos")
        .select("placa, numero_cuenta")
        .eq("placa", placaNormalizada)
        .single()

      if (cuentaExistente) {
        toast.error(`La placa ${placaNormalizada} ya está registrada con el número de cuenta ${cuentaExistente.numero_cuenta}`)
        setLoading(false)
        return
      }

      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      // Crear la nueva cuenta
      const { data, error } = await supabase
        .from("mov_cuentas_vehiculos")
        .insert({
          placa: placaNormalizada,
          tipo_servicio: tipoServicio,
          creado_por: user.id,
          numero_cuenta: "" // Se genera automáticamente por el trigger
        })
        .select()
        .single()

      if (error) {
        console.error("Error al crear cuenta:", error)
        toast.error("Error al crear la cuenta: " + error.message)
        setLoading(false)
        return
      }

      toast.success(`Cuenta creada exitosamente: ${data.numero_cuenta}`)
      router.push(`/movilidad/vehiculos/${data.placa}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al crear la cuenta")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/movilidad/cuentas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Cuenta de Vehículo</h1>
          <p className="text-muted-foreground">
            Registra un nuevo vehículo en el sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Información del Vehículo
          </CardTitle>
          <CardDescription>
            El número de cuenta se generará automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="placa">
                Placa del Vehículo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="placa"
                placeholder="Ej: ABC123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={10}
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                La placa debe ser única en el sistema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_servicio">
                Tipo de Servicio <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tipoServicio}
                onValueChange={setTipoServicio}
                disabled={loading}
                required
              >
                <SelectTrigger id="tipo_servicio">
                  <SelectValue placeholder="Seleccione el tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Car className="h-4 w-4 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
