import { not } from 'ramda'

import { ApiError } from '../types'
import { modeIs } from '../mode'
import { makeApiResponseError } from './error'

enum LogTypes {
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warn',
}
class Log {
  private _payload: unknown | undefined

  private _message: string

  private _type: LogTypes

  private readonly _log = console

  constructor(type: LogTypes, message: string, payload?: unknown) {
    this._type = type
    this._message = message

    if (payload) this._payload = payload
  }

  public make(): void {
    try {
      if (not(modeIs('test'))) this._log[this._type](this._message, this._payload ?? '')
    } catch (err) {
      return
     }
  }
}

class LogError extends Log {
  constructor(message: string, error?: Error | undefined) {
    super(LogTypes.ERROR, message || 'Unknown Error', makeApiResponseError(error))
  }
}

class LogApiError extends Log {
  constructor(message: string, error?: ApiError | undefined) {
    super(LogTypes.ERROR, message || 'Unknown API Error', makeApiResponseError(error))
  }
}

class LogApiWarning extends Log {
  constructor(message: string, payload: unknown | undefined) {
    super(LogTypes.WARNING, message || 'Unknown Warning', payload)
  }
}

class LogInfo extends Log {
  constructor(message: string, payload: unknown | undefined) {
    super(LogTypes.INFO, message || '', payload)
  }
}

export { LogError, LogApiError, LogApiWarning, LogInfo }
