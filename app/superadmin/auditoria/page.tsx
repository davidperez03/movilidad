'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, ShieldAlert, AlertTriangle, X, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasAuditoria, type RegistroAuditoria } from './auditoria-columns'
import { useAuditoria } from '@/lib/hooks/useAuditoria'
import { FiltrosAuditoriaComponent } from '@/components/superadmin/auditoria/filtros-auditoria'
import { EstadisticasAuditoria } from '@/components/superadmin/auditoria/estadisticas-auditoria'
import { DetalleAuditoria } from '@/components/superadmin/auditoria/detalle-auditoria'

export default function AuditoriaPage() {
  const {
    registros,
    registrosTodos,
    totalRegistros,
    loading,
    usuarios,
    filtros,
    setFiltros,
    hayFiltros,
    limpiarFiltros,
    cargarDatos,
    exportarCSV,
    alertas,
  } = useAuditoria()

  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroAuditoria | null>(null)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [alertasDismissed, setAlertasDismissed] = useState(false)
  const [verificando, setVerificando] = useState(false)

  async function verificarIntegridad() {
    setVerificando(true)
    try {
      const res = await fetch('/api/admin/auditoria/verificar')
      const data = await res.json()
      if (data.todo_integro) {
        toast.success(`Todas las cadenas íntegras — ${data.total_registros.toLocaleString('es-CO')} registros verificados`)
      } else {
        const corruptas = (data.tablas ?? []).filter((t: { cadena_integra: boolean }) => !t.cadena_integra)
        const detalle = corruptas.map((t: { tabla: string; registros_corruptos: number }) =>
          `${t.tabla}: ${t.registros_corruptos} alterado(s)`
        ).join(' · ')
        toast.error(`Alteración detectada — ${detalle}`, { duration: 10000 })
      }
    } catch {
      toast.error('Error al verificar integridad')
    } finally {
      setVerificando(false)
    }
  }

  function abrirDetalle(registro: RegistroAuditoria) {
    setRegistroSeleccionado(registro)
    setDetalleAbierto(true)
  }

  function filtrarPorTipo(tipo: string) {
    if (tipo === 'todos') {
      limpiarFiltros()
    } else {
      setFiltros({ ...filtros, tipo, quickFilter: 'todos' })
    }
  }

  function filtrarQuick(quick: string) {
    setFiltros({ ...filtros, quickFilter: quick, tipo: 'todos' })
  }

  const hayAlertas = !alertasDismissed && (
    alertas.loginsFallidos >= 3 ||
    alertas.usuariosEliminados > 0 ||
    alertas.sesionesCerradasAdmin > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-600/10 p-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Auditoría</h1>
            <p className="text-sm text-muted-foreground">
              Registro completo de actividad del sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={verificarIntegridad} disabled={verificando}>
            {verificando
              ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              : <ShieldCheck className="h-4 w-4 mr-1" />}
            Verificar
          </Button>
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={registros.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </div>
      </div>

      {/* Banner de alertas */}
      {hayAlertas && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-orange-800">Actividad que requiere atención (últimas 24 h)</p>
                <ul className="text-sm text-orange-700 space-y-0.5">
                  {alertas.loginsFallidos >= 3 && (
                    <li>
                      <button
                        className="underline underline-offset-2 hover:text-orange-900"
                        onClick={() => filtrarQuick('login_fallido')}
                      >
                        {alertas.loginsFallidos} intentos de acceso fallidos
                      </button>
                    </li>
                  )}
                  {alertas.usuariosEliminados > 0 && (
                    <li>
                      <button
                        className="underline underline-offset-2 hover:text-orange-900"
                        onClick={() => setFiltros({ ...filtros, busqueda: 'usuario_eliminado', quickFilter: 'hoy' })}
                      >
                        {alertas.usuariosEliminados} {alertas.usuariosEliminados === 1 ? 'cuenta eliminada' : 'cuentas eliminadas'}
                      </button>
                    </li>
                  )}
                  {alertas.sesionesCerradasAdmin > 0 && (
                    <li>
                      {alertas.sesionesCerradasAdmin} {alertas.sesionesCerradasAdmin === 1 ? 'sesión cerrada' : 'sesiones cerradas'} por administrador
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setAlertasDismissed(true)}
              className="text-orange-400 hover:text-orange-600 shrink-0"
              aria-label="Cerrar alertas"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <EstadisticasAuditoria
        registros={registrosTodos}
        onFiltrarTipo={filtrarPorTipo}
        onFiltrarQuick={filtrarQuick}
      />

      {/* Filtros */}
      <FiltrosAuditoriaComponent
        filtros={filtros}
        onFiltrosChange={setFiltros}
        usuarios={usuarios}
        totalRegistros={totalRegistros}
        registrosFiltrados={registros.length}
        hayFiltros={hayFiltros}
        onLimpiar={limpiarFiltros}
      />

      {/* Tabla */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columnasAuditoria}
          data={registros}
          enablePagination
          pageSize={25}
          pageSizeOptions={[25, 50, 100]}
          enableSorting
          defaultSorting={[{ id: 'creado_en', desc: true }]}
          onRowClick={(row) => abrirDetalle(row as RegistroAuditoria)}
          emptyMessage="Sin registros de auditoría para los filtros aplicados"
        />
      )}

      {/* Detalle lateral */}
      <DetalleAuditoria
        registro={registroSeleccionado}
        open={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
      />
    </div>
  )
}
