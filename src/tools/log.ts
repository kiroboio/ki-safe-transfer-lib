import { not } from 'ramda'

import { ApiError } from '../types'
import { is } from '../mode'
import { makeApiResponseError } from './error'

enum LogTypes {
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warn',
}
class Log {
  _payload: unknown | undefined

  _message: string

  _type: LogTypes

  private readonly _log = console

  constructor(type: LogTypes, message: string, payload?: unknown) {
    this._type = type
    this._message = message

    if (payload) this._payload = payload
  }

  public make(): void {
    switch (this._type) {
      case LogTypes.ERROR:
        if (not(is('test'))) this._log.error(this._message, this._payload ?? '')

        break
    }
  }
}
class LogError extends Log {
  constructor(message: string, error?: ApiError | undefined) {
    super(LogTypes.ERROR, message, makeApiResponseError(error))
    this._message = message || 'Unknown API Error'
  }
}

class LogApiError extends Log {
  constructor(message: string, error?: ApiError | undefined) {
    super(LogTypes.ERROR, message, makeApiResponseError(error))
    this._message = message || 'Unknown API Error'
  }
}

class LogApiWarning extends Log {
  constructor(message: string, payload: unknown | undefined) {
    super(LogTypes.WARNING, message, payload)

    this._message = message || 'Unknown Warning'
  }
}

export { LogError, LogApiError, LogApiWarning }
