/**
 * Simple logging utility
 * Can be extended with Winston or Pino for production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (meta) {
      console[level === 'error' ? 'error' : 'log'](logMessage, meta);
    } else {
      console[level === 'error' ? 'error' : 'log'](logMessage);
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string | Error, meta?: any) {
    const errorMessage = message instanceof Error ? message.message : message;
    this.log('error', errorMessage, meta || (message instanceof Error ? { stack: message.stack } : undefined));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
