import type { FilaStock, FilaCierre, TipoReporteInv } from './tipos'

export function generarCSVInventario(
  datos: FilaStock[] | FilaCierre[],
  tipo: TipoReporteInv,
  nombreArchivo: string
): void {
  if (!datos.length) throw new Error('No hay datos para exportar')

  const csv = tipo === 'stock'
    ? csvStock(datos as FilaStock[])
    : csvCierres(datos as FilaCierre[])

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function csvStock(datos: FilaStock[]): string {
  const gruasKeys = datos.length > 0 ? Object.keys(datos[0].gruas) : []
  const headers   = ['Ítem', 'Categoría', 'Unidad', 'Stock Mínimo', 'Bodega', ...gruasKeys, 'Total', 'Estado']
  const rows = datos.map(d => {
    const estado = d.total === 0 ? 'Sin stock' : d.total <= d.stock_minimo ? 'Stock bajo' : 'Normal'
    return [d.nombre, d.categoria, d.unidad, d.stock_minimo.toString(), d.bodega.toString(),
      ...gruasKeys.map(k => (d.gruas[k] ?? 0).toString()), d.total.toString(), estado]
  })
  return toCSV(headers, rows)
}

function csvCierres(datos: FilaCierre[]): string {
  const headers = ['Fecha', 'Grúa', 'Ítem', 'Unidad', 'Cantidad Inicial', 'Cantidad Final', 'Consumido', 'Registrado por']
  const rows = datos.map(d => [
    formatFecha(d.fecha), d.grua_placa, d.item_nombre, d.unidad,
    d.cantidad_inicial.toString(), d.cantidad_final.toString(), d.cantidad_consumida.toString(),
    d.registrado_por ?? '',
  ])
  return toCSV(headers, rows)
}

function toCSV(headers: string[], rows: string[][]): string {
  const esc = (v: string) => (v.includes(',') || v.includes('"') || v.includes('\n'))
    ? `"${v.replace(/"/g, '""')}"` : v
  return [headers, ...rows].map(r => r.map(esc).join(',')).join('\n')
}

function formatFecha(f: string): string {
  try {
    const d = new Date(f + 'T00:00:00')
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  } catch { return f }
}
