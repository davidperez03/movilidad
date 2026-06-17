import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const SCAN_COOKIE = 'scan_token'
const EXPIRY = '735m'

const secret = () =>
  new TextEncoder().encode(
    process.env.SCAN_JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET ?? 'scan-dev-secret'
  )

export interface ScanSession {
  usuarioId: string
  nombre:    string
  avatar:    string | null
}

export async function signScanToken(payload: ScanSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret())
}

export async function verifyScanToken(token: string): Promise<ScanSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as ScanSession
  } catch {
    return null
  }
}

export async function getScanSession(): Promise<ScanSession | null> {
  const jar = await cookies()
  const token = jar.get(SCAN_COOKIE)?.value
  if (!token) return null
  return verifyScanToken(token)
}
