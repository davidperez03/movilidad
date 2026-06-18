import { NextRequest, NextResponse } from 'next/server'
import { getScanSession } from '@/lib/scan/jwt'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const session = await getScanSession()
    if (!session) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const supabase = createAdminClient()

    const { data: ultimo } = await supabase
      .from('asist_registros')
      .select('tipo')
      .eq('usuario_id', session.usuarioId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const tipo      = ultimo?.tipo === 'INGRESO' ? 'SALIDA' : 'INGRESO'
    const userAgent = req.headers.get('user-agent') ?? null

    const { data, error } = await supabase
      .from('asist_registros')
      .insert({ usuario_id: session.usuarioId, tipo, punto: 'entrada-principal', user_agent: userAgent })
      .select('id, tipo, timestamp')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, tipo: data.tipo, timestamp: data.timestamp, nombre: session.nombre })
  } catch (err) {
    logger.error('scan/registrar', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
