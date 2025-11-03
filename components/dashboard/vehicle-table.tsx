"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"
import { VehicleFilters, FilterState } from "./vehicle-filters"

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

const estadoColors: Record<string, string> = {
  sin_asignar: "bg-gray-100 text-gray-700 border-gray-300",
  enviado_organismo: "bg-blue-100 text-blue-700 border-blue-300",
  recibido: "bg-cyan-100 text-cyan-700 border-cyan-300",
  revisado: "bg-purple-100 text-purple-700 border-purple-300",
  con_novedades: "bg-orange-100 text-orange-700 border-orange-300",
  trasladado: "bg-green-100 text-green-700 border-green-300",
  radicado: "bg-green-100 text-green-700 border-green-300",
  devuelto: "bg-red-100 text-red-700 border-red-300",
  pendiente_radicar: "bg-yellow-100 text-yellow-700 border-yellow-300",
}

const tipoColors: Record<string, string> = {
  particular: "bg-blue-50 text-blue-600",
  publico: "bg-purple-50 text-purple-600",
  otro: "bg-gray-50 text-gray-600",
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
                        className={tipoColors[vehicle.tipo_servicio as keyof typeof tipoColors]}
                      >
                        {vehicle.tipo_servicio}
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
                          className={
                            estadoColors[vehicle.proceso_estado as keyof typeof estadoColors]
                          }
                        >
                          {vehicle.proceso_estado.replace(/_/g, " ")}
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
