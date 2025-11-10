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
