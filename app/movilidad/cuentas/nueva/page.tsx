"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ModalCuentaExistente } from "@/components/movilidad/modals/modal-cuenta-existente"
import { manejarErrorSupabase } from "@/lib/utils/rls-errors"
import { RequirePermission } from "@/components/auth/RequirePermission"
import { FormInput } from "@/components/ui/form-field"

function NuevaCuentaForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [placa, setPlaca] = useState("")
  const [placaError, setPlacaError] = useState<string | null>(null)
  const [placaTouched, setPlacaTouched] = useState(false)
  const [tipoServicio, setTipoServicio] = useState("")
  const [tipoServicioTouched, setTipoServicioTouched] = useState(false)
  const [modalCuentaExistente, setModalCuentaExistente] = useState(false)
  const [cuentaExistenteData, setCuentaExistenteData] = useState({ placa: "", numeroCuenta: "" })

  const validatePlaca = (value: string): string | null => {
    if (!value.trim()) return "La placa es requerida"
    if (!/^[A-Z0-9]{4,10}$/.test(value.toUpperCase())) {
      return "La placa debe tener entre 4 y 10 caracteres alfanuméricos"
    }
    return null
  }

  const handlePlacaChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setPlaca(upperValue)
    if (placaTouched) {
      setPlacaError(validatePlaca(upperValue))
    }
  }

  const handlePlacaBlur = () => {
    setPlacaTouched(true)
    setPlacaError(validatePlaca(placa))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos los campos
    setPlacaTouched(true)
    setTipoServicioTouched(true)
    const placaValidationError = validatePlaca(placa)
    setPlacaError(placaValidationError)

    if (placaValidationError) {
      toast.error(placaValidationError)
      return
    }

    if (!tipoServicio) {
      toast.error("Debe seleccionar el tipo de servicio")
      return
    }

    setLoading(true)

    try {

      // Normalizar placa (convertir a mayúsculas y eliminar espacios)
      const placaNormalizada = placa.trim().toUpperCase()

      // Verificar si la placa ya existe
      const { data: cuentaExistente } = await supabase
        .from("mov_cuentas_vehiculos")
        .select("placa, numero_cuenta")
        .eq("placa", placaNormalizada)
        .single()

      if (cuentaExistente) {
        setCuentaExistenteData({
          placa: placaNormalizada,
          numeroCuenta: cuentaExistente.numero_cuenta
        })
        setModalCuentaExistente(true)
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
        const mensajeError = manejarErrorSupabase(error, 'crear', 'la cuenta de vehículo')
        toast.error(mensajeError)
        setLoading(false)
        return
      }

      toast.success(`Cuenta creada exitosamente: ${data.numero_cuenta}`)
      router.push(`/movilidad/vehiculos/${data.placa}`)
    } catch (error) {
      toast.error("Error inesperado al crear la cuenta")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/movilidad/cuentas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Cuenta</h1>
          <p className="text-muted-foreground">Crear cuenta</p>
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
            <FormInput
              label="Placa del Vehículo"
              name="placa"
              placeholder="Ej: ABC123"
              value={placa}
              onChange={(e) => handlePlacaChange(e.target.value)}
              onBlur={handlePlacaBlur}
              error={placaError}
              touched={placaTouched}
              disabled={loading}
              maxLength={10}
              required
              className="uppercase"
              description="La placa debe ser única en el sistema"
            />

            <div className="space-y-2">
              <Label htmlFor="tipo_servicio">
                Tipo de Servicio <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tipoServicio}
                onValueChange={(value) => {
                  setTipoServicio(value)
                  setTipoServicioTouched(true)
                }}
                disabled={loading}
                required
              >
                <SelectTrigger
                  id="tipo_servicio"
                  className={tipoServicioTouched && !tipoServicio ? "border-destructive" : ""}
                  onBlur={() => setTipoServicioTouched(true)}
                >
                  <SelectValue placeholder="Seleccione el tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {tipoServicioTouched && !tipoServicio && (
                <p className="text-xs text-destructive">Debe seleccionar el tipo de servicio</p>
              )}
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

      <ModalCuentaExistente
        open={modalCuentaExistente}
        onOpenChange={setModalCuentaExistente}
        placa={cuentaExistenteData.placa}
        numeroCuenta={cuentaExistenteData.numeroCuenta}
      />
    </div>
  )
}

export default function NuevaCuentaPage() {
  return (
    <RequirePermission modulo="movilidad" permiso="crear_cuentas">
      <NuevaCuentaForm />
    </RequirePermission>
  )
}
