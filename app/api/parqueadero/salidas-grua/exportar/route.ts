import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ExcelJS from 'exceljs'
import { logger } from '@/lib/logger'

const MOTIVOS: Record<string, string> = {
  requerimiento_agentes: 'Req. agentes',
  requerimiento_polca:   'Req. POLCA',
  mantenimiento:         'Mantenimiento',
  tanqueo:               'Tanqueo',
  autorizacion:          'Autorización',
  otros:                 'Otros',
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
    if (!desde || !hasta) return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })

    const { data, error } = await createAdminClient()
      .from('parq_salidas_grua')
      .select(`id, hora_salida, hora_regreso, motivo, trae_carga, inventario_items, observaciones, codigo_salida,
        parq_vehiculos(placa, marca),
        operador:perfiles!operador_id(nombre_completo)`)
      .gte('hora_salida', `${desde}T00:00:00.000Z`)
      .lte('hora_salida', `${hasta}T23:59:59.999Z`)
      .order('hora_salida', { ascending: true })

    if (error) throw error

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Salidas Grúa')

    ws.columns = [
      { header: 'Grúa',          key: 'placa',        width: 12 },
      { header: 'Operador',      key: 'operador',      width: 28 },
      { header: 'Motivo',        key: 'motivo',        width: 20 },
      { header: 'H. Salida',     key: 'hora_salida',   width: 22 },
      { header: 'H. Regreso',    key: 'hora_regreso',  width: 22 },
      { header: 'Cód. Salida',   key: 'codigo',        width: 12 },
      { header: 'Trajo carga',   key: 'carga',         width: 12 },
      { header: 'Stickers',      key: 'stickers',      width: 35 },
      { header: 'Observaciones', key: 'observaciones', width: 35 },
    ]

    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }

    for (const r of data ?? []) {
      const vehiculo  = r.parq_vehiculos as unknown as { placa: string; marca: string } | null
      const operador  = r.operador      as unknown as { nombre_completo: string } | null
      const items     = (r.inventario_items as unknown as { nombre: string; desde: number; hasta: number; cantidad: number }[]) ?? []
      const stickers  = items.map(i => `${i.nombre}: #${i.desde}–#${i.hasta} (${i.cantidad})`).join(' | ')

      ws.addRow({
        placa:         vehiculo?.placa ?? '—',
        operador:      operador?.nombre_completo ?? '—',
        motivo:        MOTIVOS[r.motivo as string] ?? r.motivo,
        hora_salida:   horaCol(r.hora_salida as string),
        hora_regreso:  horaCol(r.hora_regreso as string | null),
        codigo:        r.codigo_salida ?? '—',
        carga:         r.trae_carga ? 'Sí' : 'No',
        stickers:      stickers || '—',
        observaciones: r.observaciones ?? '—',
      })
    }

    const buffer = await wb.xlsx.writeBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="salidas-grua-${desde}_${hasta}.xlsx"`,
      },
    })
  } catch (err) {
    logger.error('salidas-grua/exportar', err)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
