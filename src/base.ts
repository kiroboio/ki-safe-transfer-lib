import { assocPath, isEmpty } from 'ramda';
import {
  DebugLevels,
  ApiError,
  EventBus,
  EventTypes,
  Responses,
  Currencies,
  Networks,
  AuthDetails,
  LastAddresses,
  Watch,
  Maybe,
  ApiService,
  Endpoints,
} from './types';
import { LogError, LogApiWarning, LogInfo, LogApiError } from './tools/log';
import { authDetailsDefaults } from './defaults';
import { version } from './config';
import { ERRORS, MESSAGES } from './text';
import { makeString } from './tools/other';
import { findInServices } from './tools/connect';

class Base {
  #debug: DebugLevels = DebugLevels.MUTE;

  protected _globalCurrency: Maybe<Currencies>;

  protected _globalNetwork: Maybe<Networks>;

  protected _eventBus: EventBus | undefined;

  protected _sessionId = 0;

  protected _lastAddresses: LastAddresses = { addresses: [] }; // caching last addresses request

  protected _respondAs: Responses = Responses.Direct;

  protected _auth: AuthDetails = authDetailsDefaults;

  protected _watch: Watch | undefined = undefined;

  protected _services: Record<string, Record<string, Record<string, ApiService>>> = {};

  public isAuthed = false;

  constructor(debug: DebugLevels) {
    this.#debug = debug;

    if (debug === 4) this._logTechnical('➜ Service is in TECHNICAL logging mode. Tech logs are marked with ⌾.');
  }

  protected _logApiError(message: string, error?: ApiError | undefined): void {
    if (this.#debug !== DebugLevels.MUTE) new LogApiError(message, error).make();
  }

  protected _logError(message: string, error?: Error | undefined): void {
    if (this.#debug !== DebugLevels.MUTE) new LogError(message, error).make();
  }

  protected _logApiWarning(message: string, payload?: unknown | undefined): void {
    if (this.#debug !== DebugLevels.MUTE && this.#debug !== DebugLevels.QUIET)
      new LogApiWarning(message, payload).make();
  }

  protected _log(message: string, payload?: unknown | undefined): void {
    if (this.#debug !== DebugLevels.MUTE && this.#debug !== DebugLevels.QUIET) new LogInfo(message, payload).make();
  }

  protected _logTechnical(message: string, payload?: unknown | undefined): void {
    if (this.#debug === 4) new LogInfo(`⌾ ${message}`, payload).make();
  }

  protected async _useEventBus(
    type: EventTypes,
    payload: unknown,
    decrypt?: (payload: Record<string, unknown>, sessionId: number) => Promise<unknown>,
  ): Promise<void> {
    if (this._eventBus) {
      try {
        this._eventBus({
          type,
          payload: decrypt && payload ? await decrypt(payload as Record<string, unknown>, this._sessionId) : payload,
        });
      } catch (err) {
        this._logError(`Service: eventBus caught error, when emitting event (${type}).`, err);
      }
    }
  }

  protected _exceededQtyLog(time: number): void {
    this._logTechnical(
      `Service (connect) exceeded MAX connection tries (${time}) and will halt the reconnection efforts.`,
    );
  }

  protected _tooEarlyToConnectLog(last: number | undefined, timeout: number): void {
    this._logTechnical(
      `Service (connect) recently (${last}) tried to connect. Will wait for ${timeout}s and try again.`,
    );
  }

  protected _authDetailsIsPresent(): string | boolean {
    if (!this._auth) return 'not present';

    if (isEmpty(this._auth)) return 'empty';

    if (!this._auth.key && !this._auth.secret) return 'key and secret is empty';

    if (!this._auth.key) return 'key is empty';

    if (!this._auth.secret) return 'secret is empty';

    return true;
  }

  /*
   * Checks through options supplied:
   *	|	if currency and network specified there -> returns them;
   *	| if currency and network specified in global on initialization -> returns them;
   *	| if nothing of above -> throws an error;
   *
   *	@params { String } currency
   *	@params { String } network
   *
   *	@returns { Object } - format: { currency: xxx, network: xxx }
   */
  protected getCurrencyNetwork<T extends Currencies>(currency: Maybe<T>, network: Maybe<Networks>) {
    if (currency && network) return { currency, network };

    if (this._globalCurrency && this._globalNetwork)
      return { currency: this._globalCurrency, network: this._globalNetwork };

    throw new Error(ERRORS.validation.missingCurrencyNetwork);
  }

  /*
   * Store service for re-use; format: { currency: { network: { endpoint: xxx }}}
   *
   * @params { Object } currencyNetwork - currency and network - will be
   * used
   * @params { Object } endpoint - endpoint for service - will be used for
   * key
   * @params { Object } service - configured service to store
   *
   */
  protected _storeService(
    currencyNetwork: { currency: Currencies; network: Networks },
    endpoint: Endpoints,
    service: ApiService,
  ) {
    const isPresent = findInServices(this._services, currencyNetwork, endpoint);

    if (!isPresent) {
      this._logTechnical(
        makeString(MESSAGES.technical.custom, [
          'storeService',
          `storing service ${currencyNetwork.currency}:${currencyNetwork.network}:${endpoint}`,
        ]),
      );

      this._services = assocPath(
        [currencyNetwork.currency, currencyNetwork.network, endpoint],
        service,
        this._services,
      );
    } else
      this._logTechnical(
        makeString(MESSAGES.technical.custom, [
          'storeService',
          `no need to store service ${currencyNetwork.currency}:${currencyNetwork.network}:${endpoint}`,
        ]),
      );
  }

  /*
   * Returns all settings set
   */
  public getSettings(): Record<string, unknown> {
    return {
      authDetails: this._authDetailsIsPresent(),
      debug: this.#debug,
      eventBus: !!this._eventBus,
      isAuthed: this.isAuthed,
      lastAddresses: this._lastAddresses,
      respondAs: this._respondAs,
      version: version,
      globalCurrency: this._globalCurrency,
      globalNetwork: this._globalNetwork,
      storedServices: this._services,
    };
  }

  /*
   * Clears all stored services
   */
  public clearStoredServices() {
    this._logTechnical(makeString(MESSAGES.technical.running, ['clearStoredServices']));

    this._services = {};
    return true;
  }
  // get last addresses
  // public getLastAddresses = (): LastAddresses => this._lastAddresses

  // clear cached addresses
  // public clearLastAddresses = (): boolean => {
  //   this._lastAddresses = { addresses: [] }
  //   return true
  // }
}

export { Base };
