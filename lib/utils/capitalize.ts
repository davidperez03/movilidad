const LOWERCASE_WORDS = new Set([
  'de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'a', 'e', 'o', 'u',
])

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
