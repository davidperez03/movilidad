"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"
import { VehicleFilters, FilterState } from "./vehicle-filters"
import { ESTADOS_CONFIG, TIPOS_SERVICIO_CONFIG } from "@/lib/movilidad/config"

interface VehicleData {
  cuenta_id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: string | null
  proceso_estado: string | null
  ciudad: string | null
  dias_restantes: number | null
}

interface VehicleTableProps {
  vehicles: VehicleData[]
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tipoServicio: "todos",
    procesoTipo: "todos",
    estado: "todos",
  })

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Filtro de búsqueda
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        filters.search === "" ||
        vehicle.placa.toLowerCase().includes(searchLower) ||
        vehicle.numero_cuenta.toLowerCase().includes(searchLower)

      // Filtro de tipo de servicio
      const matchesTipoServicio =
        filters.tipoServicio === "todos" || vehicle.tipo_servicio === filters.tipoServicio

      // Filtro de tipo de proceso
      let matchesProcesoTipo = true
      if (filters.procesoTipo === "sin_proceso") {
        matchesProcesoTipo = vehicle.proceso_tipo === null
      } else if (filters.procesoTipo !== "todos") {
        matchesProcesoTipo = vehicle.proceso_tipo === filters.procesoTipo
      }

      // Filtro de estado
      const matchesEstado = filters.estado === "todos" || vehicle.proceso_estado === filters.estado

      return matchesSearch && matchesTipoServicio && matchesProcesoTipo && matchesEstado
    })
  }, [vehicles, filters])

  return (
    <div className="space-y-4">
      <VehicleFilters filters={filters} onFilterChange={setFilters} />

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filteredVehicles.length}</span>{" "}
            de <span className="font-medium text-foreground">{vehicles.length}</span> vehículos
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-sm">Placa</th>
                <th className="text-left py-3 px-4 font-medium text-sm">N° Cuenta</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Tipo Servicio</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Proceso Activo</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Organismo</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Días Restantes</th>
                <th className="text-right py-3 px-4 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.cuenta_id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{vehicle.placa}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {vehicle.numero_cuenta}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={TIPOS_SERVICIO_CONFIG[vehicle.tipo_servicio as keyof typeof TIPOS_SERVICIO_CONFIG]?.color || ""}
                      >
                        {TIPOS_SERVICIO_CONFIG[vehicle.tipo_servicio as keyof typeof TIPOS_SERVICIO_CONFIG]?.label || vehicle.tipo_servicio}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {vehicle.proceso_tipo ? (
                        <Badge variant="outline" className="capitalize">
                          {vehicle.proceso_tipo}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin proceso</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {vehicle.proceso_estado ? (
                        <Badge
                          variant="outline"
                          className={ESTADOS_CONFIG[vehicle.proceso_estado]?.color || ""}
                        >
                          {ESTADOS_CONFIG[vehicle.proceso_estado]?.label || vehicle.proceso_estado.replace(/_/g, " ")}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {vehicle.ciudad || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {vehicle.dias_restantes !== null && vehicle.dias_restantes !== undefined ? (
                        <span
                          className={`text-sm font-medium ${
                            vehicle.dias_restantes < 0
                              ? "text-red-600"
                              : vehicle.dias_restantes <= 7
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {vehicle.dias_restantes < 0
                            ? `Vencido hace ${Math.abs(vehicle.dias_restantes)} días`
                            : `${vehicle.dias_restantes} días`}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/movilidad/vehiculos/${vehicle.placa}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="text-muted-foreground">
                      <p className="font-medium">No se encontraron vehículos</p>
                      <p className="text-sm mt-1">Intenta ajustar los filtros</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
