import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const schema = z.object({
  entidad_nombre: z.string().min(2).max(100),
  nombre_peritos: z.string().min(2).max(200),
  nunc_dpto: z.string().min(1).max(3),
  nunc_municipio: z.string().min(1).max(3),
  nunc_entidad: z.string().min(1).max(5),
  nunc_unidad: z.string().min(1).max(10),
  nunc_anio: z.number().int().min(2020).max(2099),
  observaciones: z.string().max(500).optional(),
})

function generarCodigo(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const random = Array.from({ length: 6 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('')
  return `PER-${random}`
}

function getExpiracionMedanocheColombia(): string {
  // Colombia = UTC-5. Fin del día Colombia = 23:59:59 COT = 04:59:59 UTC del día siguiente.
  const ahoraMs = Date.now()
  const colombiaMs = ahoraMs - 5 * 60 * 60 * 1000
  const colombiaDate = new Date(colombiaMs)
  const finDiaColombia = new Date(Date.UTC(
    colombiaDate.getUTCFullYear(),
    colombiaDate.getUTCMonth(),
    colombiaDate.getUTCDate(),
    23, 59, 59, 999
  ))
  return new Date(finDiaColombia.getTime() + 5 * 60 * 60 * 1000).toISOString()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const expira_en = getExpiracionMedanocheColombia()
    const admin = createAdminClient()

    for (let i = 0; i < 3; i++) {
      const codigo = generarCodigo()
      const { data, error } = await admin
        .from('nunc_sesiones')
        .insert({ ...parsed.data, codigo, generado_por: user.id, expira_en })
        .select('id, codigo')
        .single()

      if (!error && data) return NextResponse.json({ id: data.id, codigo: data.codigo })
      if (error && !error.message.includes('duplicate')) {
        logger.error('Error creando sesión de nunc', { error: error.message })
        return NextResponse.json({ error: 'Error al crear la sesión' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Error generando código único' }, { status: 500 })
  } catch (error) {
    logger.error('Error en POST nunc/sesion', { error: String(error) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
