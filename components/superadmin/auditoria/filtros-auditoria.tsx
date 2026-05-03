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
import { X, Search, Clock, Calendar, AlertTriangle, LogIn } from 'lucide-react'
import type { FiltrosAuditoria } from '@/lib/hooks/useAuditoria'

const TIPOS = [
  { value: 'todos',       label: 'Todos los tipos'    },
  { value: 'usuario',     label: 'Usuarios y Roles'   },
  { value: 'sesion',      label: 'Sesiones'            },
  { value: 'movilidad',   label: 'Movilidad'           },
  { value: 'parqueadero', label: 'Parqueadero'         },
  { value: 'inventarios', label: 'Inventarios'         },
  { value: 'sistema',     label: 'Sistema'             },
]

const QUICK_FILTERS = [
  { id: 'hoy',          label: 'Hoy',             icon: Clock         },
  { id: 'semana',       label: 'Esta semana',      icon: Calendar      },
  { id: 'criticos',     label: 'Críticos',         icon: AlertTriangle },
  { id: 'login_fallido', label: 'Logins fallidos', icon: LogIn        },
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
  function setQuick(id: string) {
    onFiltrosChange({
      ...filtros,
      quickFilter: filtros.quickFilter === id ? 'todos' : id,
    })
  }

  return (
    <div className="space-y-3">
      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((qf) => {
          const active = filtros.quickFilter === qf.id
          const Icon = qf.icon
          return (
            <button
              key={qf.id}
              onClick={() => setQuick(qf.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                active
                  ? qf.id === 'criticos' || qf.id === 'login_fallido'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {qf.label}
            </button>
          )
        })}
      </div>

      {/* Búsqueda global */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, correo, placa, IP, acción..."
          value={filtros.busqueda}
          onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
          className="pl-9 h-10"
        />
      </div>

      {/* Filtros avanzados */}
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
        />
        <Input
          type="date"
          value={filtros.fechaFin}
          onChange={(e) => onFiltrosChange({ ...filtros, fechaFin: e.target.value })}
          className="w-[140px] h-9"
        />

        {hayFiltros && (
          <Button variant="ghost" size="sm" onClick={onLimpiar}>
            <X className="h-4 w-4 mr-1" /> Limpiar
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {registrosFiltrados.toLocaleString('es-CO')}
          {hayFiltros ? ` de ${totalRegistros.toLocaleString('es-CO')}` : ''} registros
        </span>
      </div>
    </div>
  )
}
