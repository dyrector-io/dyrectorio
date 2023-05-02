import { terminalDateFormat } from './utils'

export enum LogLevel {
  ERROR = 1,
  WARN = 2,
  INFO = 4,
  DEBUG = 8,
  VERBOSE = 16,
  TRACE = 32,
}

type LogLevelKey = keyof typeof LogLevel

export class Logger {
  public static level = Logger.logLevelFromString(process.env.LOG_LEVEL)

  private static now(): string {
    return terminalDateFormat(new Date())
  }

  constructor(private tag: string) {}

  trace(message: string, ...args: any[]) {
    if (Logger.level < LogLevel.TRACE) {
      return
    }

    console.trace(`${Logger.now()} TRACE [${this.tag}]`, message, ...args)
  }

  verbose(message: string, ...args: any[]) {
    if (Logger.level < LogLevel.VERBOSE) {
      return
    }

    console.debug(`${Logger.now()} VERBOSE [${this.tag}]`, message, ...args)
  }

  debug(message: string, ...args: any[]) {
    if (Logger.level < LogLevel.DEBUG) {
      return
    }

    console.debug(`${Logger.now()} DEBUG [${this.tag}]`, message, ...args)
  }

  info(message: string, ...args: any[]) {
    if (Logger.level < LogLevel.INFO) {
      return
    }

    console.info(`${Logger.now()} INFO  [${this.tag}]`, message, ...args)
  }

  warn(message: string, ...args: any[]) {
    if (Logger.level < LogLevel.WARN) {
      return
    }

    console.warn(`${Logger.now()} WARN  [${this.tag}]`, message, ...args)
  }

  error(message: string, err?: Error, ...args: any[]) {
    if (Logger.level < LogLevel.ERROR) {
      return
    }

    console.error(`${Logger.now()} ERROR [${this.tag}]`, message)
    if (err) {
      console.error(`${Logger.now()} ERROR [${this.tag}]`, err)
    }

    if (args && args.length > 0) {
      console.error(`${Logger.now()} ERROR [${this.tag}]`, ...args)
    }
  }

  derive(tag: string): Logger {
    return new Logger(`${this.tag} ${tag}`)
  }

  static logLevelFromString(level: string): LogLevel {
    const key = level?.toUpperCase() as LogLevelKey
    return LogLevel[key] ?? (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.VERBOSE)
  }
}
