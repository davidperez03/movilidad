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
  // getSession() lee el JWT firmado desde la cookie sin llamada de red.
  // El middleware ya refresca la sesión en cada request.
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return {
      error: 'No autenticado',
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    }
  }

  const userId = session.user.id
  const admin  = createAdminClient()

  // Ambas queries en paralelo — ahorra un round trip para usuarios no-superadmin
  const [{ data: perfil }, { data: rolUsuario }] = await Promise.all([
    admin.from('perfiles').select('rol_global').eq('id', userId).single(),
    admin.from('usuarios_roles').select('roles_modulo(permisos)')
      .eq('usuario_id', userId).eq('modulo_id', 'parqueadero').maybeSingle(),
  ])

  if (perfil?.rol_global === 'superadmin') {
    return { userId }
  }

  const permisos = (rolUsuario?.roles_modulo as unknown as { permisos: Record<string, boolean> } | null)?.permisos

  if (!permisos?.[permiso]) {
    return {
      error: 'No autorizado',
      response: NextResponse.json({ error: 'No tiene permiso para esta acción' }, { status: 403 }),
    }
  }

  return { userId }
}
