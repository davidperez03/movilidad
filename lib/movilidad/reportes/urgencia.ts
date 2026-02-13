export type NivelUrgenciaPorVencer = 'vencido' | 'vence_hoy' | 'alta' | 'media' | 'baja'

export function obtenerNivelUrgenciaPorVencer(diasRestantes: number): NivelUrgenciaPorVencer {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes === 0) return 'vence_hoy'
  if (diasRestantes >= 2 && diasRestantes <= 5) return 'alta'
  if (diasRestantes >= 6 && diasRestantes <= 10) return 'media'
  return 'baja'
}

export function obtenerEtiquetaUrgenciaPorVencer(diasRestantes: number): string {
  const nivel = obtenerNivelUrgenciaPorVencer(diasRestantes)

  switch (nivel) {
    case 'vencido':
      return 'Vencido'
    case 'vence_hoy':
      return 'Vence hoy'
    case 'alta':
      return 'Alta'
    case 'media':
      return 'Media'
    default:
      return 'Baja'
  }
}

export function formatearUrgenciaPorVencer(diasRestantes: number): string {
  const nivel = obtenerNivelUrgenciaPorVencer(diasRestantes)
  const etiqueta = obtenerEtiquetaUrgenciaPorVencer(diasRestantes)

  if (nivel === 'vence_hoy') return etiqueta
  if (nivel === 'vencido') {
    const dias = Math.abs(diasRestantes)
    return `${etiqueta} (${dias} ${dias === 1 ? 'día' : 'días'})`
  }
  return `${etiqueta} (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'})`
}
