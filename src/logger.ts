import { DebugLevels, LoggerProps } from './types'
import { is } from './mode'
import { not } from 'ramda'

class Logger {
  debug: DebugLevels

  log = console

  constructor({ debug }: LoggerProps) {
    this.debug = debug ?? DebugLevels.MUTE
  }

  isNotTest(): boolean {
    return not(is('test'))
  }

  shouldShowError(): boolean {
    return this.isNotTest() && this.debug !== DebugLevels.MUTE
  }

  shouldShowLog(): boolean {
    return this.isNotTest() && this.debug === DebugLevels.VERBOSE
  }

  error(message: string, payload?: unknown): void {
    if (this.shouldShowError()) this.log.error(message, payload ?? '')
  }

  disaster(message: string, payload?: unknown): void {
    this.log.error(message, payload ?? '')
  }

  warning(message: string, payload?: unknown): void {
    if (this.shouldShowLog()) this.log.warn(message, payload ?? '')
  }

  info(message: string, payload?: unknown): void {
    if (this.shouldShowLog()) this.log.log(message, payload ?? '')
  }
}

export { Logger }
