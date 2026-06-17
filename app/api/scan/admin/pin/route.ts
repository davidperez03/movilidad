import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

async function requireParqueaderoAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const admin = createAdminClient()
  const { data: perfil } = await admin.from('perfiles').select('rol_global').eq('id', user.id).single()
  if (perfil?.rol_global === 'superadmin') return { userId: user.id }

  const { data: rol } = await admin
    .from('usuarios_roles')
    .select('roles_modulo(codigo)')
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'parqueadero')
    .single()

  const codigo = (rol?.roles_modulo as unknown as { codigo: string } | null)?.codigo
  if (!codigo?.includes('admin')) {
    return { error: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
  }

  return { userId: user.id }
}

// POST /api/scan/admin/pin  — asigna o resetea el PIN de uno o todos
// body: { perfil_id?: string, todos?: true }
export async function POST(req: NextRequest) {
  try {
    const auth = await requireParqueaderoAdmin()
    if (auth.error) return auth.error

    const body = await req.json()
    const admin = createAdminClient()

    if (body.todos) {
      const { data: roles } = await admin
        .from('usuarios_roles')
        .select('usuario_id')
        .eq('modulo_id', 'parqueadero')

      const ids = (roles ?? []).map((r) => r.usuario_id)
      if (!ids.length) return NextResponse.json({ ok: true, actualizados: 0 })

      const { data: perfiles } = await admin
        .from('perfiles')
        .select('id, documento_numero')
        .in('id', ids)

      const filas = (perfiles ?? []).filter(
        (p): p is { id: string; documento_numero: string } =>
          !!p.documento_numero && p.documento_numero.length >= 4
      )

      const inserts = await Promise.all(
        filas.map(async (p) => ({
          perfil_id: p.id,
          pin_hash:  await hash(p.documento_numero.slice(-4), 10),
        }))
      )

      const { error } = await admin
        .from('asist_datos_empleado')
        .upsert(inserts, { onConflict: 'perfil_id' })

      if (error) throw error
      return NextResponse.json({ ok: true, actualizados: inserts.length })
    }

    if (body.perfil_id) {
      const { data: perfil } = await admin
        .from('perfiles')
        .select('documento_numero')
        .eq('id', body.perfil_id)
        .single()

      if (!perfil?.documento_numero || perfil.documento_numero.length < 4) {
        return NextResponse.json({ error: 'El empleado no tiene documento registrado' }, { status: 400 })
      }

      const pin_hash = await hash(perfil.documento_numero.slice(-4), 10)

      const { error } = await admin
        .from('asist_datos_empleado')
        .upsert({ perfil_id: body.perfil_id, pin_hash }, { onConflict: 'perfil_id' })

      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  } catch (err) {
    logger.error('scan/admin/pin', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/scan/admin/pin  — revoca acceso
// body: { perfil_id: string }
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireParqueaderoAdmin()
    if (auth.error) return auth.error

    const { perfil_id } = await req.json()
    if (!perfil_id) return NextResponse.json({ error: 'perfil_id requerido' }, { status: 400 })

    const { error } = await createAdminClient()
      .from('asist_datos_empleado')
      .delete()
      .eq('perfil_id', perfil_id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('scan/admin/pin DELETE', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
