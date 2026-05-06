interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(key: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      this.cleanup(now)
      return { allowed: true, retryAfter: 0 }
    }

    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    entry.count++
    return { allowed: true, retryAfter: 0 }
  }

  private cleanup(now: number) {
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key)
      }
    }
  }
}

// 3 req / 15 min por IP — recomendación OWASP para recuperación de contraseña.
export const forgotPasswordLimiter = new RateLimiter(3, 15 * 60 * 1000)

// 3 req / 60 min por email — previene spam dirigido con rotación de IP.
export const forgotPasswordEmailLimiter = new RateLimiter(3, 60 * 60 * 1000)

export const signUpLimiter = new RateLimiter(3, 60 * 60 * 1000)

export const consultaLimiter = new RateLimiter(10, 60 * 1000)

export const updatePasswordLimiter = new RateLimiter(10, 15 * 60 * 1000)

// NUNC — rutas públicas sin autenticación
// 10 intentos / 15 min por IP — previene fuerza bruta de códigos de sesión.
export const nuncValidarLimiter = new RateLimiter(10, 15 * 60 * 1000)

// 60 ops / 10 min por IP — permite sesiones con muchos vehículos sin bloquear operadores legítimos.
export const nuncRegistroLimiter = new RateLimiter(60, 10 * 60 * 1000)

// 5 req / 15 min por IP — cerrar sesión solo ocurre una vez por sesión.
export const nuncCerrarLimiter = new RateLimiter(5, 15 * 60 * 1000)

// Extrae la IP real del cliente considerando proxies (Vercel, Nginx).
export function getClientIp(request: Request): string {
  const vercelIp  = request.headers.get('x-vercel-forwarded-for')
  if (vercelIp)  return vercelIp.split(',')[0].trim()
  const realIp    = request.headers.get('x-real-ip')
  if (realIp)    return realIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}
