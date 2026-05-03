'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, Globe, Monitor, ArrowRight, Database, AlertCircle, AlertTriangle, Info, History } from 'lucide-react'
import type { RegistroAuditoria } from '@/app/superadmin/auditoria/auditoria-columns'
import { getDescripcion, getCat, getSeveridad, getAfectado, SEV_CONFIG } from '@/app/superadmin/auditoria/auditoria-columns'
import { capitalizeName } from '@/lib/utils/capitalize'
import { HistorialEntidad } from './historial-entidad'

interface DetalleAuditoriaProps {
  registro: RegistroAuditoria | null
  open: boolean
  onClose: () => void
}

function formatFechaCompleta(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getModuloLabel(modulo: string): string {
  const labels: Record<string, string> = {
    sistema: 'Sistema',
    movilidad: 'Movilidad',
    parqueadero: 'Parqueadero',
  }
  return labels[modulo] ?? modulo
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Desconocido'
  const mobile = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')
  let browser = 'Navegador desconocido'
  if (ua.includes('Edg/')) browser = 'Microsoft Edge'
  else if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Google Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera'

  let os = ''
  if (ua.includes('Windows NT')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  const parts = [browser, os, mobile ? '(Móvil)' : ''].filter(Boolean)
  return parts.join(' · ')
}

// Mapa de claves técnicas a etiquetas legibles
const LABELS: Record<string, string> = {
  correo: 'Correo',
  correo_anterior: 'Correo anterior',
  correo_nuevo: 'Correo nuevo',
  nombre_completo: 'Nombre',
  nombre_anterior: 'Nombre anterior',
  nombre_nuevo: 'Nombre nuevo',
  rol_global: 'Rol global',
  rol_anterior: 'Rol anterior',
  rol_nuevo: 'Rol nuevo',
  rol_nombre: 'Nombre del rol',
  rol_codigo: 'Código del rol',
  rol_nivel: 'Nivel del rol',
  modulo_id: 'Módulo',
  dispositivo: 'Dispositivo',
  razon: 'Razón',
  razon_suspension: 'Motivo de suspensión',
  activo: 'Estado',
  numero_cuenta: 'N° Cuenta',
  tipo_servicio: 'Tipo de servicio',
  placa: 'Placa',
  marca: 'Marca',
  modelo: 'Modelo',
  turno: 'Turno',
  consecutivo: 'Consecutivo',
  es_apto: 'Resultado inspección',
  item_nombre: 'Ítem',
  observacion: 'Observación',
  observacion_subsanacion: 'Observación de subsanación',
  sesiones_cerradas: 'Sesiones cerradas',
  fecha_tramite: 'Fecha de trámite',
  estado_anterior: 'Estado anterior',
  nuevo_estado: 'Estado nuevo',
  tipo_novedad: 'Tipo de novedad',
  descripcion: 'Descripción',
  soat_vencimiento_nuevo: 'SOAT vencimiento',
  tecno_vencimiento_nuevo: 'Tecno. vencimiento',
  placa_anterior: 'Placa anterior',
  placa_nueva: 'Placa nueva',
  licencia_numero: 'N° Licencia',
  licencia_categoria_nueva: 'Categoría licencia',
  licencia_vencimiento_nueva: 'Vencimiento licencia',
  nombre: 'Nombre',
  activo_anterior: 'Estado anterior',
  activo_nuevo: 'Estado nuevo',
  asignado_por: 'Asignado por',
}

function renderDetalles(detalles: Record<string, unknown>): [string, string][] {
  const entries: [string, string][] = []
  const skip = new Set(['usuario_id', 'rol_id', 'rol_anterior_codigo', 'rol_nuevo_codigo'])
  for (const [key, value] of Object.entries(detalles)) {
    if (skip.has(key)) continue
    if (value === null || value === undefined || value === '') continue
    const label = LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    let val = typeof value === 'object' ? JSON.stringify(value) : String(value)
    if (key === 'es_apto') val = value === true || value === 'true' ? 'Apto' : 'No Apto'
    if (key === 'activo' || key === 'activo_anterior' || key === 'activo_nuevo') val = value === true || value === 'true' ? 'Activo' : 'Inactivo'
    entries.push([label, val])
  }
  return entries
}

function SeveridadIcon({ accion }: { accion: string }) {
  const sev = getSeveridad(accion)
  const cfg = SEV_CONFIG[sev]
  if (sev === 'critica') return <AlertCircle className={`h-4 w-4 ${cfg.text}`} />
  if (sev === 'alta') return <AlertTriangle className={`h-4 w-4 ${cfg.text}`} />
  if (sev === 'media') return <Info className={`h-4 w-4 ${cfg.text}`} />
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
}

export function DetalleAuditoria({ registro, open, onClose }: DetalleAuditoriaProps) {
  const [historialAbierto, setHistorialAbierto] = useState(false)

  if (!registro) return null

  const cat = getCat(registro.accion)
  const sev = getSeveridad(registro.accion)
  const sevCfg = SEV_CONFIG[sev]
  const desc = getDescripcion(registro)
  const afectado = getAfectado(registro)
  const detallesEntries = renderDetalles(registro.detalles)
  const tieneValores = registro.valor_anterior || registro.valor_nuevo

  return (
    <>
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SeveridadIcon accion={registro.accion} />
            Detalle del registro
            <span className={`ml-auto text-xs font-normal ${sevCfg.text}`}>{sevCfg.label}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-5 space-y-5">

          {/* 1. Qué pasó */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${cat.color} text-xs font-medium`}>{cat.label}</Badge>
              <Badge variant="outline" className="text-xs">{getModuloLabel(registro.modulo)}</Badge>
            </div>
            <p className="text-sm font-medium">{desc}</p>
            {registro.placa && (
              <p className="text-xl font-plate">{registro.placa}</p>
            )}
          </div>

          {/* 2. Quién · cuándo · desde dónde */}
          <div className="rounded-lg border bg-card divide-y">
            <div className="flex items-start gap-3 px-4 py-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsable</p>
                <p className="text-sm font-medium mt-0.5">{capitalizeName(registro.usuario_nombre) || 'Sistema'}</p>
                {registro.usuario_correo && (
                  <p className="text-xs text-muted-foreground">{registro.usuario_correo}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 px-4 py-3">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha y hora</p>
                <p className="text-sm mt-0.5">{formatFechaCompleta(registro.creado_en)}</p>
              </div>
            </div>

            {registro.ip_address && (
              <div className="flex items-start gap-3 px-4 py-3">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección IP</p>
                  <p className="text-sm font-mono mt-0.5">{registro.ip_address}</p>
                </div>
              </div>
            )}

            {registro.user_agent && (
              <div className="flex items-start gap-3 px-4 py-3">
                <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dispositivo</p>
                  <p className="text-sm mt-0.5">{parseUserAgent(registro.user_agent)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 break-all leading-tight">{registro.user_agent}</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Entidad afectada */}
          {afectado && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Afectado</p>
              <div className="rounded-lg border bg-card px-4 py-2.5">
                <p className="text-sm font-medium">{afectado}</p>
              </div>
            </div>
          )}

          {/* 4. Cambio de valores */}
          {tieneValores && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cambio registrado</p>
              <div className="rounded-lg border bg-card px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {registro.valor_anterior && (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200 ring-inset">
                      {registro.valor_anterior.replace(/_/g, ' ')}
                    </span>
                  )}
                  {registro.valor_anterior && registro.valor_nuevo && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  {registro.valor_nuevo && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 ring-1 ring-green-200 ring-inset">
                      {registro.valor_nuevo.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. Contexto adicional */}
          {detallesEntries.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contexto</p>
              </div>
              <div className="rounded-lg border bg-card">
                <dl className="divide-y">
                  {detallesEntries.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-sm text-muted-foreground shrink-0">{label}</dt>
                      <dd className="text-sm font-medium text-right break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* 6. Historial completo de la entidad */}
          {registro.entidad_id && registro.entidad_id !== 'undefined' && registro.entidad_tipo && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setHistorialAbierto(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Ver historial completo de esta entidad
            </Button>
          )}

          {/* 7. Referencia técnica */}
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 space-y-1">
            <p className="text-xs text-muted-foreground">ID: <span className="font-mono">{registro.id}</span></p>
            <p className="text-xs text-muted-foreground">Módulo: {getModuloLabel(registro.modulo)} · Entidad: {registro.entidad_tipo || '—'}</p>
            {registro.entidad_id && registro.entidad_id !== 'undefined' && (
              <p className="text-xs text-muted-foreground">Entidad ID: <span className="font-mono">{registro.entidad_id.slice(0, 8)}…</span></p>
            )}
            {registro.cuenta_id && <p className="text-xs text-muted-foreground">Cuenta: <span className="font-mono">{registro.cuenta_id.slice(0, 8)}…</span></p>}
            {registro.proceso_tipo && <p className="text-xs text-muted-foreground">Proceso: {registro.proceso_tipo}</p>}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <HistorialEntidad
      tipo={registro.entidad_tipo}
      id={registro.entidad_id !== 'undefined' ? registro.entidad_id : null}
      titulo={registro.placa ?? registro.entidad_tipo ?? undefined}
      open={historialAbierto}
      onClose={() => setHistorialAbierto(false)}
    />
    </>
  )
}
