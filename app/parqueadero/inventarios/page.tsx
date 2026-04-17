import { createClient } from '@/lib/supabase/server'
import { InventariosClient } from './inventarios-client'
import type { GruaItem, ItemUbicacion, RangoSticker } from './inventarios-client'

export default async function InventariosPage() {
  const supabase = await createClient()

  const { data: gruasDB } = await supabase
    .from('parq_vehiculos')
    .select('id, placa')
    .eq('tipo', 'grua_plataforma')
    .eq('activo', true)
    .order('placa')

  const gruas: GruaItem[] = gruasDB ?? []

  const { data: insumos } = await supabase
    .from('inv_insumos')
    .select('id, nombre, categoria, unidad, stock_minimo, tipo_tracking')
    .eq('modulo', 'parqueadero')
    .eq('activo', true)
    .order('categoria')

  const { data: stockRows } = await supabase
    .from('inv_stock')
    .select('item_id, ubicacion, cantidad')
    .eq('modulo', 'parqueadero')

  const stickerInsumo = insumos?.find(i => i.tipo_tracking === 'rango')
  const { data: rangoRow } = stickerInsumo
    ? await supabase
        .from('inv_rangos')
        .select('rango_inicio, rango_fin, usados')
        .eq('item_id', stickerInsumo.id)
        .single()
    : { data: null }

  const items: ItemUbicacion[] = (insumos ?? [])
    .filter(i => i.tipo_tracking === 'ubicacion')
    .map(insumo => {
      const bodegaRow = stockRows?.find(s => s.item_id === insumo.id && s.ubicacion === 'bodega')
      const gruasStock: Record<string, number> = {}
      gruas.forEach(g => {
        const row = stockRows?.find(s => s.item_id === insumo.id && s.ubicacion === g.id)
        gruasStock[g.id] = row?.cantidad ?? 0
      })
      return {
        id:           insumo.id,
        categoria:    insumo.categoria as ItemUbicacion['categoria'],
        nombre:       insumo.nombre,
        unidad:       insumo.unidad,
        stock_minimo: insumo.stock_minimo,
        bodega:       bodegaRow?.cantidad ?? 0,
        gruas:        gruasStock,
      }
    })

  const sticker: RangoSticker | null = stickerInsumo
    ? {
        item_id:      stickerInsumo.id,
        nombre:       stickerInsumo.nombre,
        rango_inicio: rangoRow?.rango_inicio ?? 0,
        rango_fin:    rangoRow?.rango_fin    ?? 0,
        usados:       rangoRow?.usados       ?? 0,
        stock_minimo: stickerInsumo.stock_minimo,
        configurado:  rangoRow != null,
      }
    : null

  return <InventariosClient gruas={gruas} items={items} sticker={sticker} />
}
