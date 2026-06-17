import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ExcelJS from 'exceljs'
import { logger } from '@/lib/logger'

function fmtHoras(h: number | null) {
  if (h == null) return '—'
  const hh = Math.floor(Math.abs(h))
  const mm  = Math.round((Math.abs(h) - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, '0')}m`
}

function horaCol(ts: string | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('es-CO', {
    timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (!desde || !hasta) {
      return NextResponse.json({ error: 'Parámetros desde y hasta son requeridos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('parq_vista_turnos')
      .select('*')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) throw error

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Turnos')

    ws.columns = [
      { header: 'Turno',        key: 'tipo_turno',     width: 12 },
      { header: 'Fecha',        key: 'fecha',           width: 14 },
      { header: 'Placa',        key: 'placa',           width: 12 },
      { header: 'Operadores',   key: 'operadores',      width: 35 },
      { header: 'H. Inicio',    key: 'hora_inicio',     width: 20 },
      { header: 'H. Fin',       key: 'hora_fin',        width: 20 },
      { header: 'H. Oper.',     key: 'horas_operadas',  width: 12 },
      { header: 'H. Novedades', key: 'horas_novedades', width: 14 },
      { header: 'KM Ini',       key: 'km_inicio',       width: 10 },
      { header: 'KM Fin',       key: 'km_fin',          width: 10 },
      { header: 'KM Rec.',      key: 'km_recorridos',   width: 10 },
      { header: 'Estado',       key: 'estado',          width: 10 },
      { header: 'Inspecciones', key: 'total_inspecciones', width: 12 },
    ]

    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }

    for (const t of data ?? []) {
      ws.addRow({
        tipo_turno:        t.tipo_turno === 'diurno' ? 'Diurno' : 'Nocturno',
        fecha:             new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-CO'),
        placa:             t.placa,
        operadores:        t.operadores ?? '—',
        hora_inicio:       horaCol(t.hora_inicio),
        hora_fin:          horaCol(t.hora_fin),
        horas_operadas:    fmtHoras(t.horas_operadas),
        horas_novedades:   fmtHoras(t.horas_novedades),
        km_inicio:         t.km_inicio ?? '—',
        km_fin:            t.km_fin ?? '—',
        km_recorridos:     t.km_recorridos ?? '—',
        estado:            t.estado === 'abierto' ? 'Abierto' : 'Cerrado',
        total_inspecciones: t.total_inspecciones,
      })
    }

    const buffer = await wb.xlsx.writeBuffer()
    const label  = `${desde}_${hasta}`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="turnos-${label}.xlsx"`,
      },
    })
  } catch (err) {
    logger.error('parqueadero/turnos/exportar', err)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
