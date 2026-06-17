import { NextResponse } from 'next/server'
import { getScanSession } from '@/lib/scan/jwt'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const session = await getScanSession()
  if (!session) {
    return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('asist_registros')
    .select('tipo, timestamp')
    .eq('usuario_id', session.usuarioId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    usuarioId: session.usuarioId,
    nombre:    session.nombre,
    avatar:    session.avatar,
    ultimo:    data ?? null,
    proximo:   data?.tipo === 'INGRESO' ? 'SALIDA' : 'INGRESO',
  })
}
