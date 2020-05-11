import { join, isNil, filter, assoc } from 'ramda'

import { Config } from './config'

import {
  ApiService,
  Collectable,
  CollectRequest,
  Endpoints,
  EventBus,
  Event,
  EventTypes,
  NetworkTip,
  Responses,
  Retrievable,
  Sendable,
  ServiceProps,
  Settings,
  Status,
  Switch,
  DebugLevels,
  Message,
  Results,
  Utxo,
  QueryOptions,
  Address,
  Currencies,
  Networks,
  RatesProviders,
  GetRatesProps,
  ExchangeRate,
  NetworkItem,
} from './types'
import {
  checkOwnerId,
  generateId,
  makeOptions,
  flattenAddresses,
  makeApiResponseError,
  makePropsResponseError,
  makeReturnError,
  tryCatch,
} from './tools'
import {
  validateAddress,
  validateData,
  validateObject,
  validateSettings,
  validateAuthDetails,
  validateOptions,
  validatePropsString,
  validatePropsArray,
  validatePropsAddresses,
  validateObjectWithStrings,
} from './validators'
import { TEXT } from './data'
import { Logger } from './logger'
import { LogError } from './tools/log'

/**
 * Kirobo Retrievable Transfer library class to provide convenient
 * way to use the service
 * @class
 * @name Service
 */
class Service {
  private _settings: Settings

  private _logger: Logger

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _eventBus: EventBus = (_event: Event) => {
    return
  }

  private _networks: ApiService

  private _transfers: ApiService

  private _inbox: ApiService

  private _collect: ApiService

  private _utxos: ApiService

  private _exists: ApiService

  private _rateBtcToUsd: ApiService

  private _lastAddresses: string[] = [] // caching last addresses request

  private _switch: (config: Switch) => boolean | void

  constructor(settings: ServiceProps) {
    this._validateProps(settings)

    const { debug, currency, network, respondAs, eventBus, authDetails } = settings

    if (eventBus) this._eventBus = eventBus

    this._logger = new Logger({ debug: debug ? debug : DebugLevels.MUTE })

    // store settings
    this._settings = {
      version: 'v1',
      debug: debug ?? DebugLevels.MUTE,
      currency: currency ?? Currencies.Bitcoin,
      network: network ?? Networks.Testnet,
      respondAs: respondAs || Responses.Direct,
    }

    const config = new Config({
      debug,
      currency,
      network,
      authDetails,
      logger: this._logger,
      getStatus: this.getStatus,
      refreshInbox: this._refreshInbox,
    })

    this._settings = assoc('version', config.getSettings().version, this._settings)

    this._switch = config.switch

    // set services
    this._networks = config.getService(Endpoints.Networks)
    this._transfers = config.getService(Endpoints.Transfers)
    this._inbox = config.getService(Endpoints.Inbox)
    this._collect = config.getService(Endpoints.Collect)
    this._utxos = config.getService(Endpoints.Utxos)
    this._exists = config.getService(Endpoints.Exists)
    this._rateBtcToUsd = config.getService(Endpoints.RateToUsd)

    // event listeners

    // status update
    this._networks.on('patched', (data: NetworkTip) => {
      const { height, online, fee } = data

      this._useEventBus(EventTypes.UPDATE_STATUS, { height, online, fee })
    })

    // retrievable updated
    this._transfers.on('patched', (payload: Retrievable) => {
      this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload)
    })

    // collectable removed
    this._transfers.on('removed', (payload: Collectable) => {
      this._useEventBus(EventTypes.REMOVED_RETRIEVABLE, payload)
    })

    // new collectable has been created for the previously requested address
    this._inbox.on('created', (payload: Collectable) => {
      this._useEventBus(EventTypes.CREATED_COLLECTABLE, payload)
    })

    // collectable patched
    this._inbox.on('patched', (payload: Collectable) => {
      this._useEventBus(EventTypes.UPDATED_COLLECTABLE, payload)
    })

