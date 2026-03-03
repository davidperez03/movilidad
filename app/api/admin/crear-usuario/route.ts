import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { capitalizeName } from '@/lib/utils/capitalize'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const crearUsuarioSchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
  nombreCompleto: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (auth.response) return auth.response

    const body = await request.json()
    const validacion = crearUsuarioSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        detalles: validacion.error.errors.map(e => e.message),
      }, { status: 400 })
    }

    const { email, nombreCompleto } = validacion.data

    const supabaseAdmin = createAdminClient()

    // Crear usuario pendiente de aprobación (sin confirmar email, password random)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: crypto.randomUUID() + 'A1!',
      email_confirm: false,
      user_metadata: {
        nombre_completo: capitalizeName(nombreCompleto),
        rol_global: 'usuario',
        pendiente_aprobacion: true,
      },
    })

    if (createError) {
      if (createError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado en el sistema' },
          { status: 409 }
        )
      }
      logger.error('Error creando usuario', { error: createError.message, email })
      return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 400 })
    }

    // Asegurar que el perfil quede inactivo
    if (newUser.user) {
      await supabaseAdmin
        .from('perfiles')
        .update({ activo: false })
        .eq('id', newUser.user.id)
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user?.id, email: newUser.user?.email },
    })
  } catch (error) {
    logger.error('Error en crear-usuario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
