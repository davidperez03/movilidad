import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { logger } from '@/lib/logger'
import type { ResultadoVerificacion } from '@/lib/audit'

/**
 * GET /api/admin/auditoria/verificar
 * Verifica el hash chain de las 4 tablas de auditoría.
 * Retorna una fila por tabla + resumen global.
 * Solo superadmin.
 */
export async function GET() {
  try {
    const auth = await requireSuperAdmin()
    if ('response' in auth) return auth.response

    const admin = createAdminClient()

    const { data, error } = await admin.rpc('verificar_integridad_auditoria_completa')

    if (error) {
      logger.error('auditoria/verificar GET: error RPC', { error: error.message })
      return NextResponse.json({ error: 'Error al verificar integridad' }, { status: 500 })
    }

    const tablas = (data ?? []) as ResultadoVerificacion['tablas']
    const total_registros = tablas.reduce((s, t) => s + t.total_registros, 0)
    const total_corruptos  = tablas.reduce((s, t) => s + t.registros_corruptos, 0)

    const resultado: ResultadoVerificacion = {
      tablas,
      todo_integro:     total_corruptos === 0,
      total_registros,
      total_corruptos,
      verificado_en:    new Date().toISOString(),
    }

    return NextResponse.json(resultado, { status: total_corruptos === 0 ? 200 : 409 })
  } catch (err) {
    logger.error('auditoria/verificar GET: error inesperado', { error: String(err) })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
