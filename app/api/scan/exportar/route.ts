import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ExcelJS from 'exceljs'
import { logger } from '@/lib/logger'

async function requireParqueaderoOSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const admin = createAdminClient()
  const { data: perfil } = await admin.from('perfiles').select('rol_global').eq('id', user.id).single()
  if (perfil?.rol_global === 'superadmin') return { ok: true }

  const { data: rol } = await admin
    .from('usuarios_roles')
    .select('roles_modulo(codigo)')
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'parqueadero')
    .single()

  const codigo = (rol?.roles_modulo as unknown as { codigo: string } | null)?.codigo
  if (codigo?.includes('admin')) return { ok: true }

  return { error: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireParqueaderoOSuperAdmin()
    if (auth.error) return auth.error

    const { searchParams } = new URL(req.url)
    const fecha = searchParams.get('fecha') ?? new Date().toISOString().slice(0, 10)

    const desde = `${fecha}T00:00:00.000Z`
    const hasta = `${fecha}T23:59:59.999Z`

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('asist_vista_registros')
      .select('*')
      .gte('timestamp', desde)
      .lte('timestamp', hasta)
      .order('timestamp', { ascending: true })

    if (error) throw error

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Asistencia')

    ws.columns = [
      { header: 'Nombre',       key: 'nombre_completo', width: 30 },
      { header: 'Documento',    key: 'documento_numero', width: 16 },
      { header: 'Tipo doc.',    key: 'documento_tipo',   width: 10 },
      { header: 'Rol',          key: 'rol_nombre',       width: 22 },
      { header: 'Tipo',         key: 'tipo',             width: 10 },
      { header: 'Hora (Bogotá)', key: 'hora',            width: 22 },
      { header: 'Punto',        key: 'punto',            width: 20 },
    ]

    ws.getRow(1).font = { bold: true }

    for (const r of data ?? []) {
      ws.addRow({
        nombre_completo: r.nombre_completo,
        documento_numero: r.documento_numero,
        documento_tipo:   r.documento_tipo,
        rol_nombre:       r.rol_nombre,
        tipo:             r.tipo,
        hora:             new Date(r.timestamp).toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
          hour12:   false,
        }),
        punto: r.punto,
      })
    }

    const buffer = await wb.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="asistencia-${fecha}.xlsx"`,
      },
    })
  } catch (err) {
    logger.error('scan/exportar', err)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
