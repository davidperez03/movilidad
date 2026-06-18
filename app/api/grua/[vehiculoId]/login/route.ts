import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signGruaToken, GRUA_COOKIE } from '@/lib/grua/jwt'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest, { params }: { params: Promise<{ vehiculoId: string }> }) {
  try {
    const { vehiculoId } = await params
    const { pin } = await req.json()

    const pinCorrecto = process.env.GRUA_PIN ?? '1234'
    if (pin !== pinCorrecto) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

    const { data: vehiculo } = await createAdminClient()
      .from('parq_vehiculos')
      .select('id, placa, activo')
      .eq('id', vehiculoId)
      .single()

    if (!vehiculo) return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    if (!vehiculo.activo) return NextResponse.json({ error: 'Vehículo inactivo' }, { status: 403 })

    const token = await signGruaToken({ vehiculoId: vehiculo.id, placa: vehiculo.placa })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(GRUA_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   (12 * 60 + 15) * 60,
    })
    return res
  } catch (err) {
    logger.error('grua/login', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
