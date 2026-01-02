import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Cron Job: Limpiar sesiones inactivas
 *
 * Este endpoint cierra automáticamente sesiones que:
 * - Han estado inactivas por más de X minutos
 * - Tienen tokens expirados
 *
 * Debe ser llamado periódicamente (recomendado: cada 15 minutos)
 * mediante Vercel Cron, GitHub Actions, o cualquier scheduler externo.
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización (token secreto para cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Si hay un secret configurado, verificarlo
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Obtener configuración de timeout (default: 60 minutos)
    const inactivityMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT || '60')

    // Ejecutar función de limpieza
    const { data: sesionsCerradas, error } = await supabase.rpc(
      'cerrar_sesiones_inactivas',
      { p_minutos_inactividad: inactivityMinutes }
    )

    if (error) {
      console.error('Error limpiando sesiones:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          sesionsCerradas: 0
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sesionsCerradas: sesionsCerradas || 0,
      inactivityMinutes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en cleanup-sessions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        sesionsCerradas: 0
      },
      { status: 500 }
    )
  }
}

// Permitir también POST para mayor compatibilidad
export async function POST(request: NextRequest) {
  return GET(request)
}
