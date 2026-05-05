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
