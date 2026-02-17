import type {
  ColumnDef,
  SortingState,
  Table,
  Column,
} from '@tanstack/react-table'

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Paginación
  enablePagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]

  // Búsqueda global
  enableGlobalFilter?: boolean
  globalFilterPlaceholder?: string

  // Sorting
  enableSorting?: boolean
  defaultSorting?: SortingState

  // Customización
  onRowClick?: (row: TData) => void
  emptyMessage?: string
  className?: string
  tableLayout?: 'auto' | 'fixed'

  // Acciones custom en toolbar
  toolbarActions?: React.ReactNode
}

export interface DataTablePaginationProps {
  table: Table<any>
  pageSizeOptions?: number[]
}

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}
