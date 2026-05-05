import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const querySchema = z.object({
  tipo: z.string().min(1).max(40),
  id:   z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if ('response' in auth) return auth.response

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = querySchema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', detalles: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { tipo, id } = parsed.data
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('sys_vista_auditoria_completa')
      .select('*')
      .eq('entidad_tipo', tipo)
      .eq('entidad_id', id)
      .order('creado_en', { ascending: true })

    if (error) {
      logger.error('auditoria/entidad GET: error', { error: error.message, tipo, id })
      return NextResponse.json({ error: 'Error al consultar historial' }, { status: 500 })
    }

    let eventos = data ?? []
    if (tipo === 'cuenta') {
      const { data: hijos } = await admin
        .from('sys_vista_auditoria_completa')
        .select('*')
        .eq('cuenta_id', id)
        .order('creado_en', { ascending: true })

      if (hijos?.length) {
        const ids = new Set(eventos.map((e) => e.id))
        const nuevos = hijos.filter((e) => !ids.has(e.id))
        eventos = [...eventos, ...nuevos].sort(
          (a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
        )
      }
    }

    return NextResponse.json({ entidad_tipo: tipo, entidad_id: id, total: eventos.length, data: eventos })
  } catch (err) {
    logger.error('auditoria/entidad GET: error inesperado', { error: String(err) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
