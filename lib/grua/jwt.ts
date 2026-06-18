import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const GRUA_COOKIE = 'grua_token'
const EXPIRY = '735m'

const secret = () =>
  new TextEncoder().encode(process.env.SCAN_JWT_SECRET ?? 'grua-dev-secret')

export interface GruaSession {
  vehiculoId: string
  placa:      string
}

export async function signGruaToken(payload: GruaSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret())
}

export async function verifyGruaToken(token: string): Promise<GruaSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as GruaSession
  } catch { return null }
}

export async function getGruaSession(vehiculoId: string): Promise<GruaSession | null> {
  const jar   = await cookies()
  const token = jar.get(GRUA_COOKIE)?.value
  if (!token) return null
  const session = await verifyGruaToken(token)
  if (!session || session.vehiculoId !== vehiculoId) return null
  return session
}
