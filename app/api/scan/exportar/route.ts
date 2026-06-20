import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ExcelJS from 'exceljs'
import { logger } from '@/lib/logger'
import { getNowDateColombia } from '@/lib/utils/date'

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

function horaCol(ts: string) {
  return new Date(ts).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
  })
}

interface Registro {
  usuario_id:       string
  tipo:             string
  timestamp:        string
  nombre_completo:  string | null
  documento_numero: string | null
  documento_tipo:   string | null
  rol_nombre:       string | null
}

interface Jornada {
  nombre_completo:  string | null
  documento_numero: string | null
  documento_tipo:   string | null
  rol_nombre:       string | null
  ingreso:          string | null
  salida:           string | null
}

function agruparJornadas(registros: Registro[]): Jornada[] {
  const sorted = [...registros].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const porUsuario: Record<string, Registro[]> = {}
  for (const r of sorted) {
    if (!porUsuario[r.usuario_id]) porUsuario[r.usuario_id] = []
    porUsuario[r.usuario_id].push(r)
  }

  const jornadas: Jornada[] = []
  for (const recs of Object.values(porUsuario)) {
    let i = 0
    while (i < recs.length) {
      const r = recs[i]
      if (r.tipo === 'INGRESO') {
        const siguiente = recs[i + 1]
        jornadas.push({
          nombre_completo:  r.nombre_completo,
          documento_numero: r.documento_numero,
          documento_tipo:   r.documento_tipo,
          rol_nombre:       r.rol_nombre,
          ingreso:          r.timestamp,
          salida:           siguiente?.tipo === 'SALIDA' ? siguiente.timestamp : null,
        })
        i += siguiente?.tipo === 'SALIDA' ? 2 : 1
      } else {
        i++
      }
    }
  }

  return jornadas.sort(
    (a, b) => new Date(a.ingreso ?? 0).getTime() - new Date(b.ingreso ?? 0).getTime()
  )
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireParqueaderoOSuperAdmin()
    if (auth.error) return auth.error

    const { searchParams } = new URL(req.url)
    const fecha = searchParams.get('fecha') ?? getNowDateColombia()

    const desde = `${fecha}T00:00:00-05:00`
    const hasta = `${fecha}T23:59:59.999-05:00`

    const supabase = createAdminClient()

    const { data: hoy, error } = await supabase
      .from('asist_vista_registros')
      .select('usuario_id, tipo, timestamp, nombre_completo, documento_numero, documento_tipo, rol_nombre')
      .gte('timestamp', desde)
      .lte('timestamp', hasta)
      .order('timestamp', { ascending: true })

    if (error) throw error

    // Detectar SALIDAs huérfanas (turno nocturno del día anterior)
    const primeros: Record<string, Registro> = {}
    for (const r of hoy ?? []) {
      if (!primeros[r.usuario_id]) primeros[r.usuario_id] = r as Registro
    }
    const huerfanos = Object.values(primeros)
      .filter((r) => r.tipo === 'SALIDA')
      .map((r) => r.usuario_id)

    let ingresosAnteriores: Registro[] = []
    if (huerfanos.length > 0) {
      const { data: prev } = await supabase
        .from('asist_vista_registros')
        .select('usuario_id, tipo, timestamp, nombre_completo, documento_numero, documento_tipo, rol_nombre')
        .in('usuario_id', huerfanos)
        .eq('tipo', 'INGRESO')
        .lt('timestamp', desde)
        .order('timestamp', { ascending: false })

      const ultimo: Record<string, Registro> = {}
      for (const r of prev ?? []) {
        if (!ultimo[r.usuario_id]) ultimo[r.usuario_id] = r as Registro
      }
      ingresosAnteriores = Object.values(ultimo)
    }

    const todos = [...ingresosAnteriores, ...(hoy ?? [])] as Registro[]
    const jornadas = agruparJornadas(todos)

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Asistencia')

    ws.columns = [
      { header: 'Nombre',        key: 'nombre',    width: 30 },
      { header: 'Documento',     key: 'doc_num',   width: 16 },
      { header: 'Tipo doc.',     key: 'doc_tipo',  width: 10 },
      { header: 'Rol',           key: 'rol',       width: 22 },
      { header: 'Ingreso',       key: 'ingreso',   width: 24 },
      { header: 'Salida',        key: 'salida',    width: 24 },
      { header: 'Estado',        key: 'estado',    width: 14 },
    ]

    ws.getRow(1).font = { bold: true }

    for (const j of jornadas) {
      ws.addRow({
        nombre:   j.nombre_completo,
        doc_num:  j.documento_numero,
        doc_tipo: j.documento_tipo,
        rol:      j.rol_nombre,
        ingreso:  j.ingreso ? horaCol(j.ingreso) : '—',
        salida:   j.salida  ? horaCol(j.salida)  : '—',
        estado:   j.salida  ? 'Completado' : 'En turno',
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
