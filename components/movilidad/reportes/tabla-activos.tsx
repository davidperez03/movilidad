'use client'

// =====================================================
// TABLA DE PROCESOS ACTIVOS
// Tabla con filtros para reportes de procesos activos
// =====================================================

import { useMemo } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BadgeEstadoProceso } from '@/components/movilidad/badge-estado-proceso'
import { formatearFecha, formatearDiasRestantes } from '@/lib/movilidad/formatters'
import type { DatosReporteActivos, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaActivosProps {
  datos: DatosReporteActivos[]
  filtros: FiltrosReporte
}

export function TablaActivos({ datos, filtros }: TablaActivosProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por fecha inicio
      if (filtros.fechaInicio && d.fecha_tramite < filtros.fechaInicio) {
        return false
      }

      // Filtro por fecha fin
      if (filtros.fechaFin && d.fecha_tramite > filtros.fechaFin) {
        return false
      }

      // Filtro por estado
      if (filtros.estado !== 'todos' && d.proceso_estado !== filtros.estado) {
        return false
      }

      // Filtro por organismo
      if (filtros.organismoId !== 'todos' && d.organismo_id !== filtros.organismoId) {
        return false
      }

      // Filtro por tipo de proceso
      if (filtros.tipoProceso !== 'todos' && d.proceso_tipo !== filtros.tipoProceso) {
        return false
      }

      return true
    })
  }, [datos, filtros])

  if (datosFiltrados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron procesos activos con los filtros aplicados</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>N° Cuenta</TableHead>
            <TableHead>Tipo Servicio</TableHead>
            <TableHead>Tipo Proceso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Organismo</TableHead>
            <TableHead>Fecha Trámite</TableHead>
            <TableHead>Días Restantes</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datosFiltrados.map((d) => (
            <TableRow key={d.proceso_id}>
              <TableCell className="font-medium">{d.placa}</TableCell>
              <TableCell>{d.numero_cuenta}</TableCell>
              <TableCell>
                <Badge variant="outline">{d.tipo_servicio}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={d.proceso_tipo === 'traslado' ? 'default' : 'secondary'}>
                  {d.proceso_tipo}
                </Badge>
              </TableCell>
              <TableCell>
                <BadgeEstadoProceso estado={d.proceso_estado} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{d.ciudad}</TableCell>
              <TableCell>{formatearFecha(d.fecha_tramite)}</TableCell>
              <TableCell>
                {d.dias_restantes !== null ? (
                  <Badge variant="outline">{formatearDiasRestantes(d.dias_restantes)}</Badge>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/movilidad/vehiculos/${d.placa}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
