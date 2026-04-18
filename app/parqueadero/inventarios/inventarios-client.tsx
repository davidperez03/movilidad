'use client'

import { useState, useMemo } from 'react'
import { useMutation } from '@/lib/hooks/use-mutation'
import { apiFetch } from '@/lib/utils/api-fetch'
import { toast } from 'sonner'
import { generarCSVInventario } from '@/lib/parqueadero/reportes/exportar-csv'
import { generarExcelInventario } from '@/lib/parqueadero/reportes/exportar-excel'
import { generarPDFReporte } from '@/lib/movilidad/reportes/exportar-pdf'
import { DocumentoStockPDF } from '@/components/parqueadero/reportes/pdf/documento-inventarios-pdf'
import type { FilaStock, FilaSticker } from '@/lib/parqueadero/reportes/tipos'
import { UndoBanner } from '@/components/shared/undo-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Package, BookOpen, Tag, Layers, Warehouse, Truck, AlertTriangle,
  Plus, ArrowRightLeft, ChevronDown, Hash, Pencil, Check, X, ClipboardList,
  FileText, Table, Download, Loader2,
} from 'lucide-react'

export interface GruaItem { id: string; placa: string }

export type CategoriaUbicacion = 'libretas' | 'sellos'
export type Categoria = CategoriaUbicacion | 'stickers'

export interface ItemUbicacion {
  id:           string
  categoria:    CategoriaUbicacion
  nombre:       string
  unidad:       string
  stock_minimo: number
  bodega:       number
  gruas:        Record<string, number>
}

export interface RangoSticker {
  item_id:      string
  nombre:       string
  rango_inicio: number
  rango_fin:    number
  usados:       number
  stock_minimo: number
  configurado:  boolean
}

const CAT_CONFIG = {
  libretas: { label: 'Libretas',               icon: BookOpen, color: 'text-blue-600',   bg: 'bg-blue-100'   },
  sellos:   { label: 'Sellos de Seguridad',    icon: Tag,      color: 'text-orange-600', bg: 'bg-orange-100' },
  stickers: { label: 'Stickers de Inventario', icon: Layers,   color: 'text-purple-600', bg: 'bg-purple-100' },
} satisfies Record<Categoria, { label: string; icon: typeof BookOpen; color: string; bg: string }>

function totalItem(item: ItemUbicacion): number {
  return item.bodega + Object.values(item.gruas).reduce((a, b) => a + b, 0)
}
function stockGruas(item: ItemUbicacion): number {
  return Object.values(item.gruas).reduce((a, b) => a + b, 0)
}
function estadoItem(item: ItemUbicacion): 'critico' | 'bajo' | 'ok' {
  const t = totalItem(item)
  if (t === 0) return 'critico'
  if (t <= item.stock_minimo) return 'bajo'
  return 'ok'
}
function estadoSticker(s: RangoSticker): 'critico' | 'bajo' | 'ok' {
  const d = s.rango_fin - s.usados
  if (d <= 0) return 'critico'
  if (d <= s.stock_minimo) return 'bajo'
  return 'ok'
}
function labelUbicacion(u: string, gruas: GruaItem[]) {
  if (u === 'bodega') return 'Bodega'
  return gruas.find(g => g.id === u)?.placa ?? u
}

interface Props {
  gruas:   GruaItem[]
  items:   ItemUbicacion[]
  sticker: RangoSticker | null
}

