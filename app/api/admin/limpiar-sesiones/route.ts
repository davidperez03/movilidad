import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const limpiarSesionesSchema = z.object({
  admin_id: z.string().uuid('admin_id debe ser un UUID válido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validacion = limpiarSesionesSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.errors[0].message },
        { status: 400 }
      )
    }

    const { admin_id } = validacion.data
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== admin_id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol_global')
      .eq('id', admin_id)
      .single()

    if (!perfil || perfil.rol_global !== 'superadmin') {
      return NextResponse.json(
        { error: 'Solo superadmins pueden realizar esta acción' },
        { status: 403 }
      )
    }

    const { data: sesiones_cerradas, error } = await supabase.rpc('cerrar_sesiones_token_expirado')

    if (error) {
      logger.error('Error limpiando sesiones', error)
      return NextResponse.json(
        { error: 'Error al limpiar sesiones. Intenta nuevamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sesiones_cerradas: sesiones_cerradas || 0
    })

  } catch (error) {
    logger.error('Error en limpiar-sesiones', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
