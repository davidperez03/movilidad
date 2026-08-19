import { NextResponse } from 'next/server'
import { requireParqueadero } from '@/lib/api/require-parqueadero'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET() {
  const auth = await requireParqueadero('editar_inspecciones')
  if (auth.response) return auth.response

  const { data, error } = await createAdminClient()
    .from('parq_vista_personal')
    .select('id, nombre_completo, rol_codigo')
    .order('nombre_completo')

  if (error) {
    logger.error('Error cargando personal parqueadero', { error })
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 })
  }
  return NextResponse.json({ personal: data ?? [] })
}
