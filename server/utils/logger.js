/**
 * Production-ready logger
 * Only logs in development or when explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.AI_ENABLE_DEBUG_LOGGING === 'true' || 
                       process.env.DEBUG_PROMPTS === 'true';

class Logger {
  log(...args) {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  }

  error(...args) {
    // Always log errors, but format differently in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log to error tracking service (e.g., Sentry)
      console.error('[ERROR]', ...args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ));
    }
  }

  warn(...args) {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (isDevelopment || isDebugEnabled) {
      console.debug(...args);
    }
  }
}

module.exports = new Logger();

