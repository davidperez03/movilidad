'use client'

// =====================================================
// TABLA DE PROCESOS POR VENCER
// Tabla con filtros para reportes de procesos por vencer
// =====================================================

import { useMemo } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BadgeEstadoProceso } from '@/components/movilidad/badge-estado-proceso'
import { formatearFecha } from '@/lib/movilidad/formatters'
import type { DatosReportePorVencer, FiltrosReporte } from '@/lib/movilidad/reportes/tipos'

interface TablaPorVencerProps {
  datos: DatosReportePorVencer[]
  filtros: FiltrosReporte
}

function BadgeUrgencia({ diasRestantes }: { diasRestantes: number }) {
  if (diasRestantes < 0) {
    return <Badge variant="destructive">Vencido ({diasRestantes})</Badge>
  }
  if (diasRestantes <= 2) {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600">
        Alta ({diasRestantes} días)
      </Badge>
    )
  }
  if (diasRestantes <= 7) {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
        Media ({diasRestantes} días)
      </Badge>
    )
  }
  return <Badge variant="outline">{diasRestantes} días</Badge>
}

export function TablaPorVencer({ datos, filtros }: TablaPorVencerProps) {
  // Filtrar datos según filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datos.filter((d) => {
      // Filtro por estado
      if (filtros.estado !== 'todos' && d.estado !== filtros.estado) {
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
        <p className="text-muted-foreground">No se encontraron procesos por vencer con los filtros aplicados</p>
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
            <TableHead>Tipo Proceso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Organismo</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead>Urgencia</TableHead>
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
                <Badge variant={d.proceso_tipo === 'traslado' ? 'default' : 'secondary'}>
                  {d.proceso_tipo}
                </Badge>
              </TableCell>
              <TableCell>
                <BadgeEstadoProceso estado={d.estado} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{d.ciudad}</TableCell>
              <TableCell>{formatearFecha(d.fecha_vencimiento)}</TableCell>
              <TableCell>
                <BadgeUrgencia diasRestantes={d.dias_restantes} />
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
