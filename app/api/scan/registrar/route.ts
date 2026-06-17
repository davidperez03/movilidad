import { NextRequest, NextResponse } from 'next/server'
import { getScanSession } from '@/lib/scan/jwt'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function validarGeofence(lat: number, lng: number): { ok: boolean; distancia: number } {
  const officeLat = parseFloat(process.env.OFFICE_LAT ?? '')
  const officeLng = parseFloat(process.env.OFFICE_LNG ?? '')
  const radio     = parseFloat(process.env.OFFICE_RADIUS_M ?? '100')

  if (isNaN(officeLat) || isNaN(officeLng)) return { ok: true, distancia: 0 } // sin config → dev mode

  const distancia = distanciaMetros(lat, lng, officeLat, officeLng)
  return { ok: distancia <= radio, distancia: Math.round(distancia) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getScanSession()
    if (!session) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { lat, lng } = body as { lat?: number; lng?: number }

    if (lat == null || lng == null) {
      return NextResponse.json({ error: 'Se requiere ubicación para registrar asistencia' }, { status: 400 })
    }

    const geo = validarGeofence(lat, lng)
    if (!geo.ok) {
      return NextResponse.json({
        error: `Estás muy lejos de la oficina (${geo.distancia} m). Debes estar dentro de los ${process.env.OFFICE_RADIUS_M ?? 100} m para registrar.`,
      }, { status: 403 })
    }

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
