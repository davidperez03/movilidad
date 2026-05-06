import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { obtenerPermisosUsuario } from '@/lib/server/permisos'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const querySchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin:    z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { nunc, esSuperadmin } = await obtenerPermisosUsuario()
    if (!esSuperadmin && !nunc.ver) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = querySchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    const { fechaInicio, fechaFin } = parsed.data
    const admin = createAdminClient()

    let query = admin
      .from('nunc_registros')
      .select(`
        nunc_dpto, nunc_municipio, nunc_entidad, nunc_unidad, nunc_anio, nunc_consecutivo,
        placa, observaciones, registrado_en,
        nunc_sesiones (
          codigo, entidad_nombre, nombre_peritos
        )
      `)
      .order('registrado_en', { ascending: true })

    if (fechaInicio) query = query.gte('registrado_en', `${fechaInicio}T00:00:00`)
    if (fechaFin)    query = query.lte('registrado_en', `${fechaFin}T23:59:59`)

    const { data, error } = await query

    if (error) {
      logger.error('nunc/reportes GET: error', { error: error.message })
      return NextResponse.json({ error: 'Error al consultar registros' }, { status: 500 })
    }

    const filas = (data ?? []).map(r => {
      const sesion = r.nunc_sesiones as unknown as {
        codigo: string
        entidad_nombre: string
        nombre_peritos: string
      } | null
      return {
        nunc:           `${r.nunc_dpto}${r.nunc_municipio}${r.nunc_entidad}${r.nunc_unidad}${r.nunc_anio}${r.nunc_consecutivo}`,
        placa:          r.placa,
        entidad_nombre: sesion?.entidad_nombre ?? '',
        nombre_peritos: sesion?.nombre_peritos ?? '',
        codigo_sesion:  sesion?.codigo ?? '',
        observaciones:  r.observaciones ?? null,
        registrado_en:  r.registrado_en,
      }
    })

    return NextResponse.json({ total: filas.length, data: filas })
  } catch (err) {
    logger.error('nunc/reportes GET: error inesperado', { error: String(err) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
