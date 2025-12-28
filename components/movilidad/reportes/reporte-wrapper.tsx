'use client'

// =====================================================
// WRAPPER DE REPORTE
// Componente cliente que maneja filtros y exportación
// =====================================================

import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FiltrosReporteComponent } from './filtros-reporte'
import { BotonesExportacion } from './botones-exportacion'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import type { FiltrosReporte, TipoReporte, Organismo, Responsable } from '@/lib/movilidad/reportes/tipos'

interface ReporteWrapperProps {
  titulo: string
  descripcion: string
  tipoReporte: TipoReporte
  datos: any[]
  organismos: Organismo[]
  responsables: Responsable[]
  tablaComponent: React.ComponentType<{ datos: any[]; filtros: FiltrosReporte }>
  estadisticasComponent?: React.ReactNode
}

export function ReporteWrapper({
  titulo,
  descripcion,
  tipoReporte,
  datos,
  organismos,
  responsables,
  tablaComponent: TablaComponent,
  estadisticasComponent,
}: ReporteWrapperProps) {
  const [filtros, setFiltros] = useState<FiltrosReporte>(FILTROS_INICIALES)

  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d: any) => {
      // Filtro por fecha inicio
      if (filtros.fechaInicio) {
        const fechaDato = d.fecha_tramite || d.fecha_completado || d.creado_en
        if (fechaDato && fechaDato < filtros.fechaInicio) {
          return false
        }
      }

      // Filtro por fecha fin
      if (filtros.fechaFin) {
        const fechaDato = d.fecha_tramite || d.fecha_completado || d.creado_en
        if (fechaDato && fechaDato > filtros.fechaFin) {
          return false
        }
      }

      // Filtro por estado
      if (filtros.estado !== 'todos') {
        const estadoDato = d.estado || d.proceso_estado
        if (estadoDato && estadoDato !== filtros.estado) {
          return false
        }
      }

      // Filtro por tipo de proceso
      if (filtros.tipoProceso !== 'todos') {
        if (d.proceso_tipo && d.proceso_tipo !== filtros.tipoProceso) {
          return false
        }
      }

      return true
    })
  }, [datos, filtros])

  const nombreArchivo = useMemo(() => {
    const fecha = new Date().toISOString().split('T')[0]
    return `${tipoReporte}-${fecha}`
  }, [tipoReporte])

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/movilidad/reportes">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          <p className="text-muted-foreground">{descripcion}</p>
        </div>

        <BotonesExportacion
          datos={datosFiltrados}
          tipoReporte={tipoReporte}
          filtros={filtros}
          nombreArchivo={nombreArchivo}
        />
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <FiltrosReporteComponent
          filtros={filtros}
          onFilterChange={setFiltros}
          tipoReporte={tipoReporte}
          organismos={organismos}
          responsables={responsables}
        />
      </div>

      {/* Estadísticas */}
      {estadisticasComponent || (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Total de registros:</strong> {datosFiltrados.length}
          </p>
        </div>
      )}

      {/* Tabla */}
      <TablaComponent datos={datosFiltrados} filtros={filtros} />
    </div>
  )
}
