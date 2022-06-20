import { Logger as AltvLogger, LogLevel } from "altv-xlogger"

export class Logger extends AltvLogger {
  constructor(name: string) {
    super(`xpeds-sync > ${name}`, {
      logLevel: ___DEV_MODE ? LogLevel.Info : LogLevel.Warn,
    })
  }
}
