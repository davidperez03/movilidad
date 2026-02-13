type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

function normalizeLogData(data: unknown): unknown {
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
    };
  }

  if (data && typeof data === 'object') {
    const maybeError = data as Record<string, unknown>;
    const hasPostgrestShape =
      'message' in maybeError ||
      'code' in maybeError ||
      'details' in maybeError ||
      'hint' in maybeError;

    if (hasPostgrestShape) {
      return {
        message: maybeError.message,
        code: maybeError.code,
        details: maybeError.details,
        hint: maybeError.hint,
      };
    }

    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return String(data);
    }
  }

  return data;
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
  return `${prefix} ${entry.message}`;
}

function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data
  };
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (!isDev) return;
    const normalized = normalizeLogData(data);
    const entry = createLogEntry('debug', message, normalized);
    console.debug(formatLog(entry), normalized ?? '');
  },

  info(message: string, data?: unknown) {
    const normalized = normalizeLogData(data);
    const entry = createLogEntry('info', message, normalized);
    console.info(formatLog(entry), normalized ?? '');
  },

  warn(message: string, data?: unknown) {
    const normalized = normalizeLogData(data);
    const entry = createLogEntry('warn', message, normalized);
    console.warn(formatLog(entry), normalized ?? '');
  },

  error(message: string, error?: unknown) {
    const normalized = normalizeLogData(error);
    const entry = createLogEntry('error', message, normalized);
    console.error(formatLog(entry), normalized ?? '');
  }
};
