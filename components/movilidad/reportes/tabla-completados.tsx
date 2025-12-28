'use client'

// =====================================================
// TABLA DE PROCESOS COMPLETADOS
// Tabla con filtros para reportes de procesos completados
// =====================================================

import { useMemo } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BadgeEstadoProceso } from '@/components/movilidad/badge-estado-proceso'
import { formatearFecha } from '@/lib/movilidad/formatters'
import type { DatosReporteCompletados, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaCompletadosProps {
  datos: DatosReporteCompletados[]
  filtros: FiltrosReporte
}

export function TablaCompletados({ datos, filtros }: TablaCompletadosProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por fecha inicio
      if (filtros.fechaInicio && d.fecha_completado < filtros.fechaInicio) {
        return false
      }

      // Filtro por fecha fin
      if (filtros.fechaFin && d.fecha_completado > filtros.fechaFin) {
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
        <p className="text-muted-foreground">No se encontraron procesos completados con los filtros aplicados</p>
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
            <TableHead>Estado Final</TableHead>
            <TableHead>Organismo</TableHead>
            <TableHead>Fecha Completado</TableHead>
            <TableHead>Duración (días)</TableHead>
            <TableHead>Responsable</TableHead>
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
                <BadgeEstadoProceso estado={d.estado} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{d.organismo}</TableCell>
              <TableCell>{formatearFecha(d.fecha_completado)}</TableCell>
              <TableCell>
                <Badge variant="outline">{d.duracion_dias}</Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">{d.responsable}</TableCell>
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
