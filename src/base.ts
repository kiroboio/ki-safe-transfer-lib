import {
  DebugLevels,
  ApiError,
  EventBus,
  EventTypes,
  Responses,
  Currencies,
  Networks,
  AuthDetails,
  Settings,
} from './types'
import { LogError, LogApiWarning, LogInfo } from './tools/log'
import { authDetailsDefaults } from './defaults'
import { version } from './config'

class Base {
  private _debug: DebugLevels = DebugLevels.MUTE

  protected _eventBus: EventBus | undefined

  protected _lastAddresses: string[] = [] // caching last addresses request

  protected _respondAs: Responses = Responses.Direct

  protected _currency: Currencies = Currencies.Bitcoin

  protected _network: Networks = Networks.Testnet

  protected _auth: AuthDetails = authDetailsDefaults

  constructor(debug: DebugLevels) {
    this._debug = debug

    if (debug === 4) this._logTechnical('➜ Service is in TECHNICAL logging mode. Tech logs are marked with ⌾.')
  }

  protected _logApiError(message: string, error?: ApiError | undefined): void {
    if (this._debug !== DebugLevels.MUTE) new LogError(message, error).make()
  }

  protected _logError(message: string, error?: Error | undefined): void {
    if (this._debug !== DebugLevels.MUTE) new LogError(message, error).make()
  }

  protected _logApiWarning(message: string, payload?: unknown | undefined): void {
    if (this._debug !== DebugLevels.MUTE && this._debug!==DebugLevels.QUIET) new LogApiWarning(message, payload).make()
  }

  protected _log(message: string, payload?: unknown | undefined): void {
   if (this._debug !== DebugLevels.MUTE && this._debug !== DebugLevels.QUIET) new LogInfo(message, payload).make()
  }

  protected _logTechnical(message: string, payload?: unknown | undefined): void {
    if (this._debug === 4) new LogInfo(`⌾ ${message}`, payload).make()
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

  public getSettings(): Settings {
    return {
      debug: this._debug,
      currency: this._currency,
      network: this._network,
      version: version,
      respondAs: this._respondAs,
    }
  }

  // get last addresses
  public getLastAddresses = (): string[] => this._lastAddresses

  // clear cached addresses
  public clearLastAddresses = (): never[] => (this._lastAddresses = [])
}

export { Base }