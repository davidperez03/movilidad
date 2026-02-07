import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/auth/login'

  // URL de redirección exitosa
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('next')

  // Crear cliente Supabase que escribe cookies directamente en el NextResponse.
  // Esto es NECESARIO en Route Handlers que hacen redirect, porque cookies()
  // de next/headers no transfiere las cookies al NextResponse.redirect().
  // Ref: https://supabase.com/docs/guides/auth/server-side/nextjs
  const response = NextResponse.redirect(redirectTo)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Flujo 1: token_hash + type (verificación de email / recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return response
    }
  }

  // Flujo 2: code (PKCE - exchangeCodeForSession)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  // Error: redirigir a login
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/auth/login'
  errorUrl.searchParams.set('error', 'invalid_token')
  return NextResponse.redirect(errorUrl)
}
