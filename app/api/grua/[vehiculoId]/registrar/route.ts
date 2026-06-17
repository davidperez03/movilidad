import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGruaSession } from '@/lib/grua/jwt'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const salidaSchema = z.object({
  accion:           z.enum(['salida', 'regreso']),
  operador_id:      z.string().uuid().optional(),
  hora:             z.string(),
  motivo:           z.enum(['requerimiento_agentes','requerimiento_polca','mantenimiento','tanqueo','autorizacion','otros']).optional(),
  trae_carga:       z.boolean().optional(),
  inventario_items: z.array(z.object({ item_id: z.string(), nombre: z.string(), cantidad: z.number(), unidad: z.string() })).optional(),
  observaciones:    z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ vehiculoId: string }> }) {
  try {
    const { vehiculoId } = await params
    const session = await getGruaSession(vehiculoId)
    if (!session) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const body = await req.json()
    const parsed = salidaSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { accion, operador_id, hora, motivo, trae_carga, inventario_items, observaciones } = parsed.data
    const admin = createAdminClient()

    if (accion === 'salida') {
      const { data: abierta } = await admin
        .from('parq_salidas_grua')
        .select('id')
        .eq('vehiculo_id', vehiculoId)
        .is('hora_regreso', null)
        .maybeSingle()

      if (abierta) return NextResponse.json({ error: 'La grúa ya tiene una salida sin regreso registrado' }, { status: 409 })
      if (!motivo)  return NextResponse.json({ error: 'Motivo requerido' }, { status: 400 })

      const { data, error } = await admin.from('parq_salidas_grua').insert({
        vehiculo_id:      vehiculoId,
        operador_id:      operador_id ?? null,
        hora_salida:      hora,
        motivo,
        trae_carga:       trae_carga ?? false,
        inventario_items: inventario_items ?? [],
        observaciones:    observaciones ?? null,
      }).select('id').single()

      if (error) throw error
      return NextResponse.json({ ok: true, id: data.id, accion: 'salida' })
    }

    // Regreso
    const { data: abierta } = await admin
      .from('parq_salidas_grua')
      .select('id')
      .eq('vehiculo_id', vehiculoId)
      .is('hora_regreso', null)
      .order('hora_salida', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!abierta) return NextResponse.json({ error: 'No hay salida abierta para registrar regreso' }, { status: 409 })

    const { error } = await admin.from('parq_salidas_grua').update({
      hora_regreso:  hora,
      observaciones: observaciones ?? null,
    }).eq('id', abierta.id)

    if (error) throw error
    return NextResponse.json({ ok: true, accion: 'regreso' })
  } catch (err) {
    logger.error('grua/registrar', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
