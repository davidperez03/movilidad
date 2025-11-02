/**
 * Convierte una fecha en formato YYYY-MM-DD a un string de fecha
 * que PostgreSQL interpreta correctamente como fecha local
 *
 * @param dateString Fecha en formato YYYY-MM-DD del input type="date"
 * @returns Fecha en formato que PostgreSQL entiende como local
 */
export function formatDateForDB(dateString: string): string {
  // Agregar la hora del mediodía para evitar problemas de zona horaria
  // PostgreSQL interpretará esto como fecha local
  return `${dateString}T12:00:00`
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs type="date"
 */
export function getTodayForInput(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha de PostgreSQL para mostrar en el input type="date"
 *
 * @param dbDate Fecha desde PostgreSQL (puede ser Date o timestamp)
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDateForInput(dbDate: string | Date): string {
  if (!dbDate) return ''

  // Si viene como string YYYY-MM-DD desde PostgreSQL, devolverlo directamente
  if (typeof dbDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dbDate.substring(0, 10))) {
    return dbDate.substring(0, 10)
  }

  const date = typeof dbDate === 'string' ? new Date(dbDate) : dbDate
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha de PostgreSQL para mostrar en formato local (dd/mm/yyyy)
 * Evita problemas de timezone al trabajar directamente con la fecha en formato string
 *
 * @param dbDate Fecha desde PostgreSQL (string en formato YYYY-MM-DD o timestamp)
 * @returns Fecha formateada para mostrar (ej: "28/01/2025")
 */
export function formatDateForDisplay(dbDate: string | Date): string {
  if (!dbDate) return ''

  let dateStr: string
  if (typeof dbDate === 'string') {
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    dateStr = dbDate.substring(0, 10)
  } else {
    // Si es un objeto Date, convertirlo a YYYY-MM-DD
    const year = dbDate.getFullYear()
    const month = String(dbDate.getMonth() + 1).padStart(2, '0')
    const day = String(dbDate.getDate()).padStart(2, '0')
    dateStr = `${year}-${month}-${day}`
  }

  // Separar año, mes, día
  const [year, month, day] = dateStr.split('-')

  // Devolver en formato dd/mm/yyyy
  return `${day}/${month}/${year}`
}
