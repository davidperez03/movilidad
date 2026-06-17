import { NextRequest, NextResponse } from 'next/server'
import { getGruaSession } from '@/lib/grua/jwt'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ vehiculoId: string }> }) {
  const { vehiculoId } = await params
  const session = await getGruaSession(vehiculoId)
  if (!session) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

  const admin = createAdminClient()

  const [{ data: vehiculo }, { data: ultima }, { data: operadorActual }, { data: personal }, { data: inventario }] =
    await Promise.all([
      admin.from('parq_vehiculos').select('id, placa, marca, modelo, tipo').eq('id', vehiculoId).single(),
      admin.from('parq_salidas_grua').select('*').eq('vehiculo_id', vehiculoId).order('hora_salida', { ascending: false }).limit(1).maybeSingle(),
      admin.from('parq_vista_inspecciones').select('operador_id, operador_nombre').eq('vehiculo_id', vehiculoId).order('fecha', { ascending: false }).order('hora', { ascending: false }).limit(1).maybeSingle(),
      admin.from('parq_vista_personal').select('id, nombre_completo, rol_codigo'),
      admin.from('inv_stock').select('item_id, cantidad, inv_insumos(id, nombre, unidad)').eq('ubicacion', vehiculoId).eq('modulo', 'parqueadero').gt('cantidad', 0),
    ])

  return NextResponse.json({
    vehiculo,
    enCalle:         ultima && !ultima.hora_regreso,
    ultimaSalida:    ultima,
    operadorActual:  operadorActual ? { id: operadorActual.operador_id, nombre: operadorActual.operador_nombre } : null,
    personal:        (personal ?? []).filter(p => ['parq_operario', 'parq_auxiliar', 'parq_administrador'].includes(p.rol_codigo)),
    inventarioGrua:  (inventario ?? []).map(i => ({
      item_id:  i.item_id,
      nombre:   (i.inv_insumos as unknown as { nombre: string; unidad: string } | null)?.nombre ?? '',
      unidad:   (i.inv_insumos as unknown as { nombre: string; unidad: string } | null)?.unidad ?? '',
      cantidad: i.cantidad,
    })),
  })
}
