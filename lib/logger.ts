type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

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
    const entry = createLogEntry('debug', message, data);
    console.debug(formatLog(entry), data ?? '');
  },

  info(message: string, data?: unknown) {
    const entry = createLogEntry('info', message, data);
    console.info(formatLog(entry), data ?? '');
  },

  warn(message: string, data?: unknown) {
    const entry = createLogEntry('warn', message, data);
    console.warn(formatLog(entry), data ?? '');
  },

  error(message: string, error?: unknown) {
    const entry = createLogEntry('error', message, error);
    console.error(formatLog(entry), error ?? '');
  }
};