    // collectable removed
    this._inbox.on('removed', (payload: Collectable) => {
      this._useEventBus(EventTypes.REMOVED_COLLECTABLE, payload)
    })
  }

  private _useEventBus(type: EventTypes, payload: unknown): void {
    try {
      this._eventBus({
        type,
        payload,
      })
    } catch (err) {
      this._logger.disaster(`Service: eventBus caught error, when emitting event (${type}), with payload: `, payload)
    }
  }

  private _validateProps(settings: unknown): void {
    try {
      validateSettings(settings)
      validateAuthDetails((settings as ServiceProps).authDetails)
    } catch (err) {
      new Logger({ debug: DebugLevels.MUTE }).error(`Service (validateProps) got an error. ${err.message}`)

      throw new TypeError(err.message)
    }
  }

  private async _refreshInbox(): Promise<void> {
    if (this._lastAddresses && this._lastAddresses.length) {
      let data

      try {
        data = await this._inbox.find({ query: { to: this._lastAddresses.join(';') } })
      } catch (err) {
        throw makeApiResponseError(err)
      }

      this._useEventBus(EventTypes.GET_COLLECTABLES, data)
    }
  }

  private _shouldReturnDirect(options: QueryOptions | undefined): boolean {
    if (options?.respondDirect) return true

    if (this._settings.respondAs === Responses.Direct) return true

    return false
  }

  // get last addresses
  public getLastAddresses = (): string[] => this._lastAddresses

  // clear cached addresses
  public clearLastAddresses = (): never[] => (this._lastAddresses = [])

  // show settings
  public getSettings = (): Settings => this._settings

  /**
   * Function to get the list of networks with online status for the API
   *
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getOnlineNetworks()
   * ```
   * -
   */
  public async getOnlineNetworks(options?: QueryOptions): Promise<Results<NetworkItem[]> | void> {

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getOnlineNetworks')
      }
    } catch (err) {

      /** log error */
      new LogError('Service (getOnlineNetworks) caught [validation] error.', err).make()

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<NetworkItem[]>

    /** make request */
    try {
      response = await this._networks.find({
        query: {
          online: true,
          ...makeOptions(options),
        },
      })
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (this._shouldReturnDirect(options)) return response

    this._useEventBus(EventTypes.GET_ONLINE_NETWORKS, response)
  }

  /**
   * Function to get all available rate for BTC/USD pair
   *
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getRates()
   * ```
   * -
   */
  public async getRates(options?: QueryOptions): Promise<Results<ExchangeRate[]> | void> {

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getRates')
      }
    } catch (err) {

      /** log error */
      new LogError('Service (getRates) caught [validation] error.', err).make()

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    /** make request */
    let response: Results<ExchangeRate[]>

    try {
      response = await this._rateBtcToUsd.find({})
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (this._shouldReturnDirect(options)) return response

    this._useEventBus(EventTypes.GET_BTC_TO_USD_RATES, response)
  }

  /**
   * Function to get all available rate for BTC/USD pair
   *
   * @param [Object] GetRatesProps
   * @param [RatesProviders] [GetRatesProps.provide] - optional provider to get data
   * from; default => BITFINEX
   * @param [QueryOptions] [GetRatesProps.options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getRate({provider: RatesProviders.COINGECKO })
   * ```
   * -
   */
  public async getRate(props?: GetRatesProps): Promise<ExchangeRate | void> {
    if (props) {
      const { provider, options } = props

      /** validate props */
      try {
        if (provider) validatePropsString(provider, 'Provider', 'getRate')

        /** validate options, if present */
        if (options) {
          validateOptions(options, 'getRate')
        }
      } catch (err) {

        /** log error */
        new LogError('Service (getRate) caught [validation] error.', err).make()

        /** throw appropriate error */
        throw makePropsResponseError(err)
      }
    }

    let response: ExchangeRate

    /** make request */
    try {
      response = await this._rateBtcToUsd.get(props?.provider ?? RatesProviders.BITFINEX)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (this._shouldReturnDirect(props?.options)) return response

    this._useEventBus(EventTypes.GET_BTC_TO_USD_RATE, response)
  }

  /**
   * Function to get current status from API - if API is online, block height,
   * average fee for the previous block
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getStatus()
   * ```
   * or
   *
   * ```typescript
   * service.getStatus({respondDirect: true})
   * ```*
   * -
   */
  public getStatus = async (options?: Omit<QueryOptions, 'limit' | 'skip'>): Promise<Status | void> => {
    let response: NetworkTip

    /** make request */
    try {
      response = await this._networks.get(this._settings.network)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */
    const payload: Status = {
      height: response.height,
      online: response.online,
      fee: response.fee,
    }

    if (this._shouldReturnDirect(options)) return payload

    this._useEventBus(EventTypes.UPDATE_STATUS, payload)
  }

  // TODO: add desc
  public async getUtxos(addresses: string[], options?: QueryOptions): Promise<Results<Utxo> | void> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getUtxos')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getUtxos')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getUtxos) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._utxos.find({
        query: { address: join(';', addresses), ...makeOptions(options) },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getUtxos) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.GET_UTXOS, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  public async getUsed(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getUsed')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getUtxos')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getUsed) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._exists.find({
        query: {
          address: join(';', addresses),
          ...makeOptions(options),
        },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getUsed) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      const usedAddresses = flattenAddresses(response.data as Address[])

      /** return the results */
      if (this._shouldReturnDirect(options)) return assoc('data', usedAddresses, response)

      this._useEventBus(EventTypes.GET_USED, assoc('data', usedAddresses, response))
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  /**
   * Function to check the array of addresses to find the fresh (not used)
   * ones.
   *
   * @param [Array] addresses - array of addresses (string format)
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getFresh(['xxxx', 'yyyy', 'zzzz'])
   * ```
   *
   * -
   */
  public async getFresh(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getFresh')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getFresh')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getFresh) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._exists.find({
        query: { address: join(';', addresses), ...makeOptions(options) },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getUtxos) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** flatten the results */
      const usedAddresses = flattenAddresses(response.data as Address[])

      /** filter out used ones */
      const filterFn = (address: string): boolean => !usedAddresses.includes(address)

      const freshAddresses = filter(filterFn, addresses)

      /** return the results */
      if (this._shouldReturnDirect(options)) return assoc('data', freshAddresses, response)

      this._useEventBus(EventTypes.GET_FRESH, assoc('data', freshAddresses, response))
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  /**
   * Function to request data using the 'ownerId' set before, when sending safe transfer
   *
   * @param [String] id - owner ID
   * @param [QueryOptions] [options] - options set (paging & etc.)
   *
   * @returns Promise | void
   *
   *
   */
  public async getByOwnerId(ownerId: string, options?: QueryOptions): Promise<Results<unknown> | void> {

    /** validate props */
    try {
      validatePropsString(ownerId, 'ownerId', 'getOwnerById')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getOwnerById')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getOwnerById) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._transfers.find({
        query: {
          owner: ownerId,
          ...makeOptions(options),
        },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getOwnerById) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.GET_BY_OWNER_ID, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // get retrievable by ID
  public async getRetrievable(id: string, options?: QueryOptions): Promise<Results<Retrievable> | void> {

    /** validate props */
    try {
      validatePropsString(id, 'ownerId', 'getRetrievable')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRetrievable')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getRetrievable) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      response = await this._transfers.get(id)
    } catch (err) {

      /** log error */
      this._logger.error('Service (getRetrievable) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.GET_RETRIEVABLE, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  /**
   * Function to get the retrievables transfers for the array of transaction ids.
   *
   * @param [Array] ids - array of ids (string format)
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of transaction. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getRetrievables(['xxxx', 'yyyy', 'zzzz'], { limit: 10, skip: 0 })
   * ```
   *
   * -
   */
  public async getRetrievables(ids: string[], options?: QueryOptions): Promise<Results<Retrievable[]> | void> {

    /** validate props */
    try {
      validatePropsArray(ids, 'string', 'ids', 'getRetrievables')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRetrievables')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getRetrievables) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable[]>

    /** make request */
    try {
      response = await this._transfers.find({
        query: { id: ids.join(';'), ...makeOptions(options) },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getRetrievables) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.GET_RETRIEVABLES, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // get all collectables by recipient address
  public async getCollectables(addresses: string[], options?: QueryOptions): Promise<Results<Collectable> | void> {

    /** validate props */
    try {
      validatePropsAddresses(addresses, 'addresses', 'getCollectables', this._settings)

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getCollectables')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (getCollectables) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Collectable>

    /** make request */
    try {
      response = await this._inbox.find({
        query: { to: addresses.join(';') },
      })
    } catch (err) {

      /** log error */
      this._logger.error('Service (getCollectables) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    /** cache addresses */
    this._lastAddresses = addresses

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.GET_COLLECTABLES, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // send retrievable/collectable transaction
  public async send(transaction: Sendable, options?: QueryOptions): Promise<Results<Retrievable> | void> {

    /** validate props */
    try {
      if (isNil(transaction)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(transaction, 'transaction')
      validateData(transaction, this._settings.currency, this._settings.network)

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'send')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (collect) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      response = await this._transfers.create(checkOwnerId(transaction))
    } catch (err) {

      /** log error */
      this._logger.error('Service (collect) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(
        tryCatch<{}, string, {}>(JSON.parse, err.message, { returnValue: err }),
      )
    }

    try {

      /** return the results */
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.SEND_TRANSACTION, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // collect transaction
  public async collect(request: CollectRequest, options?: QueryOptions): Promise<Results<Message> | void> {

    /** validate props */
    try {
      validateObjectWithStrings(request, 'request', 'collect')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'collect')
      }
    } catch (err) {

      /** log error */
      this._logger.error('Service (collect) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._collect.create({ ...request })
    } catch (err) {

      /** log error */
      this._logger.error('Service (collect) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {
      if (this._shouldReturnDirect(options)) return response

      this._useEventBus(EventTypes.COLLECT_TRANSACTION, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: desc
  // TODO: test
  public connect(props: Switch, options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | Message | void {
    try {
      const result = this._switch(props)

      /** return the results */
      if (this._shouldReturnDirect(options)) return result

      this._useEventBus(EventTypes.SEND_MESSAGE, result)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }
}

export * from './types'

// eslint-disable-next-line import/no-default-export
export default Service

export { Service, validateAddress, generateId }
