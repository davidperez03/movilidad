import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface PermisoResult {
  userId: string
  error?: never
  response?: never
}

interface PermisoError {
  userId?: never
  error: string
  response: NextResponse
}

export async function requirePermisoParqueadero(
  permiso: string
): Promise<PermisoResult | PermisoError> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'No autenticado',
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    }
  }

  const admin = createAdminClient()

  const { data: perfil } = await admin
    .from('perfiles')
    .select('rol_global')
    .eq('id', user.id)
    .single()

  if (perfil?.rol_global === 'superadmin') {
    return { userId: user.id }
  }

  const { data: rolUsuario } = await admin
    .from('usuarios_roles')
    .select('roles_modulo(permisos)')
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'parqueadero')
    .maybeSingle()

  const permisos = (rolUsuario?.roles_modulo as unknown as { permisos: Record<string, boolean> } | null)?.permisos

  if (!permisos?.[permiso]) {
    return {
      error: 'No autorizado',
      response: NextResponse.json({ error: 'No tiene permiso para esta acción' }, { status: 403 }),
    }
  }

  return { userId: user.id }
}
