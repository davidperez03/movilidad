import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exportar utilidades de fecha
export {
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatDateTimeLong,
  formatRelativeTime,
  formatTime,
  toColombiaTime,
} from './utils/date';
