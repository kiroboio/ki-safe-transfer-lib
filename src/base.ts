import { DebugLevels, ApiError, EventBus, EventTypes, Responses, Currencies, Networks, AuthDetails } from './type'
import { LogError, LogApiWarning, LogInfo } from './tools/log'
import { authDetailsDefaults } from './defaults'

class Base {
  private _debug: DebugLevels = DebugLevels.MUTE

  protected _eventBus: EventBus | undefined

  protected _respondAs: Responses = Responses.Direct

  protected _currency: Currencies = Currencies.Bitcoin

  protected _network: Networks = Networks.Testnet

  protected _auth: AuthDetails = authDetailsDefaults

  constructor(debug: DebugLevels) {
    this._debug = debug
  }

  protected _logApiError(message: string, error?: ApiError | undefined): void {
    new LogError(message, error).make()
  }

  protected _logError(message: string, error?: Error | undefined): void {
    new LogError(message, error).make()
  }

  protected _logApiWarning(message: string, payload?: unknown | undefined): void {
    new LogApiWarning(message, payload).make()
  }

  protected _log(message: string, payload?: unknown | undefined): void {
    new LogInfo(message, payload).make()
  }

  protected _useEventBus(type: EventTypes, payload: unknown): void {
    if (this._eventBus) {
      try {
        this._eventBus({
          type,
          payload,
        })
      } catch (err) {
        this._logError(`Service: eventBus caught error, when emitting event (${type}).`, err)
      }
    }
  }
}

export { Base }
