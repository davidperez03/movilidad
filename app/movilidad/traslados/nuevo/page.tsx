"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, ArrowRightLeft, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { getTodayForInput, formatDateForDB } from "@/lib/utils"
import { ModalProcesoActivo } from "@/components/movilidad/modal-proceso-activo"
import { ModalErrorSecuencia } from "@/components/movilidad/modal-error-secuencia"
import { ComboboxOrganismos } from "@/components/movilidad/combobox-organismos"
import { RequierePermiso } from "@/components/movilidad/requiere-permiso"

interface Organismo {
  id: string
  nombre: string
  municipio: string
  departamento: string
}

function NuevoTrasladoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [placa, setPlaca] = useState(searchParams.get("placa") || "")
  const [cuentaId, setCuentaId] = useState<string | null>(null)
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [organismoDestinoId, setOrganismoDestinoId] = useState("")
  const [organismos, setOrganismos] = useState<Organismo[]>([])
  const [cargandoOrganismos, setCargandoOrganismos] = useState(true)
  const [fechaTramite, setFechaTramite] = useState(getTodayForInput())
  const [observaciones, setObservaciones] = useState("")
  const [modalProcesoActivo, setModalProcesoActivo] = useState(false)
  const [razonRechazo, setRazonRechazo] = useState("")
  const [modalErrorSecuencia, setModalErrorSecuencia] = useState(false)
  const [errorSecuenciaMsg, setErrorSecuenciaMsg] = useState("")

  // Cargar organismos de tránsito
  useEffect(() => {
    const cargarOrganismos = async () => {
      try {
        const { data, error } = await supabase
          .from("mov_organismos_transito")
          .select("id, nombre, municipio, departamento")
          .eq("activo", true)
          .order("nombre")

        if (error) {
          console.error("Error al cargar organismos:", error)
          toast.error("Error al cargar organismos de tránsito")
          return
        }

        setOrganismos(data || [])
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar organismos")
      } finally {
        setCargandoOrganismos(false)
      }
    }

    cargarOrganismos()
  }, [])

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
        setRazonRechazo(validacion[0].razon)
        setModalProcesoActivo(true)
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

      if (!organismoDestinoId) {
        toast.error("Debe seleccionar el organismo destino")
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
          organismo_destino_id: organismoDestinoId,
          fecha_tramite: formatDateForDB(fechaTramite),
          observaciones: observaciones.trim() || null,
          creado_por: user.id,
          actualizado_por: user.id,
        })
        .select()
        .single()

      if (error) {
        // Verificar si es un error de secuencia de procesos (código P0001)
        if (error.code === "P0001" && error.message) {
          setErrorSecuenciaMsg(error.message)
          setModalErrorSecuencia(true)
        } else {
          console.error("Error al crear traslado:", error)
          toast.error("Error al crear el traslado: " + error.message)
        }

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
                <Label htmlFor="organismo_destino">
                  Organismo Destino <span className="text-red-500">*</span>
                </Label>
                <ComboboxOrganismos
                  organismos={organismos}
                  value={organismoDestinoId}
                  onValueChange={setOrganismoDestinoId}
                  disabled={loading || cargandoOrganismos}
                  placeholder={cargandoOrganismos ? "Cargando organismos..." : "Seleccione el organismo destino"}
                  searchPlaceholder="Buscar por nombre, municipio o departamento..."
                  emptyMessage="No se encontró el organismo."
                />
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
                  El proceso vencerá 60 días hábiles después de esta fecha
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

      <ModalProcesoActivo
        open={modalProcesoActivo}
        onOpenChange={setModalProcesoActivo}
        placa={placa}
        razon={razonRechazo}
      />

      <ModalErrorSecuencia
        open={modalErrorSecuencia}
        onOpenChange={setModalErrorSecuencia}
        placa={placa}
        errorMessage={errorSecuenciaMsg}
        procesoIntentado="traslado"
      />
    </div>
  )
}

export default function NuevoTrasladoPage() {
  return (
    <RequierePermiso permiso="crear_traslados">
      <NuevoTrasladoForm />
    </RequierePermiso>
  )
}
