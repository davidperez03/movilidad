'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import type { DataTableProps } from './types'
import { cn } from '@/lib/utils'

export function DataTable<TData, TValue>({
  columns,
  data,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  enableGlobalFilter = false,
  globalFilterPlaceholder = 'Buscar...',
  enableSorting = true,
  defaultSorting = [],
  onRowClick,
  emptyMessage = 'No se encontraron resultados',
  className,
  tableLayout = 'fixed',
  toolbarActions,
}: DataTableProps<TData, TValue>) {
  // State management
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    enableGlobalFilter,
    getCoreRowModel: getCoreRowModel(),

    // Sorting
    onSortingChange: setSorting,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,

    // Pagination
    onPaginationChange: setPagination,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

    // Filtering
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),

    // State
    state: {
      sorting,
      pagination,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(enableGlobalFilter || toolbarActions) && (
        <DataTableToolbar
          table={table}
          enableGlobalFilter={enableGlobalFilter}
          globalFilterPlaceholder={globalFilterPlaceholder}
          toolbarActions={toolbarActions}
        />
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Table
          className={cn(
            'min-w-[600px]',
            tableLayout === 'fixed'
              ? 'table-fixed [&_th:last-child]:w-[190px] [&_td:last-child]:whitespace-nowrap'
              : 'table-auto',
            className
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as Record<string, string> | undefined)?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as Record<string, string> | undefined)?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}
