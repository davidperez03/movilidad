import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exportar utilidades de fecha
export {
  // Funciones de visualización con timezone
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatDateTimeLong,
  formatRelativeTime,
  formatTime,
  toColombiaTime,
  // Funciones para formularios e inputs
  formatDateForDB,
  getTodayForInput,
  formatDateForInput,
  formatDateForDisplay,
} from './utils/date';
