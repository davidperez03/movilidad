const LOWERCASE_WORDS = new Set([
  'de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'a', 'e', 'o', 'u',
])

/**
 * Convierte un valor snake_case de BD a texto legible.
 * Ejemplo: "se_mantiene" → "Se mantiene", "grua_plataforma" → "Grúa plataforma"
 */
export function humanize(value: string | null | undefined): string {
  if (!value) return '-'
  return value
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function capitalizeName(name: string | null | undefined): string {
  if (!name) return ''
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
