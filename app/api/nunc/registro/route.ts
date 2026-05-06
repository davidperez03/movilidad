import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { nuncRegistroLimiter, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  codigo: z.string(),
  placa: z.string().min(4).max(10),
  nunc_dpto: z.string().min(1).max(3),
  nunc_municipio: z.string().min(1).max(3),
  nunc_entidad: z.string().min(1).max(5),
  nunc_unidad: z.string().min(1).max(10),
  nunc_anio: z.number().int().min(2020).max(2099),
  nunc_consecutivo: z.string().min(1).max(10),
  observaciones: z.string().max(1000).optional(),
})

export async function POST(request: Request) {
  const { allowed, retryAfter } = nuncRegistroLimiter.check(getClientIp(request))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { codigo, ...registro } = parsed.data
    const admin = createAdminClient()

    const { data: sesion } = await admin
      .from('nunc_sesiones')
      .select('id, estado, expira_en')
      .eq('codigo', codigo.trim().toUpperCase())
      .single()

    if (!sesion) return NextResponse.json({ error: 'Código inválido' }, { status: 404 })
    if (sesion.estado === 'cerrada') return NextResponse.json({ error: 'Sesión cerrada' }, { status: 410 })
    if (sesion.estado === 'expirada' || new Date(sesion.expira_en) < new Date()) {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 410 })
    }

    const { data, error } = await admin
      .from('nunc_registros')
      .insert({ sesion_id: sesion.id, ...registro, placa: registro.placa.toUpperCase() })
      .select('id')
      .single()

    if (error) {
      logger.error('Error guardando registro de nunc', { error: error.message })
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    logger.error('Error en POST nunc/registro', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
