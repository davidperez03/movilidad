'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasAuditoria, type RegistroAuditoria } from './auditoria-columns'

const TIPOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'usuario', label: 'Usuarios' },
  { value: 'rol', label: 'Roles' },
  { value: 'sesion', label: 'Sesiones' },
  { value: 'movilidad', label: 'Movilidad' },
]

function getTipoAccion(accion: string): string {
  if (accion.startsWith('usuario_')) return 'usuario'
  if (accion.startsWith('rol_')) return 'rol'
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) return 'sesion'
  return 'movilidad'
}

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<{ id: string; label: string }[]>([])

  const [tipoFiltro, setTipoFiltro] = useState('todos')
  const [usuarioFiltro, setUsuarioFiltro] = useState('todos')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const supabase = createClient()

    const [auditoriaRes, usuariosRes] = await Promise.all([
      supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(500),
      supabase
        .from('perfiles')
        .select('id, nombre_completo, correo')
        .order('nombre_completo'),
    ])

    if (auditoriaRes.error) {
      toast.error('Error al cargar auditoría')
      setLoading(false)
      return
    }

    const data: RegistroAuditoria[] = (auditoriaRes.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id || ''),
      modulo: String(item.modulo || 'sistema'),
      accion: String(item.accion || ''),
      entidad_tipo: String(item.entidad_tipo || ''),
      entidad_id: String(item.entidad_id || ''),
      detalles: (item.detalles as Record<string, unknown>) || {},
      valor_anterior: item.valor_anterior ? String(item.valor_anterior) : null,
      valor_nuevo: item.valor_nuevo ? String(item.valor_nuevo) : null,
      usuario_id: String(item.usuario_id || ''),
      usuario_correo: String(item.usuario_correo || ''),
      usuario_nombre: String(item.usuario_nombre || 'Sistema'),
      ip_address: item.ip_address ? String(item.ip_address) : null,
      creado_en: String(item.creado_en || ''),
      cuenta_id: item.cuenta_id ? String(item.cuenta_id) : null,
      proceso_tipo: item.proceso_tipo ? String(item.proceso_tipo) : null,
      placa: item.placa ? String(item.placa) : null,
    }))

    setRegistros(data)
    setUsuarios(
      (usuariosRes.data || []).map((u: { id: string; nombre_completo: string | null; correo: string }) => ({
        id: u.id,
        label: u.nombre_completo || u.correo,
      }))
    )
    setLoading(false)
  }

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      if (tipoFiltro !== 'todos' && getTipoAccion(r.accion) !== tipoFiltro) return false
      if (usuarioFiltro !== 'todos' && r.usuario_id !== usuarioFiltro) return false
      if (fechaInicio && r.creado_en < fechaInicio) return false
      if (fechaFin && r.creado_en.split('T')[0] > fechaFin) return false
      return true
    })
  }, [registros, tipoFiltro, usuarioFiltro, fechaInicio, fechaFin])

  const hayFiltros = tipoFiltro !== 'todos' || usuarioFiltro !== 'todos' || fechaInicio || fechaFin

  function limpiarFiltros() {
    setTipoFiltro('todos')
    setUsuarioFiltro('todos')
    setFechaInicio('')
    setFechaFin('')
  }

  function exportarCSV() {
    const csv = [
      ['Fecha', 'Responsable', 'Tipo', 'Placa/Afectado', 'Acción'].join(','),
      ...registrosFiltrados.map((r) => [
        `"${new Date(r.creado_en).toLocaleString('es-CO')}"`,
        `"${r.usuario_nombre}"`,
        `"${getTipoAccion(r.accion)}"`,
        `"${r.placa || ''}"`,
        `"${r.accion.replace(/_/g, ' ')}"`,
      ].join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={registrosFiltrados.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center p-3 bg-muted/50 rounded-lg">
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={usuarioFiltro} onValueChange={setUsuarioFiltro}>
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
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-[130px] h-9"
        />
        <Input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="w-[130px] h-9"
        />

        {hayFiltros && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
            <X className="h-4 w-4" />
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {registrosFiltrados.length} registros
        </span>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columnasAuditoria}
          data={registrosFiltrados}
          enablePagination
          pageSize={25}
          pageSizeOptions={[25, 50, 100]}
          enableSorting
          defaultSorting={[{ id: 'creado_en', desc: true }]}
          emptyMessage="Sin registros"
        />
      )}
    </div>
  )
}
