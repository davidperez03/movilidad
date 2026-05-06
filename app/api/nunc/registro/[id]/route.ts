import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { nuncRegistroLimiter, getClientIp } from '@/lib/rate-limit'

const schemaEditar = z.object({
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

async function validarSesionActiva(admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>, codigo: string) {
  const { data: sesion } = await admin
    .from('nunc_sesiones')
    .select('id, estado, expira_en')
    .eq('codigo', codigo.trim().toUpperCase())
    .single()

  if (!sesion) return { error: 'Código inválido', status: 404, sesionId: null }
  if (sesion.estado !== 'activa' || new Date(sesion.expira_en) < new Date())
    return { error: 'Sesión no activa', status: 410, sesionId: null }

  return { error: null, status: 200, sesionId: sesion.id }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed, retryAfter } = nuncRegistroLimiter.check(getClientIp(request))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { id } = await params
    const body = await request.json().catch(() => null)
    const parsed = schemaEditar.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { codigo, ...campos } = parsed.data
    const admin = createAdminClient()
    const { error: sesionError, status, sesionId } = await validarSesionActiva(admin, codigo)
    if (sesionError) return NextResponse.json({ error: sesionError }, { status })

    // Verificar que el registro pertenece a esta sesión
    const { data: registro } = await admin
      .from('nunc_registros')
      .select('id, sesion_id')
      .eq('id', id)
      .single()

    if (!registro || registro.sesion_id !== sesionId)
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })

    const { error } = await admin
      .from('nunc_registros')
      .update({ ...campos, placa: campos.placa.toUpperCase() })
      .eq('id', id)

    if (error) {
      logger.error('Error editando registro nunc', { error: error.message })
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en PATCH nunc/registro/[id]', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed, retryAfter } = nuncRegistroLimiter.check(getClientIp(request))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { id } = await params
    const body = await request.json().catch(() => null)
    const codigo = typeof body?.codigo === 'string' ? body.codigo.trim().toUpperCase() : null
    if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const admin = createAdminClient()
    const { error: sesionError, status, sesionId } = await validarSesionActiva(admin, codigo)
    if (sesionError) return NextResponse.json({ error: sesionError }, { status })

    const { data: registro } = await admin
      .from('nunc_registros')
      .select('id, sesion_id')
      .eq('id', id)
      .single()

    if (!registro || registro.sesion_id !== sesionId)
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })

    const { error } = await admin.from('nunc_registros').delete().eq('id', id)

    if (error) {
      logger.error('Error eliminando registro nunc', { error: error.message })
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('Error en DELETE nunc/registro/[id]', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
