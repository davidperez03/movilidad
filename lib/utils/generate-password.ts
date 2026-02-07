import { randomBytes } from 'crypto'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SPECIAL = '!@#$%&*'
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL

export function generatePassword(length: number = 12): string {
  const bytes = randomBytes(length)
  const chars: string[] = []

  // Garantizar al menos uno de cada tipo
  chars.push(UPPERCASE[randomBytes(1)[0] % UPPERCASE.length])
  chars.push(LOWERCASE[randomBytes(1)[0] % LOWERCASE.length])
  chars.push(DIGITS[randomBytes(1)[0] % DIGITS.length])
  chars.push(SPECIAL[randomBytes(1)[0] % SPECIAL.length])

  // Rellenar el resto
  for (let i = chars.length; i < length; i++) {
    chars.push(ALL_CHARS[bytes[i] % ALL_CHARS.length])
  }

  // Mezclar
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
