import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'

    return NextResponse.json({ ip, userAgent, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Error al obtener información' }, { status: 500 })
  }
}
