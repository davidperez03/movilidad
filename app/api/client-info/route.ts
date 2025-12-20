import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para obtener información del cliente
 * Devuelve la IP y otros datos útiles para el registro de sesiones
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener IP del cliente desde diferentes headers
    // (compatibilidad con diferentes entornos: Vercel, proxies, desarrollo)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      request.headers.get('x-client-ip') ||
      'unknown'

    // Información adicional del cliente
    const userAgent = request.headers.get('user-agent') || 'unknown'

    return NextResponse.json({
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error al obtener información del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener información' },
      { status: 500 }
    )
  }
}
