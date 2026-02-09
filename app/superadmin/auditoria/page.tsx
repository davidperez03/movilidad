'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, ShieldAlert } from 'lucide-react'
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
  } = useAuditoria()

  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroAuditoria | null>(null)
  const [detalleAbierto, setDetalleAbierto] = useState(false)

  function abrirDetalle(registro: RegistroAuditoria) {
    setRegistroSeleccionado(registro)
    setDetalleAbierto(true)
  }

  function filtrarPorTipo(tipo: string) {
    if (tipo === 'todos') {
      limpiarFiltros()
    } else {
      setFiltros({ ...filtros, tipo })
    }
  }

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
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={registros.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasAuditoria registros={registrosTodos} onFiltrarTipo={filtrarPorTipo} />

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
          emptyMessage="Sin registros de auditoría"
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
