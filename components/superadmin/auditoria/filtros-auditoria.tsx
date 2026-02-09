'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import type { FiltrosAuditoria } from '@/lib/hooks/useAuditoria'

const TIPOS = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'usuario', label: 'Usuarios' },
  { value: 'rol', label: 'Roles' },
  { value: 'sesion', label: 'Sesiones' },
  { value: 'movilidad', label: 'Movilidad' },
  { value: 'parqueadero', label: 'Parqueadero' },
]

interface FiltrosAuditoriaProps {
  filtros: FiltrosAuditoria
  onFiltrosChange: (filtros: FiltrosAuditoria) => void
  usuarios: { id: string; label: string }[]
  totalRegistros: number
  registrosFiltrados: number
  hayFiltros: boolean
  onLimpiar: () => void
}

export function FiltrosAuditoriaComponent({
  filtros,
  onFiltrosChange,
  usuarios,
  totalRegistros,
  registrosFiltrados,
  hayFiltros,
  onLimpiar,
}: FiltrosAuditoriaProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center p-3 bg-muted/50 rounded-lg">
      <Select value={filtros.tipo} onValueChange={(v) => onFiltrosChange({ ...filtros, tipo: v })}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIPOS.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filtros.usuario} onValueChange={(v) => onFiltrosChange({ ...filtros, usuario: v })}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {usuarios.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filtros.fechaInicio}
        onChange={(e) => onFiltrosChange({ ...filtros, fechaInicio: e.target.value })}
        className="w-[140px] h-9"
        placeholder="Desde"
      />
      <Input
        type="date"
        value={filtros.fechaFin}
        onChange={(e) => onFiltrosChange({ ...filtros, fechaFin: e.target.value })}
        className="w-[140px] h-9"
        placeholder="Hasta"
      />

      {hayFiltros && (
        <Button variant="ghost" size="sm" onClick={onLimpiar}>
          <X className="h-4 w-4" />
        </Button>
      )}

      <span className="text-sm text-muted-foreground ml-auto">
        {registrosFiltrados}{hayFiltros ? ` de ${totalRegistros}` : ''} registros
      </span>
    </div>
  )
}
