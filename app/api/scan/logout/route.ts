import { NextResponse } from 'next/server'
import { SCAN_COOKIE } from '@/lib/scan/jwt'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SCAN_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
