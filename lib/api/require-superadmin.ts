import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

interface SuperAdminResult {
  userId: string
  error?: never
  response?: never
}

interface SuperAdminError {
  userId?: never
  error: string
  response: NextResponse
}

export async function requireSuperAdmin(): Promise<SuperAdminResult | SuperAdminError> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'No autenticado',
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    }
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol_global')
    .eq('id', user.id)
    .single()

  if (perfil?.rol_global !== 'superadmin') {
    return {
      error: 'No autorizado',
      response: NextResponse.json({ error: 'No autorizado' }, { status: 403 }),
    }
  }

  return { userId: user.id }
}
