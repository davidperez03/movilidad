"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDateShort, formatDateLong } from "@/lib/utils"
import { Car, Search, Loader2, AlertCircle, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    const colores: Record<string, string> = {
      sin_asignar: "bg-gray-500",
      revisado: "bg-blue-500",
      con_novedades: "bg-yellow-500",
      enviado_organismo: "bg-purple-500",
      trasladado: "bg-green-500",
      recibido: "bg-cyan-500",
      pendiente_radicar: "bg-orange-500",
      radicado: "bg-green-500",
      devuelto: "bg-red-500",
    }
    return colores[estado] || "bg-gray-500"
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      sin_asignar: "Sin Asignar",
      revisado: "Revisado",
      con_novedades: "Con Novedades",
      enviado_organismo: "Enviado a Organismo",
      trasladado: "Trasladado",
      recibido: "Recibido",
      pendiente_radicar: "Pendiente Radicar",
      radicado: "Radicado",
      devuelto: "Devuelto",
    }
    return labels[estado] || estado
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
                      className="text-lg font-mono uppercase"
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Vehículo Encontrado</CardTitle>
                    <CardDescription>Información del trámite en proceso</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold font-mono">{resultado.placa}</div>
                    <div className="text-sm text-muted-foreground">
                      Cuenta: {resultado.numero_cuenta}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo de Servicio */}
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Servicio</Label>
                  <p className="text-lg font-medium capitalize">{resultado.tipo_servicio}</p>
                </div>

                <Separator />

                {/* Estado del Proceso */}
                {resultado.proceso_tipo ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Tipo de Proceso</Label>
                      <p className="text-lg font-medium capitalize">
                        {resultado.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Estado Actual</Label>
                      <div className="mt-1">
                        <Badge className={`${getEstadoBadgeColor(resultado.proceso_estado!)} text-white`}>
                          {getEstadoLabel(resultado.proceso_estado!)}
                        </Badge>
                      </div>
                    </div>

                    {resultado.ciudad && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {resultado.proceso_tipo === "traslado" ? "Organismo Destino" : "Organismo Origen"}
                          </Label>
                          <p className="font-medium">
                            {resultado.ciudad}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {resultado.fecha_tramite && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <Label className="text-xs text-muted-foreground">Fecha de Trámite</Label>
                            <p className="font-medium">
                              {formatDateShort(resultado.fecha_tramite)}
                            </p>
                          </div>
                        </div>
                      )}

                      {resultado.fecha_vencimiento && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <Label className="text-xs text-muted-foreground">Fecha de Vencimiento</Label>
                            <p className="font-medium">
                              {formatDateShort(resultado.fecha_vencimiento)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {resultado.fecha_completado ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                            Proceso Completado
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {formatDateLong(resultado.fecha_completado)}
                          </div>
                        </div>
                      </div>
                    ) : resultado.dias_restantes !== null && (
                      <div className={`rounded-lg p-4 ${
                        resultado.dias_restantes <= 7
                          ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                          : resultado.dias_restantes <= 15
                          ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"
                          : "bg-muted"
                      }`}>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            resultado.dias_restantes <= 7
                              ? "text-red-700 dark:text-red-300"
                              : resultado.dias_restantes <= 15
                              ? "text-yellow-700 dark:text-yellow-300"
                              : ""
                          }`}>
                            {resultado.dias_restantes}
                          </div>
                          <div className={`text-sm ${
                            resultado.dias_restantes <= 7
                              ? "text-red-600 dark:text-red-400"
                              : resultado.dias_restantes <= 15
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-muted-foreground"
                          }`}>
                            días restantes para vencimiento
                          </div>
                          {resultado.dias_restantes <= 7 && (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                              ⚠️ Próximo a vencer
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {resultado.observaciones && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                        <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Observaciones / Comentarios
                        </Label>
                        <p className="mt-2 text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {resultado.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Este vehículo no tiene procesos activos en este momento</p>
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
