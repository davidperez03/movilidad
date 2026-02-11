"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateLong, formatDateForDisplay } from "@/lib/utils"
import { Car, Search, Loader2, AlertCircle, Calendar, MapPin, Clock, FileText, Truck, Package } from "lucide-react"
import Link from "next/link"
import { ProcessTimeline } from "@/components/consulta/process-timeline"

interface ProcesoInfo {
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: "traslado" | "radicacion" | null
  proceso_estado: string | null
  fecha_tramite: string | null
  fecha_vencimiento: string | null
  fecha_completado: string | null
  dias_restantes: number | null
  ciudad: string | null
  observaciones: string | null
  empresa_transporte: string | null
  numero_guia: string | null
}

export default function ConsultaPublicaPage() {
  const [placa, setPlaca] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ProcesoInfo | null>(null)
  const supabase = createClient()

  const handleConsulta = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const placaLimpia = placa.trim().toUpperCase()

      // Buscar en la vista pública de consultas
      const { data, error: queryError } = await supabase
        .from("mov_vista_consulta_publica")
        .select("*")
        .eq("placa", placaLimpia)
        .single()

      if (queryError) {
        if (queryError.code === "PGRST116") {
          setError("No se encontró ningún vehículo con esa placa")
        } else {
          setError("Error al consultar: " + queryError.message)
        }
        return
      }

      setResultado(data as ProcesoInfo)
    } catch (err) {
      setError("Error inesperado al realizar la consulta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Movilidad</span>
          </div>
          <Link href="/auth/login">
            <Button variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Consulta el Estado de tu Trámite
            </h1>
            <p className="text-lg text-muted-foreground">
              Ingresa la placa de tu vehículo para conocer el estado actual del proceso
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Buscar Vehículo</CardTitle>
              <CardDescription>
                Ingresa la placa del vehículo sin espacios ni guiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConsulta} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa del Vehículo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="placa"
                      type="text"
                      placeholder="Ej: ABC123"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      disabled={loading}
                      className="text-lg font-plate"
                      maxLength={10}
                      required
                    />
                    <Button type="submit" disabled={loading} size="lg">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive bg-destructive/5 mb-8">
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {resultado && (
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Header con placa centrada */}
                <div className="text-center pb-4 border-b">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-plate">{resultado.placa}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cuenta: <span className="font-mono font-medium text-foreground">{resultado.numero_cuenta}</span>
                  </p>
                </div>

                {/* Info básica en grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Tipo de Servicio</p>
                    <p className="font-semibold capitalize">{resultado.tipo_servicio}</p>
                  </div>
                  {resultado.proceso_tipo && (
                    <div className="text-center p-4 rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Tipo de Proceso</p>
                      <p className="font-semibold">
                        {resultado.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}
                      </p>
                    </div>
                  )}
                </div>

                {resultado.proceso_tipo && resultado.proceso_estado ? (
                  <>
                    <Separator />

                    {/* Timeline del proceso */}
                    <div>
                      <p className="text-sm font-medium mb-4">Estado del Proceso</p>
                      <ProcessTimeline
                        tipo={resultado.proceso_tipo}
                        estadoActual={resultado.proceso_estado}
                      />
                    </div>

                    <Separator />

                    {/* Información del trámite */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {resultado.ciudad && (
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {resultado.proceso_tipo === "traslado" ? "Destino" : "Origen"}
                            </p>
                            <p className="font-medium">{resultado.ciudad}</p>
                          </div>
                        </div>
                      )}

                      {resultado.fecha_tramite && (
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Trámite</p>
                            <p className="font-medium">{formatDateForDisplay(resultado.fecha_tramite)}</p>
                          </div>
                        </div>
                      )}

                      {resultado.fecha_vencimiento && !resultado.fecha_completado && (
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Vencimiento</p>
                            <p className="font-medium">{formatDateForDisplay(resultado.fecha_vencimiento)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Información de transporte (solo para traslados enviados) */}
                    {resultado.proceso_tipo === "traslado" &&
                     resultado.proceso_estado === "enviado_organismo" &&
                     (resultado.empresa_transporte || resultado.numero_guia) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resultado.empresa_transporte && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Truck className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Empresa Transportadora</p>
                              <p className="font-medium">{resultado.empresa_transporte}</p>
                            </div>
                          </div>
                        )}
                        {resultado.numero_guia && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Package className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Número de Guía</p>
                              <p className="font-medium font-mono">{resultado.numero_guia}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Días restantes o completado */}
                    {resultado.fecha_completado ? (
                      <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                            Proceso Completado
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {formatDateLong(resultado.fecha_completado)}
                          </p>
                        </div>
                      </div>
                    ) : resultado.dias_restantes !== null && resultado.proceso_estado !== "con_novedades" && resultado.proceso_estado !== "devuelto" && (
                      <div className={`flex items-center justify-between p-4 rounded-lg border ${
                        resultado.dias_restantes <= 7
                          ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                          : resultado.dias_restantes <= 15
                          ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                          : "bg-muted/50 border-border"
                      }`}>
                        <div>
                          <p className={`text-sm ${
                            resultado.dias_restantes <= 7
                              ? "text-red-600 dark:text-red-400"
                              : resultado.dias_restantes <= 15
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-muted-foreground"
                          }`}>
                            Tiempo restante para vencimiento
                          </p>
                          {resultado.dias_restantes <= 7 && (
                            <p className="text-xs text-red-500 mt-1">Se requiere atención urgente</p>
                          )}
                        </div>
                        <div className={`text-4xl font-bold ${
                          resultado.dias_restantes <= 7
                            ? "text-red-700 dark:text-red-300"
                            : resultado.dias_restantes <= 15
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-foreground"
                        }`}>
                          {resultado.dias_restantes} <span className="text-lg font-normal">días</span>
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {resultado.observaciones && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Observaciones
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {resultado.observaciones}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Car className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg font-medium">Sin procesos activos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Este vehículo no tiene trámites en curso
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Si tienes alguna pregunta o necesitas más información,{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                inicia sesión
              </Link>{" "}
              para más opciones o acercarte a nuestras oficinas en Yopal.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
