'use client'

import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  enableGlobalFilter?: boolean
  globalFilterPlaceholder?: string
  toolbarActions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  enableGlobalFilter = false,
  globalFilterPlaceholder = 'Buscar...',
  toolbarActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter !== ''

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {enableGlobalFilter && (
          <Input
            placeholder={globalFilterPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.setGlobalFilter('')}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {toolbarActions}
    </div>
  )
}
