import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/auth/login'

  const supabase = await createClient()

  // Flujo 1: token_hash + type (verifyOtp - para recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email',
    })

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', request.url))
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Flujo 2: code (PKCE - exchangeCodeForSession)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Error: redirigir a login con error
  return NextResponse.redirect(
    new URL('/auth/login?error=invalid_token', request.url)
  )
}
