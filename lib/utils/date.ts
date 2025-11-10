/**
 * Utilidades para manejo de fechas en zona horaria de Colombia
 */

import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Zona horaria de Colombia
 */
export const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Convierte una fecha UTC a hora de Colombia
 */
export function toColombiaTime(date: string | Date): Date {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Crear un formatter con la zona horaria de Colombia
  const formatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const values: Record<string, string> = {};

  parts.forEach(({ type, value }) => {
    values[type] = value;
  });

  return new Date(
    `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
  );
}

/**
 * Formatea una fecha en formato colombiano corto
 * Ejemplo: "10/11/2025"
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return format(colombiaDate, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatea una fecha en formato colombiano largo
 * Ejemplo: "10 de noviembre de 2025"
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return format(colombiaDate, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea fecha y hora
 * Ejemplo: "10/11/2025 14:30"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return format(colombiaDate, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Formatea fecha y hora completa
 * Ejemplo: "10 de noviembre de 2025, 14:30:45"
 */
export function formatDateTimeLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return format(colombiaDate, "d 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es });
}

/**
 * Formatea una fecha relativa
 * Ejemplo: "hace 2 horas"
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return formatDistanceToNow(colombiaDate, { addSuffix: true, locale: es });
}

/**
 * Obtiene solo la hora
 * Ejemplo: "14:30"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const colombiaDate = toColombiaTime(date);
  return format(colombiaDate, 'HH:mm', { locale: es });
}

// ============================================================================
// FUNCIONES PARA FORMULARIOS E INPUTS
// ============================================================================

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
 * Similar a formatDateShort pero sin conversión de timezone (para campos tipo DATE)
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