export function InventariosClient({ gruas, items: itemsIniciales, sticker: stickerInicial }: Props) {
  const { mutate, pending } = useMutation()

  const [categoriaActiva, setCategoriaActiva] = useState<Categoria | 'todos'>('todos')
  const [gruaExpandida,   setGruaExpandida]   = useState(false)

  const [stickerUsados,   setStickerUsados]   = useState(stickerInicial?.usados ?? 0)
  const [stickerRangoFin, setStickerRangoFin] = useState(stickerInicial?.rango_fin ?? 0)
  const [modalSticker,    setModalSticker]    = useState(false)
  const [inputSticker,    setInputSticker]    = useState('')
  const inputNum    = parseInt(inputSticker, 10)
  const inputValido = !isNaN(inputNum) && inputNum > stickerUsados && stickerInicial != null && inputNum <= stickerRangoFin

  const [modalAmpliar,  setModalAmpliar]  = useState(false)
  const [inputNuevoFin, setInputNuevoFin] = useState('')
  const nuevoFinNum   = parseInt(inputNuevoFin, 10)
  const ampliarValido = !isNaN(nuevoFinNum) && nuevoFinNum > stickerRangoFin

  function confirmarAmpliarRango() {
    if (!ampliarValido || !stickerInicial) return
    const rangoFinAnterior = stickerRangoFin
    const nuevoFinCapturado = nuevoFinNum
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/ampliar-rango', 'PATCH', { item_id: stickerInicial.item_id, nuevo_fin: nuevoFinCapturado }),
      {
        refresh: false,
        onSuccess: () => {
          setStickerRangoFin(nuevoFinCapturado)
          setModalAmpliar(false)
          setInputNuevoFin('')
          setUndoBanner({ mensaje: `Rango ampliado hasta #${nuevoFinCapturado.toLocaleString('es-CO')}`, payload: { tipo: 'ampliar_rango', item_id: stickerInicial.item_id, rango_fin_anterior: rangoFinAnterior } })
        },
      }
    )
  }

  const [modalInicializar, setModalInicializar] = useState(false)
  const [initInicio,       setInitInicio]       = useState('1')
  const [initFin,          setInitFin]          = useState('')
  const [initUsados,       setInitUsados]       = useState('0')
  const initInicioNum = parseInt(initInicio, 10)
  const initFinNum    = parseInt(initFin, 10)
  const initUsadosNum = parseInt(initUsados, 10)
  const initValido    = !isNaN(initInicioNum) && !isNaN(initFinNum) && !isNaN(initUsadosNum)
    && initFinNum > initInicioNum && initUsadosNum >= 0 && initUsadosNum <= initFinNum

  function confirmarInicializar() {
    if (!initValido || !stickerInicial) return
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/inicializar-rango', 'POST', {
        item_id: stickerInicial.item_id, rango_inicio: initInicioNum, rango_fin: initFinNum, usados: initUsadosNum,
      }),
      {
        successMessage: 'Rango de stickers configurado',
        onSuccess: () => { setStickerRangoFin(initFinNum); setStickerUsados(initUsadosNum); setModalInicializar(false) },
      }
    )
  }

  function confirmarActualizacionSticker() {
    if (!inputValido || !stickerInicial) return
    const usadosAnterior = stickerUsados
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/sticker', 'PATCH', { item_id: stickerInicial.item_id, usados: inputNum }),
      {
        refresh: false,
        onSuccess: () => {
          setStickerUsados(inputNum)
          setModalSticker(false)
          setInputSticker('')
          setUndoBanner({ mensaje: 'Último sticker usado actualizado', payload: { tipo: 'sticker', item_id: stickerInicial.item_id, usados_anterior: usadosAnterior } })
        },
      }
    )
  }

  const [modalAgregar,    setModalAgregar]    = useState(false)
  const [agregarConfirmar, setAgregarConfirmar] = useState(false)
  const [agregarItemId,   setAgregarItemId]   = useState(itemsIniciales[0]?.id ?? '')
  const [agregarCantidad, setAgregarCantidad] = useState('')
  const agregarCant    = parseInt(agregarCantidad, 10)
  const agregarValido  = !isNaN(agregarCant) && agregarCant > 0
  const agregarItemAct = itemsIniciales.find(i => i.id === agregarItemId)

  function abrirAgregar(itemId?: string) {
    setAgregarItemId(itemId ?? itemsIniciales[0]?.id ?? '')
    setAgregarCantidad('')
    setAgregarConfirmar(false)
    setModalAgregar(true)
  }

  function confirmarAgregar() {
    if (!agregarValido) return
    const capturedItemId  = agregarItemId
    const capturedCantidad = agregarCant
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/agregar', 'POST', { item_id: capturedItemId, cantidad: capturedCantidad }),
      {
        onSuccess: () => {
          setModalAgregar(false)
          setAgregarConfirmar(false)
          setUndoBanner({ mensaje: 'Stock agregado a bodega', payload: { tipo: 'agregar', item_id: capturedItemId, cantidad: capturedCantidad } })
        },
      }
    )
  }

  const [modalMover,    setModalMover]    = useState(false)
  const [moverItemId,   setMoverItemId]   = useState(itemsIniciales[0]?.id ?? '')
  const [moverOrigen,   setMoverOrigen]   = useState('bodega')
  const [moverDestino,  setMoverDestino]  = useState(gruas[0]?.id ?? '')
  const [moverCantidad, setMoverCantidad] = useState('')
  const moverItem   = itemsIniciales.find(i => i.id === moverItemId)
  const stockOrigen = moverItem
    ? moverOrigen === 'bodega' ? moverItem.bodega : (moverItem.gruas[moverOrigen] ?? 0)
    : 0
  const moverCant   = parseInt(moverCantidad, 10)
  const moverValido = !isNaN(moverCant) && moverCant > 0 && moverCant <= stockOrigen && moverOrigen !== moverDestino

  function abrirMover(itemId?: string) {
    setMoverItemId(itemId ?? itemsIniciales[0]?.id ?? '')
    setMoverOrigen('bodega')
    setMoverDestino(gruas[0]?.id ?? '')
    setMoverCantidad('')
    setModalMover(true)
  }

  function confirmarMover() {
    if (!moverValido) return
    const capturedItemId  = moverItemId
    const capturedOrigen  = moverOrigen
    const capturedDestino = moverDestino
    const capturedCantidad = moverCant
    const capturedUnidad  = moverItem?.unidad ?? ''
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/mover', 'POST', { item_id: capturedItemId, origen: capturedOrigen, destino: capturedDestino, cantidad: capturedCantidad }),
      {
        onSuccess: () => {
          setModalMover(false)
          setUndoBanner({ mensaje: `${capturedCantidad} ${capturedUnidad} movidos`, payload: { tipo: 'mover', item_id: capturedItemId, origen: capturedOrigen, destino: capturedDestino, cantidad: capturedCantidad } })
        },
      }
    )
  }

  type DeshacerPayload =
    | { tipo: 'agregar';       item_id: string; cantidad: number }
    | { tipo: 'mover';         item_id: string; cantidad: number; origen: string; destino: string }
    | { tipo: 'sticker';       item_id: string; usados_anterior: number }
    | { tipo: 'ampliar_rango'; item_id: string; rango_fin_anterior: number }

  const [undoBanner, setUndoBanner] = useState<{ mensaje: string; payload: DeshacerPayload } | null>(null)

  function deshacerOperacion(op: DeshacerPayload) {
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/deshacer', 'POST', op),
      { successMessage: 'Acción deshecha' }
    )
  }

  const [modalTurno,     setModalTurno]     = useState(false)
  const [turnoGruaId,    setTurnoGruaId]    = useState(gruas[0]?.id ?? '')
  const [turnoFinales,   setTurnoFinales]   = useState<Record<string, string>>({})
  const [turnoConfirmar, setTurnoConfirmar] = useState(false)

  function abrirTurno() {
    setTurnoGruaId(gruas[0]?.id ?? '')
    setTurnoFinales({})
    setTurnoConfirmar(false)
    setModalTurno(true)
  }

  const turnoResumen = useMemo(() => itemsIniciales.map(item => {
    const inicial  = item.gruas[turnoGruaId] ?? 0
    const finalStr = turnoFinales[item.id] ?? ''
    const final    = finalStr === '' ? null : parseInt(finalStr, 10)
    const usados   = final !== null && !isNaN(final) ? inicial - final : null
    return { item, inicial, final, usados }
  }), [itemsIniciales, turnoGruaId, turnoFinales])

  const turnoValido = turnoResumen.every(r =>
    r.final === null || (!isNaN(r.final!) && r.final! >= 0 && r.final! <= r.inicial)
  ) && turnoResumen.some(r => r.final !== null)

  function confirmarTurno() {
    if (!turnoValido) return
    mutate(
      () => apiFetch('/api/parqueadero/inventarios/cierre-turno', 'POST', {
        vehiculo_id: turnoGruaId,
        fecha:       new Date().toISOString().split('T')[0],
        items:       turnoResumen
          .filter(r => r.final !== null)
          .map(r => ({ item_id: r.item.id, cantidad_inicial: r.inicial, cantidad_final: r.final! })),
      }),
      { successMessage: 'Cierre de turno registrado', onSuccess: () => { setModalTurno(false); setTurnoConfirmar(false) } }
    )
  }

  const [loadingPDF,   setLoadingPDF]   = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingCSV,   setLoadingCSV]   = useState(false)

  function toFilaStock(): FilaStock[] {
    return itemsIniciales.map(item => ({
      item_id:      item.id,
      nombre:       item.nombre,
      categoria:    item.categoria,
      unidad:       item.unidad,
      stock_minimo: item.stock_minimo,
      bodega:       item.bodega,
      gruas:        Object.fromEntries(gruas.map(g => [g.placa, item.gruas[g.id] ?? 0])),
      total:        totalItem(item),
    }))
  }

  function toFilaSticker(): FilaSticker | null {
    if (!stickerInicial) return null
    return {
      item_id:      stickerInicial.item_id,
      nombre:       stickerInicial.nombre,
      rango_inicio: stickerInicial.rango_inicio,
      rango_fin:    stickerRangoFin,
      usados:       stickerUsados,
      disponibles:  stickerDisponibles,
      stock_minimo: stickerInicial.stock_minimo,
      pct_uso:      stickerPct,
      configurado:  stickerConfigurado,
    }
  }

  async function exportarPDF() {
    try {
      setLoadingPDF(true)
      await generarPDFReporte(
        <DocumentoStockPDF stock={toFilaStock()} sticker={toFilaSticker()} />,
        `inventarios-stock-${new Date().toISOString().split('T')[0]}`
      )
      toast.success('PDF generado')
    } catch { toast.error('Error al generar PDF') } finally { setLoadingPDF(false) }
  }

  async function exportarExcel() {
    try {
      setLoadingExcel(true)
      await generarExcelInventario(toFilaStock(), 'stock', `inventarios-stock-${new Date().toISOString().split('T')[0]}`)
      toast.success('Excel generado')
    } catch { toast.error('Error al generar Excel') } finally { setLoadingExcel(false) }
  }

  function exportarCSV() {
    try {
      setLoadingCSV(true)
      generarCSVInventario(toFilaStock(), 'stock', `inventarios-stock-${new Date().toISOString().split('T')[0]}`)
      toast.success('CSV generado')
    } catch { toast.error('Error al generar CSV') } finally { setLoadingCSV(false) }
  }

  const mostrarTabla   = categoriaActiva !== 'stickers'
  const mostrarSticker = (categoriaActiva === 'todos' || categoriaActiva === 'stickers') && stickerInicial

  const itemsFiltrados = useMemo(() =>
    categoriaActiva === 'todos' || categoriaActiva === 'stickers'
      ? itemsIniciales
      : itemsIniciales.filter(i => i.categoria === categoriaActiva),
    [categoriaActiva, itemsIniciales]
  )

  const resumen = useMemo(() => ({
    totalBodega:  itemsIniciales.reduce((s, i) => s + i.bodega, 0),
    totalEnGruas: itemsIniciales.reduce((s, i) => s + stockGruas(i), 0),
    itemsBajos:   itemsIniciales.filter(i => estadoItem(i) !== 'ok').length,
  }), [itemsIniciales])

  const stickerConfigurado = stickerInicial?.configurado ?? false
  const stickerDisponibles = stickerConfigurado ? stickerRangoFin - stickerUsados : 0
  const stickerPct         = stickerConfigurado && stickerRangoFin > 0
    ? Math.round((stickerUsados / stickerRangoFin) * 100)
    : 0
  const stickerEstado = stickerConfigurado
    ? estadoSticker({ ...stickerInicial!, rango_fin: stickerRangoFin, usados: stickerUsados })
    : 'ok'

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventarios</h1>
          <p className="text-muted-foreground">Stock en bodega, distribución por grúa y stickers por rango</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loadingPDF || loadingExcel || loadingCSV}>
                {(loadingPDF || loadingExcel || loadingCSV)
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <Download className="h-4 w-4 mr-2" />}
                Exportar
                <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportarPDF} disabled={loadingPDF}>
                <FileText className="h-4 w-4 mr-2" />PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarExcel} disabled={loadingExcel}>
                <Table className="h-4 w-4 mr-2" />Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarCSV} disabled={loadingCSV}>
                <Download className="h-4 w-4 mr-2" />CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => abrirMover()} disabled={pending}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />Mover
          </Button>
          <Button variant="outline" size="sm" onClick={abrirTurno} disabled={pending}>
            <ClipboardList className="h-4 w-4 mr-2" />Cierre de turno
          </Button>
          <Button size="sm" onClick={() => abrirAgregar()} disabled={pending}>
            <Plus className="h-4 w-4 mr-2" />Agregar al stock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2.5 shrink-0"><Warehouse className="h-5 w-5 text-cyan-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">En bodega</p>
              <p className="text-2xl font-bold text-cyan-600">{resumen.totalBodega}</p>
              <p className="text-xs text-muted-foreground">hojas · unds</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 shrink-0"><Truck className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">En grúas</p>
              <p className="text-2xl font-bold text-blue-600">{resumen.totalEnGruas}</p>
              <p className="text-xs text-muted-foreground">{gruas.length} grúas</p>
            </div>
          </CardContent>
        </Card>
        {stickerInicial && stickerConfigurado && (
          <Card className={stickerEstado !== 'ok' ? 'border-orange-200' : ''}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`rounded-lg p-2.5 shrink-0 ${stickerEstado !== 'ok' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                <Hash className={`h-5 w-5 ${stickerEstado !== 'ok' ? 'text-orange-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stickers disp.</p>
                <p className={`text-2xl font-bold ${stickerEstado !== 'ok' ? 'text-orange-600' : 'text-purple-600'}`}>
                  {stickerDisponibles.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-muted-foreground">{stickerPct}% usado</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className={resumen.itemsBajos > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-5 flex items-center gap-3">
            <div className={`rounded-lg p-2.5 shrink-0 ${resumen.itemsBajos > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`h-5 w-5 ${resumen.itemsBajos > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
              <p className={`text-2xl font-bold ${resumen.itemsBajos > 0 ? 'text-red-600' : 'text-green-600'}`}>{resumen.itemsBajos}</p>
              <p className="text-xs text-muted-foreground">{resumen.itemsBajos === 0 ? 'Todo normal' : 'requieren reposición'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['todos', 'libretas', 'sellos', 'stickers'] as const).map(key => {
          const cfg    = key === 'todos' ? null : CAT_CONFIG[key]
          const Icon   = cfg?.icon ?? Package
          const label  = cfg?.label ?? 'Todos'
          const active = categoriaActiva === key
          return (
            <button key={key} onClick={() => setCategoriaActiva(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                active
                  ? key === 'todos' ? 'bg-cyan-600 text-white border-cyan-600' : `${cfg!.bg} ${cfg!.color} border-current`
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          )
        })}
      </div>

      {mostrarTabla && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[280px]">Ítem</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5"><Warehouse className="h-3.5 w-3.5" />Bodega</div>
                  </th>
                  {gruas.map(g => (
                    <th key={g.id} className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5"><Truck className="h-3.5 w-3.5" />{g.placa}</div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 w-[100px]" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {itemsFiltrados.length === 0 && (
                  <tr><td colSpan={4 + gruas.length + 2} className="px-4 py-12 text-center text-muted-foreground">Sin ítems</td></tr>
                )}
                {itemsFiltrados.map(item => {
                  const cfg    = CAT_CONFIG[item.categoria]
                  const Icon   = cfg.icon
                  const total  = totalItem(item)
                  const estado = estadoItem(item)
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-md p-1.5 shrink-0 ${cfg.bg}`}><Icon className={`h-4 w-4 ${cfg.color}`} /></div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.nombre}</p>
                            <p className="text-xs text-muted-foreground">Mín: {item.stock_minimo} {item.unidad}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-base font-semibold ${item.bodega <= item.stock_minimo ? 'text-orange-600' : ''}`}>{item.bodega}</span>
                        <span className="text-xs text-muted-foreground ml-1">{item.unidad}</span>
                      </td>
                      {gruas.map(g => (
                        <td key={g.id} className="px-4 py-3 text-center">
                          <span className={`text-base font-medium ${(item.gruas[g.id] ?? 0) === 0 ? 'text-muted-foreground' : ''}`}>
                            {item.gruas[g.id] ?? 0}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center"><span className="text-base font-bold">{total}</span></td>
                      <td className="px-4 py-3 text-center">
                        {estado === 'critico' && <Badge variant="destructive" className="text-xs">Sin stock</Badge>}
                        {estado === 'bajo'    && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Stock bajo</Badge>}
                        {estado === 'ok'      && <Badge variant="outline" className="text-xs text-green-600 border-green-300">Normal</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1" onClick={() => abrirMover(item.id)}>
                          <ArrowRightLeft className="h-3.5 w-3.5" />Mover
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{itemsFiltrados.length} {itemsFiltrados.length === 1 ? 'ítem' : 'ítems'}</span>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => setGruaExpandida(!gruaExpandida)}>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${gruaExpandida ? 'rotate-180' : ''}`} />
              Vista por grúa
            </button>
          </div>
        </div>
      )}

      {mostrarTabla && gruaExpandida && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />Detalle por grúa
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gruas.map(g => (
              <Card key={g.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-cyan-600" /><span className="font-semibold">{g.placa}</span></div>
                  <div className="space-y-2">
                    {itemsFiltrados.map(item => {
                      const cantidad = item.gruas[g.id] ?? 0
                      const cfg = CAT_CONFIG[item.categoria]
                      const Icon = cfg.icon
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
                            <span className="text-sm truncate">{item.nombre}</span>
                          </div>
                          <span className={`text-sm font-medium shrink-0 ${cantidad === 0 ? 'text-muted-foreground' : ''}`}>
                            {cantidad} {item.unidad}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {mostrarSticker && stickerInicial && (
        <Card className={!stickerInicial.configurado ? 'border-dashed' : stickerEstado !== 'ok' ? 'border-orange-200' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-md bg-purple-100 p-1.5"><Layers className="h-4 w-4 text-purple-600" /></div>
                {stickerInicial.nombre}
              </CardTitle>
              {!stickerInicial.configurado
                ? <Badge variant="outline" className="text-xs text-muted-foreground">Sin configurar</Badge>
                : stickerEstado === 'critico' ? <Badge variant="destructive" className="text-xs">Sin stock</Badge>
                : stickerEstado === 'bajo'    ? <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Stock bajo</Badge>
                : <Badge variant="outline" className="text-xs text-green-600 border-green-300">Normal</Badge>
              }
            </div>
            <p className="text-xs text-muted-foreground">Numeración secuencial</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!stickerInicial.configurado ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">El rango de stickers aún no está configurado.</p>
                <Button size="sm" onClick={() => { setInitInicio('1'); setInitFin(''); setInitUsados('0'); setModalInicializar(true) }}>
                  <Plus className="h-4 w-4 mr-2" />Configurar rango inicial
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-0.5">
                    <p className="text-2xl font-bold">{stickerRangoFin.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-muted-foreground">Total habilitados</p>
                    <p className="text-xs text-muted-foreground">#{stickerInicial.rango_inicio.toLocaleString('es-CO')} → #{stickerRangoFin.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-bold">{stickerUsados.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-muted-foreground">Último usado</p>
                    <p className="text-xs text-muted-foreground">sticker #{stickerUsados.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-2xl font-bold ${stickerEstado !== 'ok' ? 'text-orange-600' : 'text-purple-600'}`}>
                      {stickerDisponibles.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-muted-foreground">Disponibles</p>
                    <p className="text-xs text-muted-foreground">Mín: {stickerInicial.stock_minimo.toLocaleString('es-CO')}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stickerPct}% utilizado</span><span>{100 - stickerPct}% disponible</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stickerEstado === 'critico' ? 'bg-red-500' : stickerEstado === 'bajo' ? 'bg-orange-500' : 'bg-purple-500'}`}
                      style={{ width: `${stickerPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setInputSticker(''); setModalSticker(true) }}>
                    <Pencil className="h-4 w-4 mr-2" />Actualizar último usado
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setInputNuevoFin(''); setModalAmpliar(true) }}>
                    <Plus className="h-4 w-4 mr-2" />Ampliar rango
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={modalAgregar} onOpenChange={v => { if (!v) { setModalAgregar(false); setAgregarConfirmar(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Agregar al stock</DialogTitle></DialogHeader>
          {!agregarConfirmar ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Ítem</Label>
                  <Select value={agregarItemId} onValueChange={v => { setAgregarItemId(v); setAgregarCantidad('') }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{itemsIniciales.map(i => <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad a agregar</Label>
                  <Input type="number" placeholder="Ej: 50" min={1} value={agregarCantidad} onChange={e => setAgregarCantidad(e.target.value)} />
                  <p className="text-xs text-muted-foreground">
                    Stock actual en bodega: <span className="font-medium">{agregarItemAct?.bodega ?? 0} {agregarItemAct?.unidad}</span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalAgregar(false)}>Cancelar</Button>
                <Button disabled={!agregarValido} onClick={() => setAgregarConfirmar(true)}>Continuar</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">Revisa el ingreso antes de confirmar.</p>
                <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Ítem</span><span className="font-semibold">{agregarItemAct?.nombre}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cantidad a ingresar</span><span className="font-semibold text-green-600">+{agregarCant} {agregarItemAct?.unidad}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Stock en bodega</span><span>{agregarItemAct?.bodega ?? 0} → <span className="font-bold">{(agregarItemAct?.bodega ?? 0) + agregarCant}</span> {agregarItemAct?.unidad}</span></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAgregarConfirmar(false)}>Atrás</Button>
                <Button disabled={pending} onClick={confirmarAgregar}><Check className="h-4 w-4 mr-2" />Confirmar ingreso</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={modalMover} onOpenChange={v => { if (!v) setModalMover(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5" />Mover stock</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ítem</Label>
              <Select value={moverItemId} onValueChange={v => { setMoverItemId(v); setMoverCantidad('') }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{itemsIniciales.map(i => <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Origen</Label>
                <Select value={moverOrigen} onValueChange={v => { setMoverOrigen(v); setMoverCantidad('') }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bodega">Bodega ({moverItem?.bodega ?? 0})</SelectItem>
                    {gruas.map(g => <SelectItem key={g.id} value={g.id}>{g.placa} ({moverItem?.gruas[g.id] ?? 0})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destino</Label>
                <Select value={moverDestino} onValueChange={setMoverDestino}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {moverOrigen !== 'bodega' && <SelectItem value="bodega">Bodega</SelectItem>}
                    {gruas.filter(g => g.id !== moverOrigen).map(g => <SelectItem key={g.id} value={g.id}>{g.placa}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input type="number" placeholder={`Máx: ${stockOrigen}`} min={1} max={stockOrigen}
                value={moverCantidad} onChange={e => setMoverCantidad(e.target.value)} />
              {moverCantidad && !moverValido && moverCant > stockOrigen && (
                <p className="text-xs text-destructive">No hay suficiente stock en {labelUbicacion(moverOrigen, gruas)} (disponible: {stockOrigen}).</p>
              )}
            </div>
            {moverValido && moverItem && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{labelUbicacion(moverOrigen, gruas)}</span>
                  <span>{stockOrigen} → <span className="font-semibold">{stockOrigen - moverCant}</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{labelUbicacion(moverDestino, gruas)}</span>
                  <span>
                    {(moverDestino === 'bodega' ? moverItem.bodega : (moverItem.gruas[moverDestino] ?? 0))} → <span className="font-semibold">{(moverDestino === 'bodega' ? moverItem.bodega : (moverItem.gruas[moverDestino] ?? 0)) + moverCant}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMover(false)}>Cancelar</Button>
            <Button disabled={!moverValido || pending} onClick={confirmarMover}>Confirmar movimiento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalTurno} onOpenChange={v => { if (!v) { setModalTurno(false); setTurnoConfirmar(false) } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Reporte de cierre de turno</DialogTitle></DialogHeader>
          {!turnoConfirmar ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Grúa</Label>
                <Select value={turnoGruaId} onValueChange={v => { setTurnoGruaId(v); setTurnoFinales({}) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{gruas.map(g => <SelectItem key={g.id} value={g.id}>{g.placa}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Ingresa cuántas unidades quedan al finalizar el turno. Deja vacío lo que no se modificó.</p>
              <div className="space-y-3">
                {itemsIniciales.map(item => {
                  const inicial  = item.gruas[turnoGruaId] ?? 0
                  const finalVal = turnoFinales[item.id] ?? ''
                  const cfg      = CAT_CONFIG[item.categoria]
                  const Icon     = cfg.icon
                  const invalido = finalVal !== '' && !isNaN(parseInt(finalVal, 10)) && parseInt(finalVal, 10) > inicial
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`rounded-md p-1.5 shrink-0 ${cfg.bg}`}><Icon className={`h-4 w-4 ${cfg.color}`} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">Inicio: {inicial} {item.unidad}</p>
                      </div>
                      <div className="w-32 shrink-0">
                        <Input type="number" placeholder="Final" min={0} max={inicial}
                          value={finalVal} onChange={e => setTurnoFinales(p => ({ ...p, [item.id]: e.target.value }))}
                          className={`h-8 text-sm ${invalido ? 'border-destructive' : ''}`} />
                        {invalido && <p className="text-xs text-destructive mt-0.5">Máx: {inicial}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Resumen — <span className="font-medium text-foreground">{gruas.find(g => g.id === turnoGruaId)?.placa}</span>
              </p>
              <div className="rounded-md border divide-y">
                {turnoResumen.map(r => (
                  <div key={r.item.id} className="px-3 py-2.5 flex items-center justify-between text-sm">
                    <span>{r.item.nombre}</span>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-muted-foreground">{r.inicial} → {r.final ?? r.inicial} {r.item.unidad}</span>
                      <span className={`font-semibold w-24 ${(r.usados ?? 0) > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {r.usados !== null && r.usados > 0 ? `−${r.usados} usados` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm flex justify-between">
                <span className="text-muted-foreground">Total consumido</span>
                <span className="font-bold">{turnoResumen.reduce((s, r) => s + (r.usados ?? 0), 0)} unidades</span>
              </div>
              <p className="text-xs text-muted-foreground">Los ítems consumidos se descontarán del stock total. Esta acción no se puede deshacer.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalTurno(false); setTurnoConfirmar(false) }}>Cancelar</Button>
            {!turnoConfirmar
              ? <Button disabled={!turnoValido} onClick={() => setTurnoConfirmar(true)}>Ver resumen</Button>
              : <Button disabled={pending} onClick={confirmarTurno}><Check className="h-4 w-4 mr-2" />Confirmar cierre</Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalInicializar} onOpenChange={v => { if (!v) setModalInicializar(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Hash className="h-5 w-5" />Configurar rango de stickers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Ingresa el rango de numeración del talonario físico que tienes actualmente.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Primer número</Label>
                <Input type="number" min={0} value={initInicio} onChange={e => setInitInicio(e.target.value)} placeholder="Ej: 1" />
              </div>
              <div className="space-y-2">
                <Label>Último número</Label>
                <Input type="number" min={1} value={initFin} onChange={e => setInitFin(e.target.value)} placeholder="Ej: 5000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Último sticker ya usado</Label>
              <Input type="number" min={0} value={initUsados} onChange={e => setInitUsados(e.target.value)} placeholder="Ej: 4580" />
              <p className="text-xs text-muted-foreground">Si empiezas desde cero, deja en 0.</p>
            </div>
            {initValido && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rango</span>
                  <span className="font-mono">#{initInicioNum.toLocaleString('es-CO')} → #{initFinNum.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles</span>
                  <span className="font-semibold text-purple-600">{(initFinNum - initUsadosNum).toLocaleString('es-CO')}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalInicializar(false)}>Cancelar</Button>
            <Button disabled={!initValido || pending} onClick={confirmarInicializar}>Guardar configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalAmpliar} onOpenChange={v => { if (!v) setModalAmpliar(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Ampliar rango de stickers</DialogTitle>
          </DialogHeader>
          {stickerInicial && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rango actual</span>
                  <span className="font-mono">#{stickerInicial.rango_inicio.toLocaleString('es-CO')} → #{stickerRangoFin.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último usado</span>
                  <span className="font-mono">#{stickerUsados.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles actuales</span>
                  <span className="font-semibold text-purple-600">{stickerDisponibles.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nuevo límite superior</Label>
                <Input
                  type="number"
                  placeholder={`Mayor a ${stickerRangoFin.toLocaleString('es-CO')}`}
                  min={stickerRangoFin + 1}
                  value={inputNuevoFin}
                  onChange={e => setInputNuevoFin(e.target.value)}
                />
                {ampliarValido && (
                  <p className="text-xs text-muted-foreground">
                    Nuevos disponibles: <span className="font-semibold text-purple-600">{(nuevoFinNum - stickerUsados).toLocaleString('es-CO')}</span>
                    {' '}(+{(nuevoFinNum - stickerRangoFin).toLocaleString('es-CO')} stickers)
                  </p>
                )}
                {inputNuevoFin && !ampliarValido && (
                  <p className="text-xs text-destructive">El nuevo límite debe ser mayor a {stickerRangoFin.toLocaleString('es-CO')}.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAmpliar(false)}>Cancelar</Button>
            <Button disabled={!ampliarValido || pending} onClick={confirmarAmpliarRango}>Confirmar ampliación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalSticker} onOpenChange={v => { if (!v) { setModalSticker(false); setInputSticker('') } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Hash className="h-5 w-5" />Actualizar último sticker usado</DialogTitle>
          </DialogHeader>
          {stickerInicial && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último usado actual</span>
                  <span className="font-mono font-semibold">#{stickerUsados.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Máximo habilitado</span>
                  <span className="font-mono">#{stickerRangoFin.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nuevo último número usado</Label>
                <Input
                  type="number"
                  placeholder={`Mayor a ${stickerUsados.toLocaleString('es-CO')}`}
                  min={stickerUsados + 1}
                  max={stickerRangoFin}
                  value={inputSticker}
                  onChange={e => setInputSticker(e.target.value)}
                />
                {inputValido && (
                  <p className="text-xs text-muted-foreground">
                    Quedarán disponibles: <span className="font-semibold text-purple-600">{(stickerRangoFin - inputNum).toLocaleString('es-CO')}</span>
                    {' '}(−{(inputNum - stickerUsados).toLocaleString('es-CO')} usados)
                  </p>
                )}
                {inputSticker && !inputValido && (
                  <p className="text-xs text-destructive">
                    {inputNum <= stickerUsados
                      ? 'El número debe ser mayor al último registrado — no se puede retroceder.'
                      : 'No puede superar el rango máximo habilitado.'}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer. El contador no puede retroceder.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalSticker(false); setInputSticker('') }}>Cancelar</Button>
            <Button disabled={!inputValido || pending} onClick={confirmarActualizacionSticker}>
              <Check className="h-4 w-4 mr-2" />Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {undoBanner && (
        <UndoBanner
          mensaje={undoBanner.mensaje}
          onDeshacer={() => deshacerOperacion(undoBanner.payload)}
          onDismiss={() => setUndoBanner(null)}
        />
      )}
    </div>
  )
}
