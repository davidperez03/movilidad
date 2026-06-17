import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PermisoParqueadero } from '@/lib/types/permissions'

interface Ok { userId: string; error?: never; response?: never }
interface Err { userId?: never; error: string; response: NextResponse }

export async function requireParqueadero(permiso: PermisoParqueadero): Promise<Ok | Err> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado', response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const admin = createAdminClient()
  const { data: perfil } = await admin.from('perfiles').select('rol_global').eq('id', user.id).single()

  if (perfil?.rol_global === 'superadmin') return { userId: user.id }

  const { data: rol } = await admin
    .from('usuarios_roles')
    .select('roles_modulo(permisos)')
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'parqueadero')
    .single()

  const permisos = (rol?.roles_modulo as unknown as { permisos: Record<string, boolean> } | null)?.permisos
  if (permisos?.[permiso]) return { userId: user.id }

  return { error: 'Sin permisos', response: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
}
