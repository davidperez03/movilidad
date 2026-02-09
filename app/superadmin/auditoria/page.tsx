'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasAuditoria } from './auditoria-columns'
import { useAuditoria } from '@/lib/hooks/useAuditoria'
import { FiltrosAuditoriaComponent } from '@/components/superadmin/auditoria/filtros-auditoria'

export default function AuditoriaPage() {
  const {
    registros,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={registros.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <FiltrosAuditoriaComponent
        filtros={filtros}
        onFiltrosChange={setFiltros}
        usuarios={usuarios}
        totalRegistros={totalRegistros}
        registrosFiltrados={registros.length}
        hayFiltros={hayFiltros}
        onLimpiar={limpiarFiltros}
      />

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
          emptyMessage="Sin registros"
        />
      )}
    </div>
  )
}
