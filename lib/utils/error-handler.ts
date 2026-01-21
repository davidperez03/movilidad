import { logger } from '@/lib/logger';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export function handleError(error: unknown, context: string): AppError {
  if (error instanceof Error) {
    logger.error(`[${context}] ${error.message}`, error);
    return { message: error.message };
  }

  if (typeof error === 'string') {
    logger.error(`[${context}] ${error}`);
    return { message: error };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const message = (err.message as string) || 'Error desconocido';
    logger.error(`[${context}] ${message}`, error);
    return {
      message,
      code: err.code as string | undefined,
      status: err.status as number | undefined
    };
  }

  logger.error(`[${context}] Error desconocido`, error);
  return { message: 'Ha ocurrido un error inesperado' };
}

export function isSupabaseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  return handleError(error, 'unknown').message;
}
