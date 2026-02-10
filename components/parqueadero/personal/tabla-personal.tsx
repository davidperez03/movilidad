"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IdCard, Pencil } from "lucide-react"
import type { VistaPersonal } from "@/lib/parqueadero/types"
import { ESTADOS_DOCUMENTO } from "@/lib/parqueadero/config"
import { formatearFechaCorta } from "@/lib/parqueadero/utils"
import { ModalDatosPersonal } from "./modal-datos-personal"

interface TablaPersonalProps {
  personal: VistaPersonal[]
  puedeEditar: boolean
}

export function TablaPersonal({ personal, puedeEditar }: TablaPersonalProps) {
  const [personaEditar, setPersonaEditar] = useState<VistaPersonal | null>(null)

  const columns: ColumnDef<VistaPersonal>[] = [
    {
      accessorKey: "nombre_completo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("nombre_completo")}</p>
          <p className="text-xs text-muted-foreground">{row.original.correo}</p>
        </div>
      ),
    },
    {
      accessorKey: "rol_nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("rol_nombre")}</Badge>
      ),
    },
    {
      accessorKey: "licencia_categoria",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Licencia" />,
      cell: ({ row }) => {
        // Auxiliares no requieren licencia
        if (row.original.rol_codigo === "parq_auxiliar" || row.original.rol_codigo === "parq_administrador") {
          return <span className="text-muted-foreground text-sm">N/A</span>
        }
        const categoria = row.getValue("licencia_categoria") as string | null
        const numero = row.original.licencia_numero
        if (!categoria && !numero) {
          return <span className="text-muted-foreground text-sm">Sin datos</span>
        }
        return (
          <div className="flex items-center gap-2">
            <IdCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-mono text-sm">{categoria || "-"}</p>
              {numero && <p className="text-xs text-muted-foreground">{numero}</p>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "licencia_vencimiento",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimiento" />,
      cell: ({ row }) => {
        if (row.original.rol_codigo === "parq_auxiliar" || row.original.rol_codigo === "parq_administrador") {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return formatearFechaCorta(row.getValue("licencia_vencimiento"))
      },
    },
    {
      accessorKey: "estado_licencia",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        // Auxiliares no requieren licencia
        if (row.original.rol_codigo === "parq_auxiliar" || row.original.rol_codigo === "parq_administrador") {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        const estado = row.getValue("estado_licencia") as string
        const config = ESTADOS_DOCUMENTO[estado]
        return config ? (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        ) : "-"
      },
    },
    {
      accessorKey: "documento_numero",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Documento" />,
      cell: ({ row }) => {
        const tipo = row.original.documento_tipo
        const numero = row.getValue("documento_numero") as string | null
        if (!numero) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return (
          <span className="font-mono text-sm">
            {tipo} {numero}
          </span>
        )
      },
    },
    {
      accessorKey: "telefono",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => row.getValue("telefono") || "-",
    },
  ]

  // Agregar columna de acciones si puede editar
  if (puedeEditar) {
    columns.push({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPersonaEditar(row.original)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
      ),
    })
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={personal}
        enableGlobalFilter
        globalFilterPlaceholder="Buscar por nombre, correo..."
        emptyMessage="No hay personal registrado"
      />

      {personaEditar && (
        <ModalDatosPersonal
          persona={personaEditar}
          onCerrar={() => setPersonaEditar(null)}
        />
      )}
    </>
  )
}
