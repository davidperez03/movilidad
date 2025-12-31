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
  const [fechaTramite, setFechaTramite] = useState(getTodayForInput())
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
    setLoading(true)

    try {
      if (!cuentaId) {
        toast.error("Debe buscar y seleccionar un vehículo válido")
        setLoading(false)
        return
      }

      if (!organismoId) {
        toast.error(`Debe seleccionar el ${config.organismoLabel.toLowerCase()}`)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("No hay sesión activa")
        setLoading(false)
        return
      }

      // Crear el proceso (radicación o traslado)
      const { data, error } = await supabase
        .from(config.tabla)
        .insert({
          cuenta_id: cuentaId,
          [config.organismoField]: organismoId,
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
        <Button asChild variant="ghost" size="sm">
          <Link href={volverUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{config.labels.nuevo}</h1>
          <p className="text-muted-foreground">
            Inicia el proceso de {tipo} de un vehículo
          </p>
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
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-900">
                Vehículo encontrado: {placaActual}
              </p>
              <p className="text-sm text-green-700">
                Número de cuenta: {numeroCuenta}
              </p>
            </div>
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
                  onValueChange={setOrganismoId}
                  disabled={loading || cargandoOrganismos}
                  placeholder={cargandoOrganismos ? "Cargando organismos..." : `Seleccione el ${config.organismoLabel.toLowerCase()}`}
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
                      <Icono className="h-4 w-4 mr-2" />
                      {config.labels.iniciar}
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
