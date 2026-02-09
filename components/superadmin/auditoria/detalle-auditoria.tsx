'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Globe, Monitor, ArrowRight, FileText, Tag, Database } from 'lucide-react'
import type { RegistroAuditoria } from '@/app/superadmin/auditoria/auditoria-columns'
import { getDescripcion } from '@/app/superadmin/auditoria/auditoria-columns'
import { capitalizeName } from '@/lib/utils/capitalize'

interface DetalleAuditoriaProps {
  registro: RegistroAuditoria | null
  open: boolean
  onClose: () => void
}

function getCatColor(accion: string): string {
  if (accion.startsWith('usuario_')) return 'bg-blue-100 text-blue-800'
  if (accion.startsWith('rol_')) return 'bg-purple-100 text-purple-800'
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) return 'bg-slate-100 text-slate-700'
  if (accion.startsWith('parq_')) return 'bg-cyan-100 text-cyan-800'
  if (accion.includes('traslado')) return 'bg-amber-100 text-amber-800'
  if (accion.includes('radicacion')) return 'bg-sky-100 text-sky-800'
  if (accion.includes('novedad')) return 'bg-pink-100 text-pink-800'
  return 'bg-gray-100 text-gray-700'
}

function formatAccion(accion: string): string {
  return accion.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
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
  switch (modulo) {
    case 'sistema': return 'Sistema'
    case 'movilidad': return 'Movilidad'
    case 'parqueadero': return 'Parqueadero'
    default: return modulo
  }
}

function renderDetalles(detalles: Record<string, unknown>): [string, string][] {
  const entries: [string, string][] = []
  for (const [key, value] of Object.entries(detalles)) {
    if (value === null || value === undefined || value === '') continue
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value)
    entries.push([label, val])
  }
  return entries
}

export function DetalleAuditoria({ registro, open, onClose }: DetalleAuditoriaProps) {
  if (!registro) return null

  const detallesEntries = renderDetalles(registro.detalles)
  const tieneValores = registro.valor_anterior || registro.valor_nuevo

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Detalle de Registro
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Encabezado: Acción + Descripción + Placa */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${getCatColor(registro.accion)} text-sm`}>
                {formatAccion(registro.accion)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getModuloLabel(registro.modulo)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getDescripcion(registro)}</p>
            {registro.placa && (
              <p className="text-xl font-bold tracking-wide">{registro.placa}</p>
            )}
          </div>

          {/* Sección: Info principal */}
          <div className="rounded-lg border bg-card">
            {/* Fecha */}
            <div className="flex items-start gap-3 px-4 py-3">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha y hora</p>
                <p className="text-sm mt-0.5">{formatFechaCompleta(registro.creado_en)}</p>
              </div>
            </div>

            <div className="border-t" />

            {/* Responsable */}
            <div className="flex items-start gap-3 px-4 py-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsable</p>
                <p className="text-sm font-medium mt-0.5">{capitalizeName(registro.usuario_nombre) || 'Sistema'}</p>
                <p className="text-xs text-muted-foreground">{registro.usuario_correo}</p>
              </div>
            </div>

            {/* IP */}
            {registro.ip_address && (
              <>
                <div className="border-t" />
                <div className="flex items-start gap-3 px-4 py-3">
                  <Globe className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección IP</p>
                    <p className="text-sm font-mono mt-0.5">{registro.ip_address}</p>
                  </div>
                </div>
              </>
            )}

            {/* User Agent */}
            {registro.user_agent && (
              <>
                <div className="border-t" />
                <div className="flex items-start gap-3 px-4 py-3">
                  <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Navegador</p>
                    <p className="text-xs text-muted-foreground mt-0.5 break-all">{registro.user_agent}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sección: Cambio de estado */}
          {tieneValores && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cambio de estado</p>
              </div>
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

          {/* Sección: Detalles JSON */}
          {detallesEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detalles</p>
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

          {/* Metadata */}
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 space-y-1">
            <p className="text-xs text-muted-foreground">ID: <span className="font-mono">{registro.id}</span></p>
            <p className="text-xs text-muted-foreground">Módulo: {getModuloLabel(registro.modulo)}</p>
            <p className="text-xs text-muted-foreground">Entidad: {registro.entidad_tipo}{registro.entidad_id ? ` (${registro.entidad_id.slice(0, 8)}...)` : ''}</p>
            {registro.cuenta_id && <p className="text-xs text-muted-foreground">Cuenta: <span className="font-mono">{registro.cuenta_id.slice(0, 8)}...</span></p>}
            {registro.proceso_tipo && <p className="text-xs text-muted-foreground">Proceso: {registro.proceso_tipo}</p>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
