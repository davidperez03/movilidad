"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ArrowLeft, ArrowRightLeft, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { getTodayForInput, formatDateForDB } from "@/lib/utils/dates"

const CIUDADES = [
  { value: "sogamoso", label: "Sogamoso" },
  { value: "medellin", label: "Medellín" },
  { value: "bogota_dc", label: "Bogotá D.C." },
  { value: "funza", label: "Funza" },
  { value: "el_zulia", label: "El Zulia" },
  { value: "nobsa", label: "Nobsa" },
]

export default function NuevoTrasladoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [placa, setPlaca] = useState(searchParams.get("placa") || "")
  const [cuentaId, setCuentaId] = useState<string | null>(null)
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [ciudadDestino, setCiudadDestino] = useState("")
  const [fechaTramite, setFechaTramite] = useState(getTodayForInput())
  const [observaciones, setObservaciones] = useState("")

  // Buscar cuenta al cargar si viene placa en params
  useEffect(() => {
    if (searchParams.get("placa")) {
      buscarCuenta(searchParams.get("placa")!)
    }
  }, [])

  const buscarCuenta = async (placaBuscar: string) => {
    if (!placaBuscar.trim()) {
      toast.error("Ingrese una placa para buscar")
      return
    }

    setBuscando(true)
    try {
      const placaNormalizada = placaBuscar.trim().toUpperCase()

      // Buscar cuenta
      const { data: cuenta, error: errorCuenta } = await supabase
        .from("mov_cuentas_vehiculos")
        .select("*")
        .eq("placa", placaNormalizada)
        .single()

      if (errorCuenta || !cuenta) {
        toast.error(`No se encontró una cuenta con la placa ${placaNormalizada}`)
        setCuentaId(null)
        setNumeroCuenta("")
        setBuscando(false)
        return
      }

      // Verificar si puede iniciar traslado usando la función de la BD
      const { data: validacion, error: errorValidacion } = await supabase
        .rpc("puede_iniciar_proceso", {
          p_placa: placaNormalizada,
          p_tipo_proceso: "traslado"
        })

      if (errorValidacion) {
        console.error("Error al validar:", errorValidacion)
        toast.error("Error al validar el vehículo")
        setBuscando(false)
        return
      }

      if (validacion && validacion.length > 0 && !validacion[0].puede_iniciar) {
        toast.error(validacion[0].razon)
        setCuentaId(null)
        setNumeroCuenta("")
        setBuscando(false)
        return
      }

      // Todo OK, asignar cuenta
      setCuentaId(cuenta.id)
      setNumeroCuenta(cuenta.numero_cuenta)
      toast.success(`Vehículo encontrado: ${cuenta.placa} - ${cuenta.numero_cuenta}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al buscar la cuenta")
    } finally {
      setBuscando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!cuentaId) {
        toast.error("Debe buscar y seleccionar un vehículo válido")
        setLoading(false)
        return
      }

      if (!ciudadDestino) {
        toast.error("Debe seleccionar la ciudad destino")
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      // Crear el traslado
      const { data, error } = await supabase
        .from("mov_traslados")
        .insert({
          cuenta_id: cuentaId,
          ciudad_destino: ciudadDestino,
          fecha_tramite: formatDateForDB(fechaTramite),
          observaciones: observaciones.trim() || null,
          creado_por: user.id,
          actualizado_por: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Error al crear traslado:", error)
        toast.error("Error al crear el traslado: " + error.message)
        setLoading(false)
        return
      }

      toast.success("Traslado iniciado exitosamente")
      router.push(`/movilidad/vehiculos/${placa}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al crear el traslado")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/movilidad/traslados">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Traslado</h1>
          <p className="text-muted-foreground">
            Inicia el proceso de traslado de un vehículo
          </p>
        </div>
      </div>

      {/* Búsqueda de vehículo */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Vehículo</CardTitle>
          <CardDescription>
            Ingrese la placa del vehículo para iniciar el traslado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ej: ABC123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                disabled={buscando || loading}
                maxLength={10}
                className="uppercase"
              />
            </div>
            <Button
              type="button"
              onClick={() => buscarCuenta(placa)}
              disabled={buscando || loading}
            >
              {buscando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
          {cuentaId && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-900">
                Vehículo encontrado: {placa}
              </p>
              <p className="text-sm text-green-700">
                Número de cuenta: {numeroCuenta}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de traslado */}
      {cuentaId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Información del Traslado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ciudad_destino">
                  Ciudad Destino <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={ciudadDestino}
                  onValueChange={setCiudadDestino}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="ciudad_destino">
                    <SelectValue placeholder="Seleccione la ciudad destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {CIUDADES.map((ciudad) => (
                      <SelectItem key={ciudad.value} value={ciudad.value}>
                        {ciudad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_tramite">
                  Fecha del Trámite <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_tramite"
                  type="date"
                  value={fechaTramite}
                  onChange={(e) => setFechaTramite(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El proceso vencerá 60 días después de esta fecha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ingrese observaciones adicionales (opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={loading}
                  rows={4}
                />
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
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Iniciar Traslado
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
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Información importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• El vehículo no debe tener procesos activos</p>
          <p>• El proceso iniciará en estado "Enviado a organismo destino"</p>
          <p>• El plazo de vencimiento es de 60 días calendario</p>
          <p>• Si el último proceso fue radicación completada, puede iniciar traslado</p>
        </CardContent>
      </Card>
    </div>
  )
}
