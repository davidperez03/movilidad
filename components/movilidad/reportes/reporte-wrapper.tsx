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
import { aplicarFiltrosReporte } from '@/lib/movilidad/reportes/aplicar-filtros'
import { FILTROS_INICIALES } from '@/lib/movilidad/reportes/tipos'
import type { FiltrosReporte, TipoReporte, Organismo, Responsable } from '@/lib/movilidad/reportes/tipos'

interface DatoReporte {
  fecha_tramite?: string | null
  fecha_completado?: string | null
  fecha_vencimiento?: string | null
  creado_en?: string | null
  estado?: string | null
  proceso_estado?: string | null
  proceso_tipo?: string | null
  organismo_id?: string | null
  responsable?: string | null
}

interface ReporteWrapperProps<T extends DatoReporte> {
  titulo: string
  descripcion: string
  tipoReporte: TipoReporte
  datos: T[]
  organismos: Organismo[]
  responsables: Responsable[]
  tablaComponent: React.ComponentType<{ datos: T[]; filtros: FiltrosReporte }>
  estadisticasItems?: Array<{
    id: string
    titulo: string
    valor: number
    claseContenedor?: string
    claseTitulo?: string
    claseValor?: string
  }>
}

export function ReporteWrapper<T extends DatoReporte>({
  titulo,
  descripcion,
  tipoReporte,
  datos,
  organismos,
  responsables,
  tablaComponent: TablaComponent,
  estadisticasItems,
}: ReporteWrapperProps<T>) {
  const [filtros, setFiltros] = useState<FiltrosReporte>(FILTROS_INICIALES)

  const campoFecha = useMemo<'fecha_tramite' | 'fecha_completado' | 'fecha_vencimiento' | 'creado_en'>(() => {
    if (tipoReporte === 'completados') return 'fecha_completado'
    if (tipoReporte === 'por-vencer' || tipoReporte === 'vencidos') return 'fecha_vencimiento'
    if (tipoReporte === 'auditoria') return 'creado_en'
    return 'fecha_tramite'
  }, [tipoReporte])

  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return aplicarFiltrosReporte(datos, filtros, campoFecha)
  }, [datos, filtros, campoFecha])

  const nombreArchivo = useMemo(() => {
    const fecha = new Date().toISOString().split('T')[0]
    return `${tipoReporte}-${fecha}`
  }, [tipoReporte])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/movilidad/reportes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
            <p className="text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        <BotonesExportacion
          datos={datosFiltrados}
          tipoReporte={tipoReporte}
          filtros={filtros}
          nombreArchivo={nombreArchivo}
        />
      </div>

      {/* Filtros */}
      <FiltrosReporteComponent
        filtros={filtros}
        onFilterChange={setFiltros}
        tipoReporte={tipoReporte}
        organismos={organismos}
        responsables={responsables}
      />

      {/* Estadísticas */}
      {estadisticasItems && estadisticasItems.length > 0 ? (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {estadisticasItems.map((item) => (
            <div key={item.id} className={item.claseContenedor || 'p-4 bg-muted rounded-lg'}>
              <p className={item.claseTitulo || 'text-sm text-muted-foreground'}>{item.titulo}</p>
              <p className={item.claseValor || 'text-2xl font-bold'}>{item.valor}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg">
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
