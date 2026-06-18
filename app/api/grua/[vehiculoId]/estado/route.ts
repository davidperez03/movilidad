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
      admin.from('inv_rangos').select('item_id, rango_inicio, rango_fin, usados, inv_insumos!inner(id, nombre, modulo, tipo_tracking)').eq('inv_insumos.modulo', 'parqueadero').eq('inv_insumos.tipo_tracking', 'rango'),
    ])

  return NextResponse.json({
    vehiculo,
    enCalle:         ultima && !ultima.hora_regreso,
    ultimaSalida:    ultima,
    operadorActual:  operadorActual ? { id: operadorActual.operador_id, nombre: operadorActual.operador_nombre } : null,
    personal:        (personal ?? []).filter(p => ['parq_operario', 'parq_auxiliar', 'parq_administrador'].includes(p.rol_codigo)),
    inventarioGrua:  (inventario ?? []).map(i => {
      const insumo = i.inv_insumos as unknown as { id: string; nombre: string } | null
      const disponibles = (i.rango_fin ?? 0) - (i.usados ?? 0)
      return {
        item_id:     i.item_id,
        nombre:      insumo?.nombre ?? '',
        usados:      i.usados ?? 0,
        rango_fin:   i.rango_fin ?? 0,
        disponibles,
      }
    }).filter(i => i.disponibles > 0),
  })
}
