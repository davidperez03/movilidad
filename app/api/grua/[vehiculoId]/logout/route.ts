import { NextResponse } from 'next/server'
import { GRUA_COOKIE } from '@/lib/grua/jwt'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GRUA_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
