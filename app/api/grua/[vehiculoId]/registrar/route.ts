import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGruaSession } from '@/lib/grua/jwt'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const salidaSchema = z.object({
  accion:           z.enum(['salida', 'regreso']),
  operador_id:      z.string().uuid().nullable().optional(),
  motivo:           z.enum(['requerimiento_agentes','requerimiento_polca','mantenimiento','tanqueo','autorizacion','otros']).optional(),
  trae_carga:       z.boolean().optional(),
  inventario_items: z.array(z.object({ item_id: z.string(), nombre: z.string(), desde: z.number(), hasta: z.number(), cantidad: z.number() })).optional(),
  observaciones:    z.string().nullable().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ vehiculoId: string }> }) {
  try {
    const { vehiculoId } = await params
    const session = await getGruaSession(vehiculoId)
    if (!session) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const body = await req.json()
    const parsed = salidaSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { accion, operador_id, motivo, trae_carga, inventario_items, observaciones } = parsed.data
    const admin = createAdminClient()
    const ahora = new Date().toISOString()

    if (accion === 'salida') {
      const { data: abierta } = await admin
        .from('parq_salidas_grua').select('id').eq('vehiculo_id', vehiculoId).is('hora_regreso', null).maybeSingle()

      if (abierta) return NextResponse.json({ error: 'La grúa ya tiene una salida sin regreso registrado' }, { status: 409 })
      if (!motivo)  return NextResponse.json({ error: 'Motivo requerido' }, { status: 400 })

      const col   = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })
      const d     = new Date(col)
      const fecha = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`

      let codigo_salida = ''
      for (let i = 0; i < 10; i++) {
        const digitos   = String(Math.floor(10000 + Math.random() * 90000))
        const candidato = `${fecha}-${digitos}`
        const { data: existe } = await admin
          .from('parq_salidas_grua').select('id').eq('codigo_salida', candidato).maybeSingle()
        if (!existe) { codigo_salida = candidato; break }
      }
      if (!codigo_salida) return NextResponse.json({ error: 'No se pudo generar un código único' }, { status: 500 })

      const { data, error } = await admin.from('parq_salidas_grua').insert({
        vehiculo_id:   vehiculoId,
        operador_id:   operador_id ?? null,
        hora_salida:   ahora,
        motivo,
        codigo_salida,
        observaciones: observaciones ?? null,
      }).select('id').single()

      if (error) {
        // 23505 = unique_violation — el código colisionó por concurrencia, reintentar
        if ((error as { code?: string }).code === '23505') {
          return NextResponse.json({ error: 'Código duplicado, intenta de nuevo' }, { status: 409 })
        }
        throw error
      }
      return NextResponse.json({ ok: true, id: data.id, accion: 'salida', codigo_salida })
    }

    // Regreso
    const { data: abierta } = await admin
      .from('parq_salidas_grua').select('id').eq('vehiculo_id', vehiculoId)
      .is('hora_regreso', null).order('hora_salida', { ascending: false }).limit(1).maybeSingle()

    if (!abierta) return NextResponse.json({ error: 'No hay salida abierta para registrar regreso' }, { status: 409 })

    const { error } = await admin.from('parq_salidas_grua').update({
      hora_regreso:     ahora,
      trae_carga:       trae_carga ?? false,
      inventario_items: inventario_items ?? [],
      observaciones:    observaciones ?? null,
    }).eq('id', abierta.id)

    if (error) throw error
    return NextResponse.json({ ok: true, accion: 'regreso' })
  } catch (err) {
    logger.error('grua/registrar', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
