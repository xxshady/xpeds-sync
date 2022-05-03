import { Logger as AltvLogger } from "altv-xlogger"

export class Logger extends AltvLogger {
  constructor(name: string) {
    super(`xpeds-sync > ${name}`)
  }
}