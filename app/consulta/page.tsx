"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateLong, formatDateForDisplay } from "@/lib/utils"
import { calcularDiasVencidosCalendario, formatearEstadoProceso, formatearVencidoHace } from "@/lib/movilidad/formatters"
import { Car, Search, Loader2, AlertCircle, Calendar, MapPin, Clock, Truck, Package, CheckCircle2, XCircle, SearchX, RotateCcw } from "lucide-react"
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
  solicitante_notificado: boolean | null
  notificado_en: string | null
  empresa_transporte: string | null
  numero_guia: string | null
}

export default function ConsultaPublicaPage() {
  const [placa, setPlaca] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ProcesoInfo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleConsulta = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const placaLimpia = placa.trim().toUpperCase()

      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: placaLimpia }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Error al consultar")
        return
      }

      setResultado(json.data as ProcesoInfo)
    } catch (err) {
      console.error("Error en consulta pública:", err)
      setError("Error inesperado al realizar la consulta")
    } finally {
      setLoading(false)
    }
  }

  const diasHabilesRestantes = resultado?.dias_restantes ?? null

  const diasVencidosCalendario = resultado?.fecha_vencimiento
    ? Math.max(calcularDiasVencidosCalendario(resultado.fecha_vencimiento), 1)
    : Math.max(Math.abs(resultado?.dias_restantes ?? 0), 1)

  const estadoFinalizado = Boolean(
    resultado?.proceso_estado &&
    ["trasladado", "radicado", "devuelto"].includes(resultado.proceso_estado)
  )

  const mensajeEstado = (() => {
    if (!resultado?.proceso_estado) return null
    if (resultado.fecha_completado) {
      return {
        titulo: "Trámite finalizado",
        detalle: "Este proceso ya fue completado exitosamente.",
        clase: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
      }
    }
    if (resultado.proceso_estado === "devuelto") {
      return {
        titulo: "Trámite devuelto",
        detalle: "El proceso fue devuelto. Revisa los detalles para conocer el motivo y la guía de envío.",
        clase: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
      }
    }
    if (resultado.proceso_estado === "enviado_devolucion") {
      return {
        titulo: "Enviado para devolución",
        detalle: "El proceso está en etapa de devolución. Verifica empresa transportadora y número de guía.",
        clase: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200",
      }
    }
    if (resultado.proceso_estado === "con_novedades") {
      return {
        titulo: "Proceso con novedades",
        detalle: "El trámite tiene novedades pendientes de gestión.",
        clase: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200",
      }
    }
    return {
      titulo: "Proceso en curso",
      detalle: "Tu trámite continúa en gestión.",
      clase: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
    }
  })()

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
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      ref={inputRef}
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
                    <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
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
          {error && (() => {
            const isRegisteredNoProcesses = error.includes("registrado pero no tiene")
            const isNotFound = error.includes("No se encontró")
            const isServerError = !isRegisteredNoProcesses && !isNotFound

            const config = isRegisteredNoProcesses
              ? {
                  icon: Car,
                  secondIcon: CheckCircle2,
                  title: "Vehículo sin trámites",
                  subtitle: "El vehículo está registrado pero no tiene procesos en curso ni completados.",
                  suggestion: "Si esperas un trámite activo, acércate a nuestras oficinas.",
                  bgClass: "from-blue-50 to-sky-50 dark:from-blue-950/50 dark:to-sky-950/50",
                  borderClass: "border-blue-200 dark:border-blue-800",
                  iconBgClass: "bg-blue-100 dark:bg-blue-900",
                  iconClass: "text-blue-600 dark:text-blue-400",
                  titleClass: "text-blue-900 dark:text-blue-100",
                  textClass: "text-blue-700 dark:text-blue-300",
                }
              : isNotFound
              ? {
                  icon: SearchX,
                  secondIcon: null,
                  title: "Vehículo no encontrado",
                  subtitle: "No encontramos ningún vehículo con esa placa en nuestro sistema.",
                  suggestion: "Verifica que la placa esté escrita correctamente, sin espacios ni guiones.",
                  bgClass: "from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50",
                  borderClass: "border-amber-200 dark:border-amber-800",
                  iconBgClass: "bg-amber-100 dark:bg-amber-900",
                  iconClass: "text-amber-600 dark:text-amber-400",
                  titleClass: "text-amber-900 dark:text-amber-100",
                  textClass: "text-amber-700 dark:text-amber-300",
                }
              : {
                  icon: AlertCircle,
                  secondIcon: null,
                  title: "Error en la consulta",
                  subtitle: error,
                  suggestion: "Intenta de nuevo en unos momentos. Si el problema persiste, contacta soporte.",
                  bgClass: "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50",
                  borderClass: "border-red-200 dark:border-red-800",
                  iconBgClass: "bg-red-100 dark:bg-red-900",
                  iconClass: "text-red-600 dark:text-red-400",
                  titleClass: "text-red-900 dark:text-red-100",
                  textClass: "text-red-700 dark:text-red-300",
                }

            const Icon = config.icon
            const SecondIcon = config.secondIcon

            return (
              <div className={`mb-8 rounded-xl border ${config.borderClass} bg-gradient-to-br ${config.bgClass} p-6 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBgClass}`}>
                    <Icon className={`h-8 w-8 ${config.iconClass}`} />
                    {SecondIcon && (
                      <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm`}>
                        <SecondIcon className={`h-4 w-4 ${config.iconClass}`} />
                      </div>
                    )}
                  </div>
                  <h3 className={`text-lg font-semibold ${config.titleClass}`}>
                    {config.title}
                  </h3>
                  <p className={`mt-1 text-sm ${config.textClass}`}>
                    {config.subtitle}
                  </p>
                  <p className={`mt-2 text-xs ${config.textClass} opacity-75`}>
                    {config.suggestion}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setPlaca("")
                      setError(null)
                      setResultado(null)
                      setTimeout(() => inputRef.current?.focus(), 100)
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Intentar de nuevo
                  </Button>
                </div>
              </div>
            )
          })()}

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
                  {resultado.proceso_tipo && resultado.proceso_estado && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        Último proceso: {resultado.proceso_tipo}
                      </Badge>
                      <Badge>
                        {formatearEstadoProceso(resultado.proceso_estado)}
                      </Badge>
                    </div>
                  )}
                </div>

                {mensajeEstado && (
                  <div className={`rounded-lg border px-4 py-3 ${mensajeEstado.clase}`}>
                    <p className="text-sm font-semibold">{mensajeEstado.titulo}</p>
                    <p className="text-xs mt-1 opacity-90">{mensajeEstado.detalle}</p>
                  </div>
                )}

                {/* Info básica en grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div>
                      <p className="text-sm font-medium mb-4">Estado del Proceso</p>
                      <ProcessTimeline
                        tipo={resultado.proceso_tipo}
                        estadoActual={resultado.proceso_estado}
                      />
                    </div>

                    {resultado.fecha_completado ? (
                      <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-center">
                          <p className="text-base font-semibold text-green-700 dark:text-green-300">
                            Proceso Completado
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {formatDateLong(resultado.fecha_completado)}
                          </p>
                        </div>
                      </div>
                    ) : !estadoFinalizado && diasHabilesRestantes !== null && (
                      <div className={`flex items-center justify-between p-4 rounded-lg border ${
                        diasHabilesRestantes < 0
                          ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700"
                          : diasHabilesRestantes <= 7
                          ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                          : diasHabilesRestantes <= 15
                          ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                          : "bg-muted/50 border-border"
                      }`}>
                        <div>
                          <p className={`text-sm ${
                            diasHabilesRestantes < 0
                              ? "text-red-700 dark:text-red-300"
                              : diasHabilesRestantes <= 7
                              ? "text-red-600 dark:text-red-400"
                              : diasHabilesRestantes <= 15
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-muted-foreground"
                          }`}>
                            {diasHabilesRestantes < 0 ? "Proceso vencido" : "Tiempo restante para vencimiento"}
                          </p>
                          {diasHabilesRestantes < 0 && (
                            <p className="text-xs text-red-600 mt-1">
                              {formatearVencidoHace(diasVencidosCalendario)}
                            </p>
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${
                          diasHabilesRestantes < 0
                            ? "text-red-800 dark:text-red-200"
                            : diasHabilesRestantes <= 7
                            ? "text-red-700 dark:text-red-300"
                            : diasHabilesRestantes <= 15
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-foreground"
                        }`}>
                          {diasHabilesRestantes < 0 ? diasVencidosCalendario : diasHabilesRestantes}{' '}
                          <span className="text-sm font-normal">{diasHabilesRestantes < 0 ? 'días' : 'días hábiles'}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resultado.ciudad && (
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {resultado.proceso_tipo === "traslado" ? "Destino" : "Origen"}
                            </p>
                            <p className="font-medium text-sm">{resultado.ciudad}</p>
                          </div>
                        </div>
                      )}

                      {resultado.fecha_tramite && (
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Calendar className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha Trámite</p>
                            <p className="font-medium text-sm">{formatDateForDisplay(resultado.fecha_tramite)}</p>
                          </div>
                        </div>
                      )}

                      {resultado.proceso_tipo === "radicacion" && (
                        <div className="sm:col-span-2 rounded-xl border bg-card/80 p-3 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {resultado.solicitante_notificado ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <p className="text-xs font-medium text-muted-foreground">Notificación al solicitante</p>
                            </div>
                            <Badge variant={resultado.solicitante_notificado ? "secondary" : "outline"}>
                              {resultado.solicitante_notificado ? "Notificado" : "Pendiente"}
                            </Badge>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                              <p className="text-[11px] text-muted-foreground">Estado</p>
                              <p className="text-sm font-medium">
                                {resultado.solicitante_notificado ? "Sí" : "No"}
                              </p>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                              <p className="text-[11px] text-muted-foreground">Fecha de notificación</p>
                              <p className="text-sm font-medium">
                                {resultado.notificado_en
                                  ? formatDateLong(resultado.notificado_en)
                                  : "Sin fecha registrada"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {resultado.fecha_vencimiento && !estadoFinalizado && (
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Clock className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vencimiento</p>
                          <p className="font-medium text-sm">{formatDateForDisplay(resultado.fecha_vencimiento)}</p>
                        </div>
                      </div>
                    )}

                    {resultado.proceso_tipo === "traslado" &&
                     resultado.proceso_estado === "enviado_organismo" &&
                     (resultado.empresa_transporte || resultado.numero_guia) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resultado.empresa_transporte && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Truck className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Empresa Transportadora</p>
                              <p className="font-medium text-sm">{resultado.empresa_transporte}</p>
                            </div>
                          </div>
                        )}
                        {resultado.numero_guia && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Package className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Número de Guía</p>
                              <p className="font-medium font-mono text-sm">{resultado.numero_guia}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {resultado.proceso_tipo === "radicacion" &&
                     (resultado.proceso_estado === "enviado_devolucion" || resultado.proceso_estado === "devuelto") &&
                     (resultado.empresa_transporte || resultado.numero_guia) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resultado.empresa_transporte && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Truck className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Empresa Transportadora</p>
                              <p className="font-medium text-sm">{resultado.empresa_transporte}</p>
                            </div>
                          </div>
                        )}
                        {resultado.numero_guia && (
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <Package className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Número de Guía</p>
                              <p className="font-medium font-mono text-sm">{resultado.numero_guia}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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
