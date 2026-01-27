"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { getTodayForInput, formatDateForDB } from "@/lib/utils"
import { AlertBox } from "@/components/ui/alert-box"
import { SubmitButton } from "@/components/ui/submit-button"
import { ModalProcesoActivo } from "@/components/movilidad/modals/modal-proceso-activo"
import { ModalErrorSecuencia } from "@/components/movilidad/modals/modal-error-secuencia"
import { ComboboxOrganismos } from "@/components/movilidad/shared/combobox-organismos"
import { useOrganismos } from "@/lib/hooks/use-organismos"
import { useBuscarVehiculo } from "@/lib/hooks/use-buscar-vehiculo"
import { CONFIG_PROCESO, type TipoProceso } from "@/lib/movilidad/config"

interface FormularioProcesoProps {
  tipo: TipoProceso
}

export function FormularioProceso({ tipo }: FormularioProcesoProps) {
  const config = CONFIG_PROCESO[tipo]
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { organismos, cargando: cargandoOrganismos, error: errorOrganismos } = useOrganismos()
  const {
    cuentaId,
    numeroCuenta,
    placaActual,
    buscando,
    modalProcesoActivo,
    razonRechazo,
    buscarCuenta,
    cerrarModalProcesoActivo,
  } = useBuscarVehiculo(tipo)

  const [loading, setLoading] = useState(false)
  const [placa, setPlaca] = useState(searchParams.get("placa") || "")
  const [organismoId, setOrganismoId] = useState("")
  const [organismoTouched, setOrganismoTouched] = useState(false)
  const [fechaTramite, setFechaTramite] = useState(getTodayForInput())
  const [fechaTouched, setFechaTouched] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [modalErrorSecuencia, setModalErrorSecuencia] = useState(false)
  const [errorSecuenciaMsg, setErrorSecuenciaMsg] = useState("")
  const placaBuscadaRef = useRef<string | null>(null)

  // Mostrar error de carga de organismos si existe
  useEffect(() => {
    if (errorOrganismos) {
      toast.error(errorOrganismos)
    }
  }, [errorOrganismos])

  // Buscar cuenta al cargar si viene placa en params (solo una vez por placa)
  useEffect(() => {
    const placaParam = searchParams.get("placa")
    if (placaParam && placaParam !== placaBuscadaRef.current) {
      placaBuscadaRef.current = placaParam
      buscarCuenta(placaParam)
    }
  }, [searchParams, buscarCuenta])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos los campos
    setOrganismoTouched(true)

    if (!cuentaId) {
      toast.error("Debe buscar y seleccionar un vehículo válido")
      return
    }

    if (!organismoId) {
      toast.error(`Debe seleccionar el ${config.organismoLabel.toLowerCase()}`)
      return
    }

    // Solo validar fecha para radicaciones
    if (tipo === 'radicacion') {
      setFechaTouched(true)
      if (!fechaTramite) {
        toast.error("Debe seleccionar la fecha del trámite")
        return
      }
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      // Crear el proceso (radicación o traslado)
      const insertData: Record<string, unknown> = {
        cuenta_id: cuentaId,
        [config.organismoField]: organismoId,
        observaciones: observaciones.trim() || null,
        creado_por: user.id,
        actualizado_por: user.id,
      }

      // Solo incluir fecha_tramite para radicaciones
      if (tipo === 'radicacion') {
        insertData.fecha_tramite = formatDateForDB(fechaTramite)
      }

      const { data, error } = await supabase
        .from(config.tabla)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        // Verificar si es un error de secuencia de procesos (código P0001)
        if (error.code === "P0001" && error.message) {
          setErrorSecuenciaMsg(error.message)
          setModalErrorSecuencia(true)
        } else {
          toast.error(`Error al crear ${config.labels.singular.toLowerCase()}: ` + error.message)
        }

        setLoading(false)
        return
      }

      toast.success(`${config.labels.singular} ${tipo === 'radicacion' ? 'iniciada' : 'iniciado'} exitosamente`)
      router.push(`/movilidad/vehiculos/${placaActual}`)
    } catch (error) {
      toast.error(`Error inesperado al crear ${config.labels.singular.toLowerCase()}`)
      setLoading(false)
    }
  }

  const Icono = config.icono
  const volverUrl = `/movilidad/${tipo === 'radicacion' ? 'radicaciones' : 'traslados'}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={volverUrl}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.labels.nuevo}</h1>
          <p className="text-muted-foreground">Crear {tipo}</p>
        </div>
      </div>

      {/* Búsqueda de vehículo */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Vehículo</CardTitle>
          <CardDescription>
            Ingrese la placa del vehículo para iniciar {tipo === 'radicacion' ? 'la radicación' : 'el traslado'}
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
            <AlertBox variant="success" title={`Vehículo encontrado: ${placaActual}`} className="mt-4">
              Número de cuenta: {numeroCuenta}
            </AlertBox>
          )}
        </CardContent>
      </Card>

      {/* Formulario del proceso */}
      {cuentaId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icono className="h-5 w-5" />
              Información {tipo === 'radicacion' ? 'de la Radicación' : 'del Traslado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organismo">
                  {config.organismoLabel} <span className="text-red-500">*</span>
                </Label>
                <ComboboxOrganismos
                  organismos={organismos}
                  value={organismoId}
                  onValueChange={(value) => {
                    setOrganismoId(value)
                    setOrganismoTouched(true)
                  }}
                  disabled={loading || cargandoOrganismos}
                  placeholder={cargandoOrganismos ? "Cargando organismos..." : `Seleccione el ${config.organismoLabel.toLowerCase()}`}
                  searchPlaceholder="Buscar por nombre, municipio o departamento..."
                  emptyMessage="No se encontró el organismo."
                  className={organismoTouched && !organismoId ? "border-destructive" : ""}
                />
                {organismoTouched && !organismoId && (
                  <p className="text-xs text-destructive">Debe seleccionar el {config.organismoLabel.toLowerCase()}</p>
                )}
              </div>

              {tipo === 'radicacion' && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_tramite">
                    Fecha del Trámite <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fecha_tramite"
                    type="date"
                    value={fechaTramite}
                    onChange={(e) => {
                      setFechaTramite(e.target.value)
                      setFechaTouched(true)
                    }}
                    onBlur={() => setFechaTouched(true)}
                    disabled={loading}
                    required
                    className={fechaTouched && !fechaTramite ? "border-destructive" : ""}
                  />
                  {fechaTouched && !fechaTramite ? (
                    <p className="text-xs text-destructive">Debe seleccionar la fecha del trámite</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      El proceso vencerá 60 días hábiles después de esta fecha
                    </p>
                  )}
                </div>
              )}

              {tipo === 'traslado' && (
                <AlertBox variant="info" title="Información">
                  Los 60 días hábiles de vencimiento empezarán a contar cuando el trámite sea aprobado.
                </AlertBox>
              )}

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
                <SubmitButton
                  loading={loading}
                  loadingText="Creando..."
                  icon={Icono}
                  className="flex-1"
                >
                  {config.labels.iniciar}
                </SubmitButton>
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
        onOpenChange={cerrarModalProcesoActivo}
        placa={placa || placaActual}
        razon={razonRechazo}
      />

      <ModalErrorSecuencia
        open={modalErrorSecuencia}
        onOpenChange={setModalErrorSecuencia}
        placa={placaActual || placa}
        errorMessage={errorSecuenciaMsg}
        procesoIntentado={tipo}
      />
    </div>
  )
}
