import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export {
  formatDateShort,
  formatDateLong,
  formatDateTime,
  toColombiaTime,
  formatDateForDB,
  getTodayForInput,
  formatDateForDisplay,
} from './utils/date';
