import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api/require-superadmin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('parq_inspecciones')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error('Error eliminando inspección', { id, error })
    return NextResponse.json({ error: 'Error al eliminar la inspección' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
